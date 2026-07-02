import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end" aria-label="AI is typing">
      <div className="h-8 w-8 rounded-lg bg-bg-sidebar border border-border flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-success animate-pulse" />
      </div>
      
      <div className="relative rounded-2xl px-5 py-3.5 bg-bg-card border border-border flex items-center justify-center min-w-[70px] overflow-hidden shadow-sm">
        {/* Subtle pulsing background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-accent/5 opacity-50 animate-pulse pointer-events-none" />
        
        <div className="flex gap-1.5 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-accent"
              animate={{
                y: [0, -4, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
