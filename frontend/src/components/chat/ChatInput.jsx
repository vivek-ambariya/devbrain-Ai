import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

export default function ChatInput({ onSend, disabled = false, suggestions = [] }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || disabled) return
    onSend(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-border bg-bg-primary p-3">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((q) => (
            <button
              key={q}
              onClick={() => onSend(q)}
              disabled={disabled}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium',
                'border border-border bg-bg-card text-text-secondary',
                'hover:text-text-primary hover:border-accent/50 hover:bg-accent/5',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your project..."
            disabled={disabled}
            rows={1}
            aria-label="Chat message"
            className={cn(
              'w-full px-3 py-2 rounded-md text-sm resize-none',
              'bg-bg-primary border border-border text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:border-accent-emphasis focus:shadow-[0_0_0_3px_rgba(31,111,235,0.3)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="!h-8 shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
