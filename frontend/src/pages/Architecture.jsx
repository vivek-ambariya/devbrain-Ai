import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, FolderKanban, Map, GitBranch, ListTree } from 'lucide-react'
import ArchitectureTree from '../components/architecture/ArchitectureTree'
import ArchitectureMap from '../components/architecture/ArchitectureMap'
import DependencyGraph from '../components/architecture/DependencyGraph'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import SearchBar from '../components/ui/SearchBar'
import Skeleton from '../components/ui/Skeleton'
import { getProjects, getArchitecture, getArchitectureMap, getDependencyGraph } from '../api/projects'
import { useDebounce } from '../hooks'
import { cn } from '../utils/cn'

const views = [
  { id: 'map', label: 'System Map', icon: Map, description: 'Layered flow from client to data' },
  { id: 'graph', label: 'Dependency Graph', icon: GitBranch, description: 'Module imports and API routes' },
  { id: 'tree', label: 'File Tree', icon: ListTree, description: 'Folder and file structure' },
]

export default function Architecture() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeView, setActiveView] = useState('map')
  const [tree, setTree] = useState(null)
  const [map, setMap] = useState(null)
  const [graph, setGraph] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data)
      if (data.length > 0) setSelectedProject(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoading(true)
    setSelectedNode(null)
    Promise.all([
      getArchitecture(selectedProject),
      getArchitectureMap(selectedProject),
      getDependencyGraph(selectedProject),
    ]).then(([treeData, mapData, graphData]) => {
      setTree(treeData)
      setMap(mapData)
      setGraph(graphData)
      setLoading(false)
    })
  }, [selectedProject])

  const selected = projects.find((p) => p.id === selectedProject)
  const currentView = views.find((v) => v.id === activeView)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Architecture</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Map, graph, and tree views to understand how your code connects
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors border',
                selectedProject === project.id
                  ? 'bg-bg-subtle text-text-primary border-border'
                  : 'text-text-secondary border-transparent hover:bg-bg-muted hover:text-text-primary'
              )}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              {project.name}
            </button>
          ))}
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter nodes..."
          className="sm:max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>
            {selected ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary">Name</span>
                  <span className="text-text-primary font-medium text-right truncate">{selected.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Files</span>
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

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Views</CardTitle>
            </CardHeader>
            <div className="p-1">
              {views.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveView(id)
                    setSelectedNode(null)
                  }}
                  className={cn(
                    'flex items-start gap-2.5 w-full px-3 py-2.5 rounded-md text-left transition-colors',
                    activeView === id
                      ? 'bg-bg-subtle text-text-primary'
                      : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
                  )}
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-[11px] text-text-muted">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Client / Module', color: 'text-accent' },
                { label: 'Service', color: 'text-success' },
                { label: 'Entity / DB', color: 'text-error' },
                { label: 'API Endpoint', color: 'text-success' },
                { label: 'External', color: 'text-text-muted' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full bg-current', item.color)} />
                  <span className="text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3 !p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-bg-muted">
            <div className="flex items-center gap-2 min-w-0">
              {currentView && <currentView.icon className="h-4 w-4 text-accent shrink-0" />}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{currentView?.label}</h3>
                <p className="text-[11px] text-text-muted truncate">{currentView?.description}</p>
              </div>
            </div>
            <Network className="h-4 w-4 text-text-muted shrink-0" />
          </div>

          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-bg-primary">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" style={{ width: `${50 + (i % 4) * 12}%` }} />
                ))}
              </div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'map' && map && (
                  <ArchitectureMap
                    data={map}
                    searchQuery={debouncedSearch}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                  />
                )}
                {activeView === 'graph' && graph && (
                  <DependencyGraph
                    data={graph}
                    searchQuery={debouncedSearch}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                  />
                )}
                {activeView === 'tree' && tree && (
                  <div className="p-2">
                    <ArchitectureTree data={tree} searchQuery={debouncedSearch} />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
