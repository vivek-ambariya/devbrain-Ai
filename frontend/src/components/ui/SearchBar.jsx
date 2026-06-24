import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  onSubmit,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSubmit?.(value)
  }

  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'w-full h-8 pl-8 pr-3 rounded-md text-sm',
          'bg-bg-primary border border-border text-text-primary',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-accent-emphasis focus:shadow-[0_0_0_3px_rgba(31,111,235,0.3)]',
          'transition-[border-color,box-shadow] duration-100'
        )}
      />
    </div>
  )
}
