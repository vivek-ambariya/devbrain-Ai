import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'text-white bg-success-emphasis border border-[rgba(240,246,252,0.1)] hover:bg-[#2ea043] shadow-[0_1px_0_rgba(27,31,36,0.04)]',
  secondary:
    'text-text-primary bg-bg-subtle border border-border hover:bg-[#30363d] hover:border-[#8b949e] shadow-[0_1px_0_rgba(27,31,36,0.04)]',
  ghost:
    'text-text-primary bg-transparent border border-transparent hover:bg-bg-subtle',
  danger:
    'text-white bg-error border border-[rgba(240,246,252,0.1)] hover:bg-[#da3633]',
  accent:
    'text-white bg-accent-emphasis border border-[rgba(240,246,252,0.1)] hover:bg-[#388bfd]',
}

const sizes = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-8 px-3.5 text-sm gap-1.5',
  lg: 'h-10 px-4 text-sm gap-2',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md',
        'transition-[background-color,border-color] duration-100',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-emphasis focus-visible:outline-offset-[-2px]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})

export default Button
