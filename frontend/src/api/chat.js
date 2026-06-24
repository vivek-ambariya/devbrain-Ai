import api from './axios'
import { mockConversations, mockChatMessages } from '../utils/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export async function getConversations(projectId) {
  if (USE_MOCK) {
    return projectId
      ? mockConversations.filter((c) => c.projectId === projectId)
      : mockConversations
  }
  const { data } = await api.get('/chat/conversations/', { params: { project: projectId } })
  return data
}

export async function getMessages(conversationId) {
  if (USE_MOCK) return mockChatMessages
  const { data } = await api.get(`/chat/conversations/${conversationId}/messages/`)
  return data
}

export async function createConversation(projectId, title) {
  if (USE_MOCK) {
    return {
      id: `c${Date.now()}`,
      title: title || 'New conversation',
      projectId,
      updatedAt: new Date().toISOString(),
      preview: '',
    }
  }
  const { data } = await api.post('/chat/conversations/', { project: projectId, title })
  return data
}

export async function sendMessage(conversationId, content) {
  if (USE_MOCK) {
    return {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
  }
  const { data } = await api.post(`/chat/conversations/${conversationId}/messages/`, { content })
  return data
}

export async function* streamAIResponse(conversationId, content) {
  if (USE_MOCK) {
    const response = `Based on my analysis of your codebase, here's what I found regarding **"${content}"**:

## Summary

The relevant code is distributed across multiple modules. Key files include authentication handlers, middleware, and API serializers.

### Key Files
- \`auth/views.py\` - Main authentication endpoints
- \`auth/serializers.py\` - User validation logic
- \`auth/middleware.py\` - Token verification

\`\`\`python
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(get_tokens_for_user(serializer.user))
\`\`\`

Would you like me to dive deeper into any specific aspect?`

    const words = response.split(' ')
    let accumulated = ''
    for (const word of words) {
      accumulated += (accumulated ? ' ' : '') + word
      yield accumulated
      await new Promise((r) => setTimeout(r, 30))
    }
    return
  }

  const response = await fetch(`/api/chat/conversations/${conversationId}/stream/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify({ content }),
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    accumulated += decoder.decode(value, { stream: true })
    yield accumulated
  }
}
