import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { getNodeColor } from '../../utils/architectureGraph'

function MapNode({ node, selected, highlighted, onSelect, searchQuery }) {
  const colors = getNodeColor(node.type)
  const matches = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase())

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        'text-left px-3 py-2 rounded-md border transition-all min-w-[120px]',
        'hover:scale-[1.02] active:scale-[0.98]',
        selected?.id === node.id && 'ring-2 ring-accent ring-offset-1 ring-offset-bg-primary',
        highlighted && !selected && 'opacity-100',
        !highlighted && searchQuery && !matches && 'opacity-35'
      )}
      style={{
        backgroundColor: colors.fill,
        borderColor: matches ? colors.stroke : `${colors.stroke}80`,
      }}
    >
      <p className="text-xs font-semibold truncate" style={{ color: colors.text }}>
        {node.label}
      </p>
      <p className="text-[10px] text-text-muted mt-0.5 truncate">{node.detail}</p>
    </button>
  )
}

export default function ArchitectureMap({ data, searchQuery = '', selectedNode, onSelectNode }) {
  const nodeIndex = useMemo(() => {
    const map = new Map()
    data.layers.forEach((layer) => layer.nodes.forEach((n) => map.set(n.id, n)))
    return map
  }, [data])

  const connectedIds = useMemo(() => {
    if (!selectedNode) return null
    const ids = new Set([selectedNode.id])
    data.flows.forEach((flow) => {
      if (flow.from === selectedNode.id) ids.add(flow.to)
      if (flow.to === selectedNode.id) ids.add(flow.from)
    })
    return ids
  }, [data, selectedNode])

  return (
    <div className="p-4 space-y-1">
      {data.layers.map((layer, layerIndex) => (
        <div key={layer.id}>
          <div className="gh-box overflow-hidden">
            <div className="px-4 py-2.5 bg-bg-muted border-b border-border">
              <p className="text-xs font-semibold text-text-primary">{layer.label}</p>
              <p className="text-[11px] text-text-muted">{layer.description}</p>
            </div>
            <div className="p-4 flex flex-wrap gap-3 justify-center">
              {layer.nodes.map((node) => (
                <MapNode
                  key={node.id}
                  node={node}
                  selected={selectedNode}
                  highlighted={!connectedIds || connectedIds.has(node.id)}
                  onSelect={onSelectNode}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>

          {layerIndex < data.layers.length - 1 && (
            <div className="flex flex-col items-center py-2 text-text-muted">
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              <span className="text-[10px] mt-0.5">data flow</span>
            </div>
          )}
        </div>
      ))}

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gh-box p-4 mt-4"
        >
          <p className="text-xs text-text-muted mb-1">Selected node</p>
          <p className="text-sm font-semibold text-text-primary">{selectedNode.label}</p>
          <p className="text-xs text-text-secondary mt-1">{selectedNode.detail}</p>
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Connections</p>
            {data.flows
              .filter((f) => f.from === selectedNode.id || f.to === selectedNode.id)
              .map((flow) => {
                const otherId = flow.from === selectedNode.id ? flow.to : flow.from
                const other = nodeIndex.get(otherId)
                return (
                  <p key={`${flow.from}-${flow.to}`} className="text-xs text-text-secondary">
                    <span className="text-accent">{flow.label}</span>
                    {' → '}
                    {other?.label || otherId}
                  </p>
                )
              })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
