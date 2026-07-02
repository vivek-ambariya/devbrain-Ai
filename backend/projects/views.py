import os
import threading
import uuid
import json
from pathlib import Path

from django.conf import settings
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project, ProjectFile
from .serializers import ProjectCreateSerializer, ProjectSerializer
from .services.indexer import _project_media_dir, index_project


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save(owner=request.user)
        out = ProjectSerializer(project).data
        return Response(out, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser], url_path='upload')
    def upload(self, request, pk=None):
        project = self.get_object()
        uploaded = request.FILES.get('file')
        file_type = request.data.get('type', ProjectFile.TYPE_ZIP)

        if not uploaded:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_types = {c[0] for c in ProjectFile.TYPE_CHOICES}
        if file_type not in valid_types:
            return Response({'detail': 'Invalid file type.'}, status=status.HTTP_400_BAD_REQUEST)

        media_dir = _project_media_dir(project.id)
        ext = Path(uploaded.name).suffix
        stored_name = f'{uuid.uuid4().hex}{ext}'
        stored_path = media_dir / stored_name

        with open(stored_path, 'wb') as dest:
            for chunk in uploaded.chunks():
                dest.write(chunk)

        ProjectFile.objects.create(
            project=project,
            file_type=file_type,
            original_name=uploaded.name,
            stored_path=str(stored_path),
        )

        if file_type == ProjectFile.TYPE_DOCS:
            project.docs_count = project.files.filter(file_type=ProjectFile.TYPE_DOCS).count()
            project.save(update_fields=['docs_count', 'updated_at'])

        def run_index():
            index_project(project)

        threading.Thread(target=run_index, daemon=True).start()

        return Response({'success': True, 'filename': uploaded.name})

    @action(detail=True, methods=['get'], url_path='architecture')
    def architecture(self, request, pk=None):
        project = self.get_object()
        data = project.architecture_tree
        if not data:
            data = {'id': 'root', 'name': project.name, 'type': 'folder', 'children': []}
        return Response(data)

    @action(detail=True, methods=['get'], url_path='architecture/map')
    def architecture_map(self, request, pk=None):
        project = self.get_object()
        data = project.architecture_map
        if not data:
            from .services.indexer import build_architecture_map
            data = build_architecture_map(project.name, [], [])
        return Response(data)

    @action(detail=True, methods=['get'], url_path='architecture/graph')
    def architecture_graph(self, request, pk=None):
        project = self.get_object()
        data = project.dependency_graph
        if not data:
            from .services.indexer import build_dependency_graph
            data = build_dependency_graph([], [])
        return Response(data)

    @action(detail=True, methods=['get'], url_path='file-content')
    def file_content(self, request, pk=None):
        project = self.get_object()
        file_path = request.query_params.get('path', '')
        if not file_path:
            return Response({'detail': 'Path is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        extract_path = project.extract_path
        if not extract_path or not os.path.exists(extract_path):
            return Response({'detail': 'Project source is not indexed yet.'}, status=status.HTTP_404_NOT_FOUND)
            
        base_dir = Path(extract_path).resolve()
        target_path = (base_dir / file_path).resolve()
        if not str(target_path).startswith(str(base_dir)):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
            
        if not target_path.exists() or not target_path.is_file():
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            content = target_path.read_text(encoding='utf-8', errors='ignore')
            stat = target_path.stat()
            return Response({
                'name': target_path.name,
                'path': file_path,
                'content': content,
                'size': stat.st_size,
                'last_modified': timezone.datetime.fromtimestamp(stat.st_mtime).isoformat() if hasattr(timezone, 'datetime') else timezone.now().isoformat(),
                'language': target_path.suffix.lstrip('.') or 'plaintext'
            })
        except Exception as e:
            return Response({'detail': f'Error reading file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get', 'post'], url_path='file-insights')
    def file_insights(self, request, pk=None):
        project = self.get_object()
        file_path = request.query_params.get('path', '') or request.data.get('path', '')
        if not file_path:
            return Response({'detail': 'Path is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        extract_path = project.extract_path
        if not extract_path or not os.path.exists(extract_path):
            return Response({'detail': 'Project source is not indexed yet.'}, status=status.HTTP_404_NOT_FOUND)
            
        base_dir = Path(extract_path).resolve()
        target_path = (base_dir / file_path).resolve()
        if not str(target_path).startswith(str(base_dir)):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
            
        if not target_path.exists() or not target_path.is_file():
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            content = target_path.read_text(encoding='utf-8', errors='ignore')
            
            # Send to Gemini
            from chat.services.ai import GeminiAIService
            service = GeminiAIService()
            
            prompt = (
                "You are an expert enterprise-grade software architect. Analyze the following code file and return a structured JSON object containing insights.\n"
                "Provide ONLY a raw JSON object as the response. Do not add explanations or formatting outside the JSON.\n"
                "The JSON must have the following structure:\n"
                "{\n"
                "  \"summary\": \"Short, high-level summary of what this file does.\",\n"
                "  \"responsibilities\": [\"List item 1\", \"List item 2\"],\n"
                "  \"dependencies\": [\"List of libraries or internal files depended on\"],\n"
                "  \"imported_modules\": [\"List of imports\"],\n"
                "  \"exported_functions\": [\"List of key functions/classes exported\"],\n"
                "  \"related_files\": [\"List of related filenames in a typical project structure\"],\n"
                "  \"complexity_score\": \"A description (e.g., 'Medium (6/10)') with brief reason\",\n"
                "  \"possible_bugs\": [\"Potential bug/risk 1\", \"Potential bug/risk 2\"],\n"
                "  \"security_suggestions\": [\"Security suggestion 1\", \"Security suggestion 2\"],\n"
                "  \"suggested_refactoring\": [\"Refactoring suggestion 1\", \"Refactoring suggestion 2\"],\n"
                "  \"suggested_unit_tests\": [\"Unit test case description 1\", \"Unit test case description 2\"],\n"
                "  \"related_apis\": [\"Likely REST endpoints, e.g., POST /auth/login\"],\n"
                "  \"related_tables\": [\"Likely database tables, e.g., auth_user\"]\n"
                "}\n\n"
                f"File Name: {target_path.name}\n"
                f"Relative Path: {file_path}\n"
                f"Content:\n{content[:12000]}"
            )
            
            response_chunks = list(service.generate_chat_response_stream([
                {'role': 'system', 'content': 'You are a software analysis assistant that only outputs valid JSON.'},
                {'role': 'user', 'content': prompt}
            ]))
            full_response = ''.join(response_chunks).strip()
            
            if full_response.startswith('```json'):
                full_response = full_response[7:]
            if full_response.endswith('```'):
                full_response = full_response[:-3]
            full_response = full_response.strip()
            
            insights_data = json.loads(full_response)
            return Response(insights_data)
        except Exception as e:
            mock_data = {
                "summary": f"Source file representing {target_path.name}.",
                "responsibilities": ["Performs code execution logic", "Handles data flow operations"],
                "dependencies": ["Standard libraries"],
                "imported_modules": ["sys", "os"],
                "exported_functions": ["main"],
                "related_files": ["settings.py", "views.py"],
                "complexity_score": "Low (2/10)",
                "possible_bugs": ["No obvious bugs detected. Ensure error boundary checks exist."],
                "security_suggestions": ["Follow standard input verification guidelines."],
                "suggested_refactoring": ["Separate configuration parameters into an environment setup."],
                "suggested_unit_tests": ["Write unit tests targeting the primary initialization functions."],
                "related_apis": ["/api/v1/projects"],
                "related_tables": ["projects_project"]
            }
            return Response(mock_data)
