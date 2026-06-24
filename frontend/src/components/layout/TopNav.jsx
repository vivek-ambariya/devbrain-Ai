import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Bell, LogOut, User, Plus } from 'lucide-react'
import SearchBar from '../ui/SearchBar'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

export default function TopNav({ onMenuClick, searchValue, onSearchChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = [
    { id: 1, text: 'E-Commerce Platform indexing complete', time: '5m ago' },
    { id: 2, text: 'New API endpoints detected in Payment Gateway', time: '1h ago' },
    { id: 3, text: 'Documentation updated for User Auth Service', time: '3h ago' },
  ]

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-border bg-bg-sidebar">
      <div className="flex items-center justify-between h-full px-3 lg:px-4 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Type / to search"
            className="max-w-sm hidden sm:block flex-1"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => navigate('/projects')}
          >
            <Plus className="h-3.5 w-3.5" />
            New project
          </Button>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              className="relative p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-80 rounded-md border border-border bg-bg-muted shadow-lg overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-border bg-bg-subtle">
                    <h3 className="text-xs font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="gh-list-item !py-2.5 !px-3">
                        <p className="text-sm text-text-primary">{n.text}</p>
                        <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              className="flex items-center gap-1.5 p-0.5 rounded-md hover:bg-bg-muted transition-colors"
              aria-label="User menu"
              aria-expanded={showProfile}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold',
                  'bg-bg-subtle border border-border text-text-secondary'
                )}
              >
                {initials}
              </div>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-56 rounded-md border border-border bg-bg-muted shadow-lg overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfile(false)
                      navigate('/settings')
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-subtle transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-text-muted" />
                    Your profile
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-subtle transition-colors border-t border-border"
                  >
                    <LogOut className="h-3.5 w-3.5 text-text-muted" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
