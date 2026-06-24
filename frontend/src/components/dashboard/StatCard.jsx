import { cn } from '../../utils/cn'
import { useCounter } from '../../hooks'
import { formatNumber } from '../../utils/format'

export default function StatCard({ title, value, icon: Icon }) {
  const animatedValue = useCounter(typeof value === 'number' ? value : 0, 1200)

  return (
    <div className="flex-1 min-w-0 px-4 py-3 border-r border-border last:border-r-0">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
        <p className="text-xs text-text-muted truncate">{title}</p>
      </div>
      <p className="text-xl font-semibold text-text-primary tabular-nums font-mono">
        {formatNumber(animatedValue)}
      </p>
    </div>
  )
}

export function StatGrid({ children, className }) {
  return (
    <div className={cn('gh-box flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border', className)}>
      {children}
    </div>
  )
}
