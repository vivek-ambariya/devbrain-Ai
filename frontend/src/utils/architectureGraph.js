export const NODE_COLORS = {
  folder: { fill: '#d2992220', stroke: '#d29922', text: '#d29922' },
  module: { fill: '#4493f820', stroke: '#4493f8', text: '#4493f8' },
  service: { fill: '#3fb95020', stroke: '#3fb950', text: '#3fb950' },
  entity: { fill: '#f8514920', stroke: '#f85149', text: '#f85149' },
  api: { fill: '#4493f815', stroke: '#4493f8', text: '#4493f8' },
  endpoint: { fill: '#3fb95015', stroke: '#3fb950', text: '#3fb950' },
  database: { fill: '#f8514915', stroke: '#f85149', text: '#f85149' },
  external: { fill: '#9198a115', stroke: '#9198a1', text: '#9198a1' },
  client: { fill: '#4493f820', stroke: '#4493f8', text: '#4493f8' },
}

export function getNodeColor(type) {
  return NODE_COLORS[type] || NODE_COLORS.module
}

export function filterGraph(graph, query) {
  if (!query?.trim()) return graph
  const q = query.toLowerCase()
  const matching = new Set(
    graph.nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id)
  )
  graph.edges.forEach((e) => {
    if (e.from.toLowerCase().includes(q) || e.to.toLowerCase().includes(q) || e.label?.toLowerCase().includes(q)) {
      matching.add(e.from)
      matching.add(e.to)
    }
  })
  return {
    nodes: graph.nodes.filter((n) => matching.has(n.id)),
    edges: graph.edges.filter((e) => matching.has(e.from) && matching.has(e.to)),
  }
}
