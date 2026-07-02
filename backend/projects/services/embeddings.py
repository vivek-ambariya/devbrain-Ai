import os
import logging
from pathlib import Path
from django.conf import settings

_client = None

SKIP_DIRS = {
    'node_modules', '.git', '__pycache__', '.venv', 'venv', 'dist',
    'build', '.next', 'coverage',
}
CODE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.md', '.yaml', '.yml', '.json',
}
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200


def get_chroma_client():
    global _client
    if _client is None:
        import chromadb
        persist_dir = settings.CHROMA_PERSIST_DIR
        os.makedirs(persist_dir, exist_ok=True)
        _client = chromadb.PersistentClient(path=persist_dir)
    return _client


def _collection_name(project_id: int) -> str:
    return f'project_{project_id}'


def _chunk_text(text: str, path: str) -> list[dict]:
    chunks = []
    start = 0
    idx = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        if chunk.strip():
            chunks.append({
                'id': f'{path}::{idx}',
                'text': chunk,
                'metadata': {'path': path, 'chunk': idx},
            })
            idx += 1
        start = end - CHUNK_OVERLAP
    return chunks


def _iter_code_files(root: Path):
    if not root.exists():
        return
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            fpath = Path(dirpath) / fname
            if fpath.suffix.lower() in CODE_EXTENSIONS:
                yield fpath


_default_ef = None
_embedding_cache = {}
logger = logging.getLogger(__name__)


def get_embedding_function():
    global _default_ef
    if _default_ef is None:
        from chromadb.utils import embedding_functions
        _default_ef = embedding_functions.DefaultEmbeddingFunction()
    return _default_ef


def _embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    result = [None] * len(texts)
    to_embed = []
    to_embed_indices = []

    # Check cache first
    for idx, text in enumerate(texts):
        if text in _embedding_cache:
            result[idx] = _embedding_cache[text]
        else:
            to_embed.append(text)
            to_embed_indices.append(idx)

    # Generate missing embeddings
    if to_embed:
        try:
            ef = get_embedding_function()
            embeddings = ef(to_embed)
            for idx, embedding in zip(to_embed_indices, embeddings):
                _embedding_cache[texts[idx]] = embedding
                result[idx] = embedding
        except Exception as e:
            logger.warning(
                f"ChromaDB default embedding function failed: {e}. "
                f"Falling back to pseudo-embeddings."
            )
            import hashlib
            for idx in to_embed_indices:
                text = texts[idx]
                h = hashlib.sha256(text.encode()).digest()
                vec = [((h[i % 32] - 128) / 128.0) for i in range(384)]
                _embedding_cache[text] = vec
                result[idx] = vec

    return result


def index_project_embeddings(project, extract_dir: Path) -> int:
    client = get_chroma_client()
    name = _collection_name(project.id)
    try:
        client.delete_collection(name)
    except Exception:
        pass
    collection = client.get_or_create_collection(name=name, metadata={'project_id': project.id})

    all_chunks = []
    for fpath in _iter_code_files(extract_dir):
        try:
            rel = str(fpath.relative_to(extract_dir))
            text = fpath.read_text(encoding='utf-8', errors='ignore')
            if len(text.strip()) < 20:
                continue
            all_chunks.extend(_chunk_text(text, rel))
        except Exception:
            continue

    if not all_chunks:
        return 0

    batch_size = 32
    indexed = 0
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i + batch_size]
        texts = [c['text'] for c in batch]
        embeddings = _embed_texts(texts)
        collection.add(
            ids=[c['id'] for c in batch],
            documents=texts,
            embeddings=embeddings,
            metadatas=[c['metadata'] for c in batch],
        )
        indexed += len(batch)
    return indexed


def query_project_context(project_id: int, query: str, n_results: int = 5) -> list[dict]:
    client = get_chroma_client()
    name = _collection_name(project_id)
    try:
        collection = client.get_collection(name)
    except Exception:
        return []

    try:
        query_embedding = _embed_texts([query])[0]
        results = collection.query(query_embeddings=[query_embedding], n_results=n_results)
        docs = results.get('documents', [[]])[0]
        metas = results.get('metadatas', [[]])[0]
        return [{'text': d, 'path': m.get('path', '')} for d, m in zip(docs, metas)]
    except Exception:
        return []
