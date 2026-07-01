import os
import threading
import uuid
from pathlib import Path

from django.conf import settings
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
