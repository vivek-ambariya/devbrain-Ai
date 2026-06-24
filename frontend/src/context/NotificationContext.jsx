import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../utils/cn'

const NotificationContext = createContext(null)

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-accent/30 bg-accent/10 text-accent',
}

function Toast({ notification, onDismiss }) {
  const Icon = icons[notification.type] || Info

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
        'bg-bg-card/95 min-w-[300px] max-w-[420px]',
        colors[notification.type]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className="font-medium text-text-primary text-sm">{notification.title}</p>
        )}
        <p className="text-sm text-text-secondary">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notify = useCallback((message, options = {}) => {
    const id = Date.now().toString()
    const notification = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration ?? 4000,
    }
    setNotifications((prev) => [...prev, notification])
    if (notification.duration > 0) {
      setTimeout(() => dismiss(id), notification.duration)
    }
    return id
  }, [dismiss])

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {notifications.map((n) => (
            <Toast key={n.id} notification={n} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}
