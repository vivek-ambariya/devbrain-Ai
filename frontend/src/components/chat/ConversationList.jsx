import { motion } from 'framer-motion'
import { MessageSquare, Plus } from 'lucide-react'
import { formatRelativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  loading = false,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={onNew} className="w-full" size="sm">
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-8 w-8 text-text-secondary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-colors duration-200',
                activeId === conv.id
                  ? 'bg-accent/10 border border-accent/20'
                  : 'hover:bg-white/5 border border-transparent'
              )}
            >
              <p className="text-sm font-medium text-text-primary truncate">{conv.title}</p>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{conv.preview}</p>
              <p className="text-[10px] text-text-secondary mt-1.5">
                {formatRelativeTime(conv.updatedAt)}
              </p>
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}
