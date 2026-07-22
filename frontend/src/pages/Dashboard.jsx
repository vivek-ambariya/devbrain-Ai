import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  MessageSquare,
  ArrowRight,
  GitBranch,
  Upload,
  Search,
  Network,
  GraduationCap,
  Clock,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import InteractiveAnalyticsGraph from '../components/dashboard/InteractiveAnalyticsGraph'
import { getRecentProjects } from '../api/projects'
import { getConversations } from '../api/chat'
import { suggestedQuestions } from '../utils/mockData'
import { formatRelativeTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const activityIcons = {
  indexed: GitBranch,
  chat: MessageSquare,
  upload: Upload,
  architecture: Network,
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const lastConversation = conversations[0]
  const lastProject = projects[0]

  const activity = [
    ...projects.slice(0, 2).map((p) => ({
      id: `p-${p.id}`,
      type: p.status === 'indexed' ? 'indexed' : 'upload',
      label: p.status === 'indexed' ? `Indexed ${p.name}` : `Project ${p.name}`,
      detail: `${p.totalFiles} files · ${p.apisCount} APIs`,
      timestamp: p.lastIndexed || p.uploadDate,
      path: '/projects',
    })),
    ...conversations.slice(0, 2).map((c) => ({
      id: `c-${c.id}`,
      type: 'chat',
      label: c.title,
      detail: c.preview || 'Copilot conversation',
      timestamp: c.updatedAt,
      path: '/chat',
    })),
  ].slice(0, 4)

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsData, convData] = await Promise.all([
          getRecentProjects(),
          getConversations(),
        ])
        setProjects(projectsData)
        setConversations(convData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAsk = (text) => {
    const q = (text || query).trim()
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : '/chat')
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {getGreeting()}, <span className="gold-gradient-text">{firstName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time codebase telemetry, architecture graphs, and AI concierge assistance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-text-muted">Telemetry Connected</span>
        </div>
      </div>

      {/* AI Command Bar */}
      <div className="glass-panel p-2 rounded-xl border border-accent-gold/30 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4 text-accent-gold shrink-0 ml-3" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI Concierge about your codebase architecture, routes, or refactoring..."
            className="flex-1 bg-transparent py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none font-sans"
            aria-label="Ask about your codebase"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent-gold text-bg-primary font-semibold text-xs transition-all hover:bg-accent-gold-light shrink-0"
          >
            Ask Concierge
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-2 border-t border-border-muted/40">
          <span className="text-[11px] text-text-muted font-mono self-center mr-1">Suggested:</span>
          {suggestedQuestions.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="text-xs text-text-secondary hover:text-accent-gold px-2.5 py-1 rounded-md hover:bg-bg-muted transition-colors font-mono"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Live Interactive Analytics Graph (The User's Request) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-text-primary uppercase tracking-wider">
            [ Codebase Telemetry & Graph Analytics ]
          </h2>
        </div>
        <InteractiveAnalyticsGraph />
      </section>

      {/* Continue where you left off */}
      <section className="space-y-3">
        <h2 className="text-sm font-mono font-bold text-text-primary uppercase tracking-wider">
          [ Quick Access & Resumption ]
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lastProject && (
            <button
              onClick={() => navigate('/projects')}
              className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-border/80 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderKanban className="h-4 w-4 text-accent-gold shrink-0" />
                  <span className="text-xs font-mono text-text-muted">Last Project</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-accent-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-sm font-bold text-text-primary mt-2 truncate">
                {lastProject.name}
              </p>
              <p className="text-xs text-text-secondary font-mono mt-1">
                {lastProject.totalFiles} files &bull; {formatRelativeTime(lastProject.lastIndexed)}
              </p>
            </button>
          )}

          {lastConversation && (
            <button
              onClick={() => navigate('/chat')}
              className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-border/80 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-4 w-4 text-accent-rust shrink-0" />
                  <span className="text-xs font-mono text-text-muted">Last Conversation</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-accent-rust opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-sm font-bold text-text-primary mt-2 truncate">
                {lastConversation.title}
              </p>
              <p className="text-xs text-text-secondary font-mono mt-1 line-clamp-1">
                {lastConversation.preview}
              </p>
            </button>
          )}
        </div>
      </section>

      {/* Repositories & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-text-primary uppercase tracking-wider">
              [ Recent Repositories ]
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-xs text-accent-gold">
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate('/projects')}
                className="glass-panel p-4 rounded-xl text-left hover:border-accent-gold/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-text-primary truncate">{project.name}</p>
                  <Badge variant={project.status} dot>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted font-mono mt-2">
                  {project.totalFiles} files &bull; {project.apisCount} APIs
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-mono font-bold text-text-primary uppercase tracking-wider">
            [ Explore Architecture ]
          </h2>
          <div className="glass-panel p-2 rounded-xl space-y-1">
            {[
              { label: 'Architecture Map', desc: 'Layered System Flow', icon: Network, path: '/architecture' },
              { label: 'Code Explorer', desc: 'File Tree & AST', icon: FolderKanban, path: '/explorer' },
              { label: 'AI Concierge', desc: 'Natural Language Search', icon: Sparkles, path: '/chat' },
              { label: 'Onboarding Guide', desc: 'Codebase Walkthrough', icon: GraduationCap, path: '/onboarding' },
            ].map(({ label, desc, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-bg-muted transition-colors text-left group"
              >
                <Icon className="h-4 w-4 text-accent-gold shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary">{label}</p>
                  <p className="text-[11px] text-text-muted font-mono">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
