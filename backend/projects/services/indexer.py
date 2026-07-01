import hashlib
import os
import re
import zipfile
from pathlib import Path

import yaml
from django.conf import settings
from django.utils import timezone

from projects.models import Project, ProjectFile

CODE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rs', '.rb',
    '.php', '.cs', '.cpp', '.c', '.h', '.swift', '.kt', '.vue', '.sql',
}
DOC_EXTENSIONS = {'.md', '.txt', '.rst', '.pdf'}
SKIP_DIRS = {
    'node_modules', '.git', '__pycache__', '.venv', 'venv', 'dist',
    'build', '.next', 'coverage', '.idea', '.vscode',
}


def _project_media_dir(project_id: int) -> Path:
    path = Path(settings.MEDIA_ROOT) / 'projects' / str(project_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _safe_extract(zip_path: Path, dest: Path) -> None:
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for member in zf.infolist():
            target = (dest / member.filename).resolve()
            if not str(target).startswith(str(dest.resolve())):
                continue
            zf.extract(member, dest)


def _count_files(root: Path) -> int:
    count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        count += len(filenames)
    return count


def _infer_node_type(name: str, path: Path, is_dir: bool) -> str:
    lower = name.lower()
    if is_dir:
        if lower in ('api', 'apis', 'routes'):
            return 'api'
        if lower in ('services', 'service'):
            return 'folder'
        return 'folder'
    if lower.endswith('_service.py') or lower.endswith('service.py'):
        return 'service'
    if lower == 'models.py' or lower.endswith('_model.py'):
        return 'entity'
    if lower in ('urls.py', 'routes.py', 'router.py'):
        return 'api'
    if lower.endswith(('.yaml', '.yml', '.json')) and 'swagger' in str(path).lower():
        return 'file'
    return 'file'


def build_tree(root: Path, rel: Path | None = None) -> dict:
    rel = rel or Path('.')
    current = root / rel if str(rel) != '.' else root
    name = root.name if str(rel) == '.' else rel.name
    node_id = hashlib.md5(str(rel).encode()).hexdigest()[:12]

    if current.is_file():
        return {
            'id': node_id,
            'name': name,
            'type': _infer_node_type(name, current, False),
        }

    children = []
    try:
        entries = sorted(current.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
    except PermissionError:
        entries = []

    for entry in entries:
        if entry.name in SKIP_DIRS or entry.name.startswith('.'):
            continue
        child_rel = entry.relative_to(root)
        if entry.is_dir():
            children.append(build_tree(root, child_rel))
        else:
            children.append(build_tree(root, child_rel))

    node_type = 'folder' if str(rel) == '.' else _infer_node_type(name, current, True)
    if any(c['type'] == 'module' for c in children) or name in ('auth', 'users', 'payments', 'components'):
        if node_type == 'folder' and not str(rel) == '.':
            node_type = 'module'

    return {
        'id': node_id,
        'name': name,
        'type': node_type,
        'children': children,
    }


def _parse_openapi_endpoints(file_path: Path) -> list[dict]:
    endpoints = []
    try:
        text = file_path.read_text(encoding='utf-8', errors='ignore')
        if file_path.suffix in ('.yaml', '.yml'):
            spec = yaml.safe_load(text)
        else:
            import json
            spec = json.loads(text)
        paths = spec.get('paths', {}) if isinstance(spec, dict) else {}
        for path, methods in paths.items():
            if not isinstance(methods, dict):
                continue
            for method, _detail in methods.items():
                if method.upper() in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'):
                    endpoints.append({
                        'id': hashlib.md5(f'{method}{path}'.encode()).hexdigest()[:12],
                        'name': f'{method.upper()} {path}',
                        'type': 'endpoint',
                    })
    except Exception:
        pass
    return endpoints


def _scan_api_patterns(root: Path) -> list[dict]:
    endpoints = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            fpath = Path(dirpath) / fname
            rel = fpath.relative_to(root)
            if fname in ('openapi.yaml', 'openapi.yml', 'swagger.yaml', 'swagger.json'):
                endpoints.extend(_parse_openapi_endpoints(fpath))
            elif fname == 'urls.py':
                try:
                    content = fpath.read_text(encoding='utf-8', errors='ignore')
                    for match in re.finditer(r"path\(['\"]([^'\"]+)['\"]", content):
                        endpoints.append({
                            'id': hashlib.md5(match.group(1).encode()).hexdigest()[:12],
                            'name': match.group(1),
                            'type': 'endpoint',
                        })
                except Exception:
                    pass
    return endpoints[:50]


def build_architecture_map(project_name: str, modules: list[str], endpoints: list[dict]) -> dict:
    client_nodes = [
        {'id': 'react-app', 'label': 'React SPA', 'type': 'client', 'detail': 'Vite + React Router'},
        {'id': 'pages', 'label': 'Pages', 'type': 'module', 'detail': 'Route pages'},
        {'id': 'components', 'label': 'Components', 'type': 'module', 'detail': 'UI components'},
    ]
    api_nodes = endpoints[:6] or [
        {'id': 'api-default', 'label': 'REST API', 'type': 'endpoint', 'detail': 'Project endpoints'},
    ]
    for i, ep in enumerate(api_nodes):
        if 'label' not in ep:
            api_nodes[i] = {
                'id': ep.get('id', f'ep-{i}'),
                'label': ep.get('name', 'endpoint'),
                'type': 'endpoint',
                'detail': 'Detected route',
            }

    backend_nodes = [
        {'id': f'mod-{m}', 'label': m, 'type': 'module', 'detail': f'{m} module'}
        for m in modules[:6]
    ] or [{'id': 'backend-core', 'label': 'core', 'type': 'module', 'detail': 'Main backend'}]

    data_nodes = [
        {'id': 'mysql', 'label': 'MySQL', 'type': 'database', 'detail': 'Relational data'},
        {'id': 'chromadb', 'label': 'ChromaDB', 'type': 'database', 'detail': 'Code embeddings'},
        {'id': 'ollama', 'label': 'Ollama', 'type': 'external', 'detail': 'LLM inference'},
    ]

    flows = []
    if api_nodes:
        flows.append({'from': 'react-app', 'to': api_nodes[0]['id'], 'label': 'HTTP'})
    for i, mod in enumerate(backend_nodes):
        target = api_nodes[min(i, len(api_nodes) - 1)]['id'] if api_nodes else 'react-app'
        flows.append({'from': target, 'to': mod['id'], 'label': 'route'})
        flows.append({'from': mod['id'], 'to': 'mysql', 'label': 'persist'})
    flows.append({'from': 'components', 'to': 'chromadb', 'label': 'index'})
    flows.append({'from': 'chromadb', 'to': 'ollama', 'label': 'RAG'})

    return {
        'layers': [
            {'id': 'client', 'label': 'Client Layer', 'description': f'{project_name} frontend', 'nodes': client_nodes},
            {'id': 'api', 'label': 'API Layer', 'description': 'REST endpoints', 'nodes': [
                {'id': n['id'], 'label': n['label'], 'type': n.get('type', 'endpoint'), 'detail': n.get('detail', '')}
                for n in api_nodes
            ]},
            {'id': 'backend', 'label': 'Backend Modules', 'description': 'Domain logic', 'nodes': backend_nodes},
            {'id': 'data', 'label': 'Data & External', 'description': 'Storage & AI', 'nodes': data_nodes},
        ],
        'flows': flows,
    }


def build_dependency_graph(modules: list[str], endpoints: list[dict]) -> dict:
    nodes = [
        {'id': 'frontend', 'label': 'frontend', 'type': 'client', 'x': 400, 'y': 40},
        {'id': 'api-v1', 'label': 'api', 'type': 'api', 'x': 400, 'y': 130},
    ]
    edges = [{'from': 'frontend', 'to': 'api-v1', 'label': 'HTTP'}]

    x_positions = [160, 400, 640, 280, 520]
    for i, mod in enumerate(modules[:5]):
        nid = f'mod-{mod}'
        nodes.append({
            'id': nid,
            'label': mod,
            'type': 'module',
            'x': x_positions[i % len(x_positions)],
            'y': 240,
        })
        edges.append({'from': 'api-v1', 'to': nid, 'label': 'routes'})
        if i > 0:
            edges.append({'from': f'mod-{modules[0]}', 'to': nid, 'label': 'imports'})

    nodes.extend([
        {'id': 'mysql', 'label': 'MySQL', 'type': 'database', 'x': 280, 'y': 380},
        {'id': 'chromadb', 'label': 'ChromaDB', 'type': 'database', 'x': 520, 'y': 380},
    ])
    for mod in modules[:3]:
        edges.append({'from': f'mod-{mod}', 'to': 'mysql', 'label': 'ORM'})
    edges.append({'from': 'frontend', 'to': 'chromadb', 'label': 'index'})

    return {'nodes': nodes, 'edges': edges}


def _collect_modules(root: Path) -> list[str]:
    modules = []
    for entry in root.iterdir():
        if entry.is_dir() and entry.name not in SKIP_DIRS and not entry.name.startswith('.'):
            if any(entry.glob('*.py')) or any(entry.glob('*.js')) or any(entry.glob('*.ts')):
                modules.append(entry.name)
    return modules[:10]


def index_project(project: Project) -> None:
    project.status = Project.STATUS_INDEXING
    project.save(update_fields=['status', 'updated_at'])

    try:
        media_dir = _project_media_dir(project.id)
        extract_dir = media_dir / 'extracted'
        extract_dir.mkdir(parents=True, exist_ok=True)

        for pf in project.files.filter(file_type=ProjectFile.TYPE_ZIP):
            zip_path = Path(pf.stored_path)
            if zip_path.exists():
                _safe_extract(zip_path, extract_dir)

        root = extract_dir
        if not any(extract_dir.iterdir()) if extract_dir.exists() else True:
            # Use uploaded docs/swagger as minimal index target
            for pf in project.files.all():
                src = Path(pf.stored_path)
                if src.exists() and src.is_file():
                    dest = extract_dir / pf.original_name
                    if not dest.exists():
                        dest.write_bytes(src.read_bytes())

        project.extract_path = str(extract_dir)
        project.total_files = _count_files(extract_dir) if extract_dir.exists() else 0

        modules = _collect_modules(extract_dir) if extract_dir.exists() else []
        endpoints = _scan_api_patterns(extract_dir) if extract_dir.exists() else []

        project.apis_count = len(endpoints)
        project.docs_count = project.files.filter(file_type=ProjectFile.TYPE_DOCS).count()
        project.architecture_tree = build_tree(extract_dir) if extract_dir.exists() and any(extract_dir.iterdir()) else {
            'id': 'root',
            'name': project.name,
            'type': 'folder',
            'children': [],
        }
        project.architecture_map = build_architecture_map(project.name, modules, endpoints)
        project.dependency_graph = build_dependency_graph(modules, endpoints)

        from projects.services.embeddings import index_project_embeddings
        index_project_embeddings(project, extract_dir)

        project.status = Project.STATUS_INDEXED
        project.last_indexed = timezone.now()
        project.index_error = ''
    except Exception as exc:
        project.status = Project.STATUS_ERROR
        project.index_error = str(exc)
    project.save()
