import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Copy, Check } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import { formatDateTime } from '../../utils/format'
import { cn } from '../../utils/cn'

export default function ChatMessage({ message, isStreaming = false }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
          isUser ? 'bg-accent/10 border border-accent/20' : 'bg-bg-sidebar border border-border'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-accent" />
        ) : (
          <Bot className="h-4 w-4 text-success" />
        )}
      </div>

      <div className={cn('flex-1 min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-xl px-4 py-3',
            isUser
              ? 'bg-accent/10 border border-accent/20'
              : 'bg-bg-card border border-border'
          )}
        >
          {isUser ? (
            <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" aria-hidden="true" />
          )}
        </div>

        <div className={cn('flex items-center gap-2 mt-1.5', isUser && 'flex-row-reverse')}>
          <span className="text-[10px] text-text-secondary">
            {formatDateTime(message.timestamp)}
          </span>
          {!isUser && !isStreaming && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-border/40 bg-bg-sidebar/50 text-[10px] text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-sidebar transition-all cursor-pointer"
              aria-label="Copy response"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-success font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
