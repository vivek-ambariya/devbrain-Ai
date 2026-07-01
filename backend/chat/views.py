from django.http import StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .views_stream import generate_response_stream


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = Conversation.objects.filter(owner=self.request.user).select_related('project')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        title = request.data.get('title', 'New conversation')
        if not project_id:
            return Response({'detail': 'project is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(pk=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        conv = Conversation.objects.create(owner=request.user, project=project, title=title)
        return Response(ConversationSerializer(conv).data, status=status.HTTP_201_CREATED)


class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_conversation(self, request, pk):
        return Conversation.objects.get(pk=pk, owner=request.user)

    def get(self, request, pk):
        try:
            conv = self._get_conversation(request, pk)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        messages = conv.messages.all()
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        try:
            conv = self._get_conversation(request, pk)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'content is required.'}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(conversation=conv, role=Message.ROLE_USER, content=content)
        conv.preview = content[:200]
        conv.save(update_fields=['preview', 'updated_at'])
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class ConversationStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, owner=request.user)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        Message.objects.create(conversation=conv, role=Message.ROLE_USER, content=content)
        history = [
            {'role': m.role, 'content': m.content}
            for m in conv.messages.order_by('created_at')
        ]
        accumulated = []

        def event_stream():
            for token in generate_response_stream(conv.project_id, content, history[:-1]):
                accumulated.append(token)
                yield token
            full = ''.join(accumulated)
            Message.objects.create(conversation=conv, role=Message.ROLE_ASSISTANT, content=full)
            conv.preview = full[:200]
            if conv.title == 'New conversation':
                conv.title = content[:40]
            conv.save(update_fields=['preview', 'title', 'updated_at'])

        return StreamingHttpResponse(event_stream(), content_type='text/plain; charset=utf-8')
