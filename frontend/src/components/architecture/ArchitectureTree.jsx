import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Folder,
  FileCode,
  Box,
  Database,
  Globe,
  Server,
  FileText,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const typeIcons = {
  folder: Folder,
  module: Box,
  file: FileText,
  service: Server,
  entity: Database,
  api: Globe,
  endpoint: FileCode,
}

const typeColors = {
  folder: 'text-warning',
  module: 'text-accent',
  file: 'text-text-secondary',
  service: 'text-success',
  entity: 'text-error',
  api: 'text-accent',
  endpoint: 'text-success',
}

function TreeNode({ node, depth = 0, searchQuery = '' }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const Icon = typeIcons[node.type] || FileCode
  const colorClass = typeColors[node.type] || 'text-text-secondary'

  const matchesSearch = !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase())

  const childrenMatch = hasChildren && node.children.some((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (child.children && child.children.length > 0)
  )

  if (!matchesSearch && !childrenMatch && searchQuery) return null

  return (
    <div>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-sm',
          'hover:bg-white/5 transition-colors duration-150',
          'text-left group'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {hasChildren ? (
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
          </motion.span>
        ) : (
          <span className="w-3.5" />
        )}
        <Icon className={cn('h-4 w-4 shrink-0', colorClass)} aria-hidden="true" />
        <span className={cn(
          'truncate',
          searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase())
            ? 'text-accent font-medium'
            : 'text-text-primary'
        )}>
          {node.name}
        </span>
        {node.type !== 'folder' && node.type !== 'file' && (
          <span className="text-[10px] text-text-secondary ml-auto opacity-0 group-hover:opacity-100 transition-opacity capitalize">
            {node.type}
          </span>
        )}
      </button>
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ArchitectureTree({ data, searchQuery = '' }) {
  if (!data) return null

  return (
    <div className="py-2" role="tree" aria-label="Project architecture">
      <TreeNode node={data} searchQuery={searchQuery} />
    </div>
  )
}
