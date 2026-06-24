import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ProjectCard from '../components/projects/ProjectCard'
import CreateProjectModal from '../components/projects/CreateProjectModal'
import Button from '../components/ui/Button'
import PageHeader from '../components/layout/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Skeleton from '../components/ui/Skeleton'
import { getProjects, createProject } from '../api/projects'
import { useNotification } from '../context/NotificationContext'
import { useDebounce } from '../hooks'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { notify } = useNotification()
  const debouncedSearch = useDebounce(search)

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleCreate = async (data) => {
    const project = await createProject(data)
    setProjects((prev) => [project, ...prev])
    notify('Project created successfully', { type: 'success', title: 'Success' })
    return project
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        description={`${filtered.length} repositories in your workspace`}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" />
            New project
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Find a repository..."
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="gh-box text-center py-12 px-6">
          <h3 className="text-base font-semibold text-text-primary">No projects found</h3>
          <p className="text-sm text-text-secondary mt-1 mb-4">
            {search ? 'Try a different search term' : 'Get started by creating a new project'}
          </p>
          {!search && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              Create project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
