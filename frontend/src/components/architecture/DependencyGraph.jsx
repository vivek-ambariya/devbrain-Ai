import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { filterGraph, getNodeColor } from '../../utils/architectureGraph'

const NODE_W = 108
const NODE_H = 44
const VIEW_W = 800
const VIEW_H = 500

function getEdgePath(from, to) {
  const x1 = from.x
  const y1 = from.y + NODE_H / 2
  const x2 = to.x
  const y2 = to.y - NODE_H / 2
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
}

export default function DependencyGraph({
  data,
  searchQuery = '',
  selectedNode,
  onSelectNode,
}) {
  const graph = useMemo(() => filterGraph(data, searchQuery), [data, searchQuery])

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  )

  const connectedIds = useMemo(() => {
    if (!selectedNode) return null
    const ids = new Set([selectedNode.id])
    graph.edges.forEach((e) => {
      if (e.from === selectedNode.id) ids.add(e.to)
      if (e.to === selectedNode.id) ids.add(e.from)
    })
    return ids
  }, [graph.edges, selectedNode])

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto min-h-[420px]"
        role="img"
        aria-label="Module dependency graph"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#484f58" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4493f8" />
          </marker>
        </defs>

        {/* Grid dots */}
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#30363d" />
        </pattern>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" opacity="0.5" />

        {/* Edges */}
        {graph.edges.map((edge) => {
          const from = nodeMap.get(edge.from)
          const to = nodeMap.get(edge.to)
          if (!from || !to) return null

          const active =
            selectedNode &&
            (edge.from === selectedNode.id || edge.to === selectedNode.id)
          const dimmed = connectedIds && !active

          const path = getEdgePath(from, to)
          const labelX = (from.x + to.x) / 2
          const labelY = (from.y + to.y) / 2

          return (
            <g key={edge.id || `${edge.from}-${edge.to}`} opacity={dimmed ? 0.2 : 1}>
              <path
                d={path}
                fill="none"
                stroke={active ? '#4493f8' : '#484f58'}
                strokeWidth={active ? 2 : 1.5}
                markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
              {edge.label && (
                <text
                  x={labelX}
                  y={labelY - 6}
                  textAnchor="middle"
                  className="fill-text-muted text-[10px]"
                  style={{ fontSize: '10px' }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const colors = getNodeColor(node.type)
          const isSelected = selectedNode?.id === node.id
          const dimmed = connectedIds && !connectedIds.has(node.id)

          return (
            <g
              key={node.id}
              transform={`translate(${node.x - NODE_W / 2}, ${node.y - NODE_H / 2})`}
              opacity={dimmed ? 0.3 : 1}
              className="cursor-pointer"
              onClick={() => onSelectNode(node)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectNode(node)}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={6}
                fill={colors.fill}
                stroke={isSelected ? '#4493f8' : colors.stroke}
                strokeWidth={isSelected ? 2 : 1}
              />
              <text
                x={NODE_W / 2}
                y={NODE_H / 2 - 4}
                textAnchor="middle"
                fill={colors.text}
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                {node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label}
              </text>
              <text
                x={NODE_W / 2}
                y={NODE_H / 2 + 10}
                textAnchor="middle"
                fill="#656d76"
                style={{ fontSize: '9px' }}
              >
                {node.type}
              </text>
            </g>
          )
        })}
      </svg>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 gh-box p-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-text-primary">{selectedNode.label}</p>
              <p className="text-xs text-text-muted capitalize">{selectedNode.type}</p>
            </div>
            <div className="text-xs text-text-secondary">
              {graph.edges
                .filter((e) => e.from === selectedNode.id || e.to === selectedNode.id)
                .map((e) => {
                  const dir = e.from === selectedNode.id ? 'out' : 'in'
                  const otherId = dir === 'out' ? e.to : e.from
                  const other = nodeMap.get(otherId)
                  return (
                    <span
                      key={`${e.from}-${e.to}`}
                      className={cn(
                        'inline-block mr-3',
                        dir === 'out' ? 'text-success' : 'text-accent'
                      )}
                    >
                      {dir === 'out' ? '→' : '←'} {other?.label}
                      {e.label && ` (${e.label})`}
                    </span>
                  )
                })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
