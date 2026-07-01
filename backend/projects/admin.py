from django.contrib import admin

from .models import Project, ProjectFile


class ProjectFileInline(admin.TabularInline):
    model = ProjectFile
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status', 'total_files', 'updated_at')
    list_filter = ('status',)
    search_fields = ('name', 'owner__email')
    inlines = [ProjectFileInline]
