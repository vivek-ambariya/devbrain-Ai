import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import ConversationList from '../components/chat/ConversationList'
import ChatMessage from '../components/chat/ChatMessage'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  streamAIResponse,
} from '../api/chat'
import { getProjects } from '../api/projects'
import { suggestedQuestions } from '../utils/mockData'

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pendingQuery = useRef(searchParams.get('q'))
  const [defaultProjectId, setDefaultProjectId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef(null)
  const sendRef = useRef(null)

  useEffect(() => {
    Promise.all([getConversations(), getProjects()]).then(([convData, projects]) => {
      setConversations(convData)
      if (projects.length > 0) setDefaultProjectId(projects[0].id)
      if (convData.length > 0) setActiveId(convData[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const q = pendingQuery.current
    if (!q || loading) return
    pendingQuery.current = null
    setSearchParams({}, { replace: true })
    sendRef.current?.(q)
  }, [loading, setSearchParams])

  useEffect(() => {
    if (!activeId) return
    getMessages(activeId).then(setMessages)
  }, [activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleNewConversation = async () => {
    if (!defaultProjectId) return
    const conv = await createConversation(defaultProjectId, 'New conversation')
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setMessages([])
  }

  const handleSend = async (content) => {
    let convId = activeId

    if (!convId) {
      if (!defaultProjectId) return
      const conv = await createConversation(defaultProjectId, content.slice(0, 40))
      setConversations((prev) => [conv, ...prev])
      setActiveId(conv.id)
      convId = conv.id
    }

    const userMsg = await sendMessage(convId, content)
    setMessages((prev) => [...prev, userMsg])

    setStreaming(true)
    setStreamingContent('')
    let finalContent = ''

    try {
      for await (const chunk of streamAIResponse(convId, content)) {
        finalContent = chunk
        setStreamingContent(chunk)
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setStreaming(false)
      setStreamingContent('')
    }
  }

  sendRef.current = handleSend

  const displayMessages = streaming && streamingContent
    ? [
        ...messages,
        {
          id: 'streaming',
          role: 'assistant',
          content: streamingContent,
          timestamp: new Date().toISOString(),
        },
      ]
    : messages

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mx-4 lg:-mx-6 -mt-6">
      <div className="px-4 lg:px-6 py-4 border-b border-border bg-bg-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Copilot</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Ask questions about your indexed codebase
        </p>
      </div>

      <div className="flex flex-1 min-h-0 border-b border-border">
        <aside className="hidden md:flex w-64 border-r border-border bg-bg-sidebar flex-col shrink-0">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={handleNewConversation}
            loading={loading}
          />
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {displayMessages.length === 0 && !streaming ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="h-12 w-12 rounded-md bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-text-muted" />
                </div>
                <h2 className="text-base font-semibold text-text-primary mb-2">
                  Ask Copilot about your codebase
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Get answers about architecture, APIs, authentication, and more.
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
              {displayMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={msg.id === 'streaming'}
                />
              ))}
              {streaming && !streamingContent && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}

          <ChatInput
            onSend={handleSend}
            disabled={streaming}
            suggestions={displayMessages.length === 0 ? suggestedQuestions : []}
          />
        </div>
      </div>
    </div>
  )
}
