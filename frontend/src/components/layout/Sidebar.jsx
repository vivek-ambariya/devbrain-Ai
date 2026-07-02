import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  FolderOpen,
  MessageSquare,
  Network,
  GraduationCap,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Brain,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/explorer', label: 'Explorer', icon: FolderOpen },
  { to: '/chat', label: 'Copilot', icon: MessageSquare },
  { to: '/architecture', label: 'Architecture', icon: Network },
  { to: '/onboarding', label: 'Onboarding', icon: GraduationCap },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-3 h-12 border-b border-border shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-bg-subtle border border-border shrink-0">
          <Brain className="h-4 w-4 text-text-primary" aria-hidden="true" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="font-semibold text-text-primary text-sm leading-none">DevBrain AI</p>
              <p className="text-[11px] text-text-muted leading-none mt-0.5">Enterprise</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto" aria-label="Main navigation">
        {!collapsed && (
          <p className="px-2 mb-1 text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Workspace
          </p>
        )}
        <div className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm',
                  'transition-colors duration-100',
                  isActive
                    ? 'font-semibold text-text-primary bg-bg-subtle'
                    : 'font-medium text-text-secondary hover:text-text-primary hover:bg-bg-muted'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            'hidden lg:flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm',
            'text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen',
          'bg-bg-sidebar border-r border-border flex flex-col',
          'transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
