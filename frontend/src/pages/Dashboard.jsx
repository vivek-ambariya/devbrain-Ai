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
} from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
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
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-4xl space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Pick up where you left off or ask something about your codebase.
        </p>
      </div>

      {/* Command bar — not a stats dashboard */}
      <div className="gh-box p-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4 text-text-muted shrink-0 ml-3" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your codebase..."
            className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
            aria-label="Ask about your codebase"
          />
          <Button type="submit" size="sm" className="mr-1 shrink-0">
            Ask Copilot
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 pt-1 border-t border-border">
          {suggestedQuestions.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="text-xs text-text-secondary hover:text-accent px-2 py-1 rounded-md hover:bg-bg-muted transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Continue where you left off */}
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Continue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lastProject && (
            <button
              onClick={() => navigate('/projects')}
              className="gh-box p-4 text-left hover:border-text-muted transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderKanban className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-xs text-text-muted">Last project</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-sm font-semibold text-text-primary mt-2 truncate">
                {lastProject.name}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {lastProject.totalFiles} files · {formatRelativeTime(lastProject.lastIndexed)}
              </p>
            </button>
          )}

          {lastConversation && (
            <button
              onClick={() => navigate('/chat')}
              className="gh-box p-4 text-left hover:border-text-muted transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-xs text-text-muted">Last conversation</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-sm font-semibold text-text-primary mt-2 truncate">
                {lastConversation.title}
              </p>
              <p className="text-xs text-text-muted mt-1 line-clamp-1">
                {lastConversation.preview}
              </p>
            </button>
          )}
        </div>
      </section>

      {/* Repositories — compact, GitHub-style */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Your repositories</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate('/projects')}
              className="gh-box p-4 text-left hover:border-text-muted transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-accent truncate">{project.name}</p>
                <Badge variant={project.status} dot>
                  {project.status}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-2">
                {project.totalFiles} files
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Activity feed + shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recent activity</h2>
          <Card padding={false}>
            <ul className="divide-y divide-border">
              {activity.map((item) => {
                const Icon = activityIcons[item.type] || Clock
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-bg-muted transition-colors"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bg-subtle border border-border">
                        <Icon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-[11px] text-text-muted shrink-0 mt-0.5">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Explore</h2>
          <Card padding={false}>
            <div className="p-1">
              {[
                { label: 'Browse architecture', desc: 'Folder & API tree', icon: Network, path: '/architecture' },
                { label: 'Onboarding guide', desc: 'Learn the codebase', icon: GraduationCap, path: '/onboarding' },
                { label: 'Upload a project', desc: 'ZIP, Swagger, docs', icon: Upload, path: '/projects' },
              ].map(({ label, desc, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-bg-muted transition-colors text-left"
                >
                  <Icon className="h-4 w-4 text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
