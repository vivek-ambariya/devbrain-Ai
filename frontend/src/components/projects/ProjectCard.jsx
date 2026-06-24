import { FolderKanban, FileCode, Clock, Star } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate, formatRelativeTime } from '../../utils/format'

const statusLabels = {
  indexed: 'Indexed',
  indexing: 'Indexing',
  pending: 'Pending',
  error: 'Error',
}

export default function ProjectCard({ project, onClick }) {
  return (
    <Card
      hover
      onClick={onClick}
      className="group !p-0"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <FolderKanban className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-accent group-hover:underline truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-text-muted hover:text-warning transition-colors shrink-0"
            aria-label="Star project"
          >
            <Star className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={project.status} dot>
            {statusLabels[project.status] || project.status}
          </Badge>
          {project.apisCount > 0 && (
            <span className="text-[11px] text-text-muted border border-border rounded-full px-2 py-0.5">
              {project.apisCount} APIs
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            {project.totalFiles} files
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(project.lastIndexed || project.uploadDate)}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border-muted bg-bg-muted/50 text-[11px] text-text-muted">
        Uploaded {formatDate(project.uploadDate)}
      </div>
    </Card>
  )
}
