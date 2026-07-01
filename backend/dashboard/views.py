from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from projects.serializers import ProjectSerializer


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(owner=request.user)
        agg = projects.aggregate(
            total_files=Sum('total_files'),
            apis=Sum('apis_count'),
            docs=Sum('docs_count'),
        )
        return Response({
            'totalProjects': projects.count(),
            'indexedFiles': agg['total_files'] or 0,
            'apisDetected': agg['apis'] or 0,
            'documentsIndexed': agg['docs'] or 0,
        })


class RecentProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(owner=request.user).order_by('-updated_at')[:5]
        return Response(ProjectSerializer(projects, many=True).data)
