from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    uploadDate = serializers.DateTimeField(source='upload_date', read_only=True)
    totalFiles = serializers.IntegerField(source='total_files', read_only=True)
    lastIndexed = serializers.DateTimeField(source='last_indexed', read_only=True, allow_null=True)
    apisCount = serializers.IntegerField(source='apis_count', read_only=True)
    docsCount = serializers.IntegerField(source='docs_count', read_only=True)

    class Meta:
        model = Project
        fields = (
            'id',
            'name',
            'description',
            'uploadDate',
            'totalFiles',
            'status',
            'lastIndexed',
            'apisCount',
            'docsCount',
        )
        read_only_fields = (
            'id',
            'uploadDate',
            'totalFiles',
            'status',
            'lastIndexed',
            'apisCount',
            'docsCount',
        )


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('name', 'description')
