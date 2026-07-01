from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'role', 'content', 'timestamp')


class ConversationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    projectId = serializers.CharField(source='project_id', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'title', 'projectId', 'updatedAt', 'preview')
