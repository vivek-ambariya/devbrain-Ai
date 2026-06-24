import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from '../ui/Input'
import { cn } from '../../utils/cn'

export default function PasswordInput({ label = 'Password', ...props }) {
  const [visible, setVisible] = useState(false)
  const hasLabel = Boolean(label)

  return (
    <div className="relative">
      <Input
        label={hasLabel ? label : undefined}
        type={visible ? 'text' : 'password'}
        {...props}
        className={cn('pr-10', props.className)}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className={cn(
          'absolute right-2.5 text-text-muted hover:text-text-primary transition-colors',
          hasLabel ? 'top-[30px]' : 'top-1/2 -translate-y-1/2'
        )}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
