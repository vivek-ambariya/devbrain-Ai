import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-bg-subtle text-text-secondary border-border',
  success: 'bg-[rgba(63,185,80,0.15)] text-success border-[rgba(63,185,80,0.4)]',
  warning: 'bg-[rgba(210,153,34,0.15)] text-warning border-[rgba(210,153,34,0.4)]',
  error: 'bg-[rgba(248,81,73,0.15)] text-error border-[rgba(248,81,73,0.4)]',
  accent: 'bg-[rgba(56,139,253,0.15)] text-accent border-[rgba(56,139,253,0.4)]',
  indexed: 'bg-[rgba(63,185,80,0.15)] text-success border-[rgba(63,185,80,0.4)]',
  indexing: 'bg-[rgba(210,153,34,0.15)] text-warning border-[rgba(210,153,34,0.4)]',
  pending: 'bg-bg-subtle text-text-secondary border-border',
}

export default function Badge({ children, variant = 'default', className, dot = false }) {
  return (
    <span
      className={cn(
        'gh-label border',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full mr-1',
            variant === 'indexing' && 'animate-pulse bg-warning',
            variant === 'indexed' && 'bg-success',
            variant === 'pending' && 'bg-text-muted',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'error' && 'bg-error',
            variant === 'accent' && 'bg-accent',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
