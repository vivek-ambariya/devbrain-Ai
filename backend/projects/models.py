from django.conf import settings
from django.db import models

from accounts.models import User


class Project(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_INDEXING = 'indexing'
    STATUS_INDEXED = 'indexed'
    STATUS_ERROR = 'error'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_INDEXING, 'Indexing'),
        (STATUS_INDEXED, 'Indexed'),
        (STATUS_ERROR, 'Error'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    total_files = models.PositiveIntegerField(default=0)
    apis_count = models.PositiveIntegerField(default=0)
    docs_count = models.PositiveIntegerField(default=0)
    upload_date = models.DateTimeField(auto_now_add=True)
    last_indexed = models.DateTimeField(null=True, blank=True)
    extract_path = models.CharField(max_length=512, blank=True)
    architecture_tree = models.JSONField(default=dict, blank=True)
    architecture_map = models.JSONField(default=dict, blank=True)
    dependency_graph = models.JSONField(default=dict, blank=True)
    index_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name


class ProjectFile(models.Model):
    TYPE_ZIP = 'zip'
    TYPE_SWAGGER = 'swagger'
    TYPE_DOCS = 'docs'
    TYPE_CHOICES = [
        (TYPE_ZIP, 'ZIP Repository'),
        (TYPE_SWAGGER, 'Swagger/OpenAPI'),
        (TYPE_DOCS, 'Documentation'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    original_name = models.CharField(max_length=255)
    stored_path = models.CharField(max_length=512)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
