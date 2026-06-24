import { cn } from '../../utils/cn'

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('gh-page-header flex flex-col sm:flex-row sm:items-end justify-between gap-3', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-text-primary leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
