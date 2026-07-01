from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ConversationMessagesView, ConversationStreamView, ConversationViewSet

router = DefaultRouter()
router.register('conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('conversations/<int:pk>/messages/', ConversationMessagesView.as_view()),
    path('conversations/<int:pk>/stream/', ConversationStreamView.as_view()),
]
