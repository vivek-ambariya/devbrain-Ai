import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, FolderKanban } from 'lucide-react'
import ArchitectureTree from '../components/architecture/ArchitectureTree'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import SearchBar from '../components/ui/SearchBar'
import Skeleton from '../components/ui/Skeleton'
import { getProjects, getArchitecture } from '../api/projects'
import { useDebounce } from '../hooks'

export default function Architecture() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [tree, setTree] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data)
      if (data.length > 0) setSelectedProject(data[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoading(true)
    getArchitecture(selectedProject).then((data) => {
      setTree(data)
      setLoading(false)
    })
  }, [selectedProject])

  const selected = projects.find((p) => p.id === selectedProject)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Architecture Explorer</h1>
        <p className="text-text-secondary mt-1">
          Visualize project structure, modules, services, and APIs
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedProject === project.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-bg-card text-text-secondary border border-border hover:text-text-primary'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              {project.name}
            </button>
          ))}
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search nodes..."
          className="sm:max-w-xs sm:ml-auto"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            {selected ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Project</span>
                  <span className="text-text-primary font-medium">{selected.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Files</span>
                  <span className="text-text-primary">{selected.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">APIs</span>
                  <span className="text-text-primary">{selected.apisCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="text-text-primary capitalize">{selected.status}</span>
                </div>
              </div>
            ) : (
              <Skeleton className="h-24 w-full" />
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Module', color: 'text-accent' },
                { label: 'Service', color: 'text-success' },
                { label: 'Entity', color: 'text-error' },
                { label: 'API Endpoint', color: 'text-success' },
                { label: 'Folder', color: 'text-warning' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color} bg-current`} />
                  <span className="text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3 !p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Network className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-text-primary">Project Structure</h3>
          </div>
          <div className="p-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" style={{ width: `${60 + (i % 3) * 15}%` }} />
                ))}
              </div>
            ) : tree ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArchitectureTree data={tree} searchQuery={debouncedSearch} />
              </motion.div>
            ) : (
              <p className="text-center text-text-secondary py-12">Select a project to explore</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
