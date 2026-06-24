import { cn } from '../../utils/cn'

export default function Card({
  children,
  className,
  hover = false,
  padding = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-md border border-border bg-bg-card overflow-hidden',
        padding && 'p-4',
        hover && 'hover:border-[#8b949e] cursor-pointer transition-colors duration-100',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between -mx-4 -mt-4 mb-4 px-4 py-3',
        'bg-bg-muted border-b border-border',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-semibold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-xs text-text-secondary mt-0.5', className)}>
      {children}
    </p>
  )
}
