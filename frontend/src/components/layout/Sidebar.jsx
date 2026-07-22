import { NavLink, useLocation, Link } from 'react-router-dom'
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
  Home,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/explorer', label: 'Explorer', icon: FolderOpen },
  { to: '/chat', label: 'AI Concierge', icon: MessageSquare },
  { to: '/architecture', label: 'Architecture', icon: Network },
  { to: '/onboarding', label: 'Onboarding', icon: GraduationCap },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()

  const sidebarContent = (
    <>
      {/* Sidebar Header Brand */}
      <div className="flex items-center justify-between px-3.5 h-14 border-b border-border-muted/60 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-rust text-bg-primary font-bold shadow-md shadow-accent-gold/20 shrink-0">
            <Brain className="h-4 w-4" aria-hidden="true" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="font-bold text-text-primary text-sm leading-none">
                  DevBrain <span className="text-accent-gold font-light">AI</span>
                </p>
                <p className="text-[10px] text-text-muted font-mono leading-none mt-1">Enterprise Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-2.5 overflow-y-auto space-y-4" aria-label="Main navigation">
        <div>
          {!collapsed && (
            <p className="px-2 mb-2 text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              Workspace
            </p>
          )}
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium',
                    'transition-all duration-150',
                    isActive
                      ? 'font-semibold text-text-primary bg-bg-subtle border border-accent-gold/40 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-accent-gold' : 'text-text-muted')}
                    aria-hidden="true"
                  />
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
        </div>

        {/* Public Landing Link */}
        <div>
          {!collapsed && (
            <p className="px-2 mb-2 text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              Public Portal
            </p>
          )}
          <Link
            to="/"
            onClick={onMobileClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors border border-dashed border-border-muted/60"
          >
            <Home className="h-4 w-4 text-accent-rust shrink-0" />
            {!collapsed && (
              <span className="truncate flex items-center justify-between w-full">
                <span>Landing Page</span>
                <ArrowUpRight className="h-3 w-3 text-text-muted" />
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2.5 border-t border-border-muted/60 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            'hidden lg:flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs',
            'text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4 text-accent-gold" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 text-text-muted" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-bg-sidebar border-r border-border-muted/60 transition-all duration-200 shrink-0 z-30',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-bg-sidebar border-r border-border-muted flex flex-col',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
