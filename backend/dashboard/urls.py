from django.urls import path

from .views import DashboardStatsView, RecentProjectsView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view()),
    path('recent-projects/', RecentProjectsView.as_view()),
]
