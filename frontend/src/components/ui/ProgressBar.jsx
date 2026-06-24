import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function ProgressBar({ value = 0, className, showLabel = true, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, value))
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-text-secondary">Upload progress</span>
          <span className="text-xs font-medium text-text-primary">{clamped}%</span>
        </div>
      )}
      <div
        className={cn('w-full rounded-full bg-bg-primary border border-border overflow-hidden', heights[size])}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
