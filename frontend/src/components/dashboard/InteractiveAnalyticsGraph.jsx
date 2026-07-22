import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  Filter,
  RefreshCw,
} from 'lucide-react'

const projectsList = [
  { id: 'all', name: 'All Ecosystem Repositories' },
  { id: 'devbrain-core', name: 'devbrain-ai-core' },
  { id: 'fintech-service', name: 'payment-gateway-microservice' },
  { id: 'analytics-engine', name: 'realtime-analytics-pipeline' },
]

const metricConfigs = {
  complexity: {
    label: 'Architecture Complexity Index',
    unit: ' points',
    color: '#c5a059', // Champagne Gold
    gradient: 'rgba(197, 160, 89, 0.25)',
    secondaryColor: '#c86a50',
    description: 'Structural coupling & cyclomatic complexity across modules',
    icon: Activity,
    data: {
      '7D': [
        { label: 'Mon', value: 42, secondary: 18, details: '14 Modules | 3 Cycle Links Resolved' },
        { label: 'Tue', value: 39, secondary: 16, details: 'Clean refactor on auth middleware' },
        { label: 'Wed', value: 45, secondary: 22, details: 'PR #104 added Stripe payment handler' },
        { label: 'Thu', value: 36, secondary: 14, details: 'Unused dependencies pruned (-18%)' },
        { label: 'Fri', value: 32, secondary: 12, details: 'Architecture Graph reorganized' },
        { label: 'Sat', value: 30, secondary: 10, details: 'Automated AI audit passed' },
        { label: 'Sun', value: 28, secondary: 9, details: 'Optimal modular score achieved' },
      ],
      '30D': [
        { label: 'Week 1', value: 68, secondary: 34, details: 'Initial legacy codebase import' },
        { label: 'Week 2', value: 54, secondary: 28, details: 'Decoupled monolithic services' },
        { label: 'Week 3', value: 41, secondary: 19, details: 'Extracted async background queues' },
        { label: 'Week 4', value: 28, secondary: 9, details: 'Target architecture state reached' },
      ],
      '90D': [
        { label: 'Month 1', value: 85, secondary: 45, details: 'High coupling detected in database layer' },
        { label: 'Month 2', value: 52, secondary: 26, details: 'Schema normalization & ORM migration' },
        { label: 'Month 3', value: 28, secondary: 9, details: 'Fully optimized graph topography' },
      ],
      '1Y': [
        { label: 'Q1', value: 92, secondary: 50, details: 'Legacy system baseline' },
        { label: 'Q2', value: 64, secondary: 32, details: 'DevBrain AI adoption phase' },
        { label: 'Q3', value: 40, secondary: 18, details: 'Microservices decoupling' },
        { label: 'Q4', value: 28, secondary: 9, details: 'Continuous AI architecture monitoring' },
      ],
    },
  },
  latency: {
    label: 'API Endpoint Latency (P99)',
    unit: 'ms',
    color: '#c86a50', // Rust Accent
    gradient: 'rgba(200, 106, 80, 0.25)',
    secondaryColor: '#c5a059',
    description: 'Average & 99th percentile HTTP/gRPC response throughput',
    icon: Zap,
    data: {
      '7D': [
        { label: 'Mon', value: 142, secondary: 88, details: 'Peak traffic: 12.4k req/sec' },
        { label: 'Tue', value: 120, secondary: 76, details: 'Redis cache hit ratio: 94.2%' },
        { label: 'Wed', value: 135, secondary: 82, details: 'Database query index added' },
        { label: 'Thu', value: 95, secondary: 54, details: 'gRPC connection pooling enabled' },
        { label: 'Fri', value: 82, secondary: 48, details: 'Edge CDN routing enabled' },
        { label: 'Sat', value: 78, secondary: 42, details: 'Zero latency degradation' },
        { label: 'Sun', value: 74, secondary: 38, details: 'Sub-80ms P99 stability verified' },
      ],
      '30D': [
        { label: 'Week 1', value: 210, secondary: 140, details: 'Unindexed SQL queries causing spikes' },
        { label: 'Week 2', value: 155, secondary: 98, details: 'Query optimization applied' },
        { label: 'Week 3', value: 105, secondary: 62, details: 'HTTP/2 multiplexing active' },
        { label: 'Week 4', value: 74, secondary: 38, details: 'Production SLA 99.99% met' },
      ],
      '90D': [
        { label: 'Month 1', value: 280, secondary: 180, details: 'Legacy REST endpoints' },
        { label: 'Month 2', value: 140, secondary: 85, details: 'Refactored to fast API gateway' },
        { label: 'Month 3', value: 74, secondary: 38, details: 'Ultra-fast response benchmarks' },
      ],
      '1Y': [
        { label: 'Q1', value: 340, secondary: 210, details: 'Baseline latency' },
        { label: 'Q2', value: 190, secondary: 120, details: 'Caching architecture overhaul' },
        { label: 'Q3', value: 110, secondary: 65, details: 'Zero-copy serialization' },
        { label: 'Q4', value: 74, secondary: 38, details: 'Optimal performance SLA' },
      ],
    },
  },
  health: {
    label: 'Code Health & Test Coverage',
    unit: '%',
    color: '#3fb950', // Success Green
    gradient: 'rgba(63, 185, 80, 0.25)',
    secondaryColor: '#c5a059',
    description: 'Unit test coverage, type safety ratio, and static analysis health',
    icon: ShieldCheck,
    data: {
      '7D': [
        { label: 'Mon', value: 78, secondary: 82, details: 'Type coverage: 91%' },
        { label: 'Tue', value: 82, secondary: 85, details: 'Added integration tests for auth' },
        { label: 'Wed', value: 85, secondary: 88, details: 'Automated regression suite passed' },
        { label: 'Thu', value: 89, secondary: 91, details: 'Zero critical linter warnings' },
        { label: 'Fri', value: 92, secondary: 94, details: '100% API contract validation' },
        { label: 'Sat', value: 94, secondary: 96, details: 'Security audit report clean' },
        { label: 'Sun', value: 96, secondary: 98, details: 'Enterprise production ready' },
      ],
      '30D': [
        { label: 'Week 1', value: 64, secondary: 70, details: 'Coverage gap identified in legacy utils' },
        { label: 'Week 2', value: 75, secondary: 80, details: 'Synthesized automated unit tests' },
        { label: 'Week 3', value: 88, secondary: 90, details: 'End-to-end integration complete' },
        { label: 'Week 4', value: 96, secondary: 98, details: 'Highest stability tier achieved' },
      ],
      '90D': [
        { label: 'Month 1', value: 52, secondary: 60, details: 'Legacy codebase baseline' },
        { label: 'Month 2', value: 78, secondary: 82, details: 'Refactoring sprint complete' },
        { label: 'Month 3', value: 96, secondary: 98, details: 'Continuous quality score' },
      ],
      '1Y': [
        { label: 'Q1', value: 45, secondary: 50, details: 'Initial project audit' },
        { label: 'Q2', value: 68, secondary: 72, details: 'Test suite expansion' },
        { label: 'Q3', value: 86, secondary: 89, details: 'Strict TypeScript & Oxlint rules' },
        { label: 'Q4', value: 96, secondary: 98, details: 'A+ Code Integrity Tier' },
      ],
    },
  },
  roi: {
    label: 'Engineering Hours Saved',
    unit: ' hrs/mo',
    color: '#e2e8f0', // Platinum
    gradient: 'rgba(226, 232, 240, 0.2)',
    secondaryColor: '#c5a059',
    description: 'Developer onboarding time reduction & automated bug prevention',
    icon: TrendingUp,
    data: {
      '7D': [
        { label: 'Mon', value: 18, secondary: 8, details: '4 hours saved in architecture lookup' },
        { label: 'Tue', value: 24, secondary: 12, details: '6 hours saved in API documentation' },
        { label: 'Wed', value: 31, secondary: 15, details: 'Copilot resolved complex refactor' },
        { label: 'Thu', value: 38, secondary: 20, details: 'Automated dependency graph tracing' },
        { label: 'Fri', value: 45, secondary: 26, details: 'Instant onboarding for 2 new devs' },
        { label: 'Sat', value: 52, secondary: 30, details: 'Zero regression debugging calls' },
        { label: 'Sun', value: 58, secondary: 35, details: 'Weekly engineering efficiency record' },
      ],
      '30D': [
        { label: 'Week 1', value: 40, secondary: 20, details: 'First month adoption savings' },
        { label: 'Week 2', value: 95, secondary: 55, details: 'Team-wide AI context indexing' },
        { label: 'Week 3', value: 160, secondary: 90, details: 'Automated code review pipelines' },
        { label: 'Week 4', value: 240, secondary: 135, details: 'Total monthly velocity gain' },
      ],
      '90D': [
        { label: 'Month 1', value: 120, secondary: 60, details: 'Onboarding acceleration' },
        { label: 'Month 2', value: 340, secondary: 190, details: 'Architecture clarity savings' },
        { label: 'Month 3', value: 680, secondary: 380, details: 'Quarterly engineering yield' },
      ],
      '1Y': [
        { label: 'Q1', value: 280, secondary: 150, details: 'Initial deployment ROI' },
        { label: 'Q2', value: 720, secondary: 400, details: 'Expanded team adoption' },
        { label: 'Q3', value: 1450, secondary: 800, details: 'Enterprise-wide efficiency' },
        { label: 'Q4', value: 2840, secondary: 1520, details: 'Annual total engineering value' },
      ],
    },
  },
}

export default function InteractiveAnalyticsGraph({ className = '' }) {
  const [activeMetric, setActiveMetric] = useState('complexity')
  const [activeTimeframe, setActiveTimeframe] = useState('7D')
  const [selectedProject, setSelectedProject] = useState('all')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true)

  const config = metricConfigs[activeMetric]
  const rawData = config.data[activeTimeframe] || config.data['7D']

  // Apply slight project multipliers for realistic filtering
  const dataset = useMemo(() => {
    const mult = selectedProject === 'fintech-service' ? 1.15 : selectedProject === 'analytics-engine' ? 0.85 : 1.0
    return rawData.map((d) => ({
      ...d,
      value: Math.round(d.value * mult),
      secondary: Math.round(d.secondary * mult),
    }))
  }, [rawData, selectedProject])

  const maxValue = Math.max(...dataset.map((d) => Math.max(d.value, d.secondary))) * 1.15
  const minValue = 0

  // SVG dimensions
  const svgWidth = 720
  const svgHeight = 240
  const paddingX = 40
  const paddingY = 30
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  // Generate SVG path coordinates
  const points = dataset.map((d, index) => {
    const x = paddingX + (index / (dataset.length - 1 || 1)) * chartWidth
    const y = svgHeight - paddingY - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight
    const ySec = svgHeight - paddingY - ((d.secondary - minValue) / (maxValue - minValue || 1)) * chartHeight
    return { x, y, ySec, ...d }
  })

  // Smooth bezier curve generator
  const createSmoothPath = (pts, key = 'y') => {
    if (!pts.length) return ''
    let path = `M ${pts[0].x},${pts[0][key]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]
      const next = pts[i + 1]
      const controlX = (curr.x + next.x) / 2
      path += ` C ${controlX},${curr[key]} ${controlX},${next[key]} ${next.x},${next[key]}`
    }
    return path
  }

  const primaryPath = createSmoothPath(points, 'y')
  const secondaryPath = createSmoothPath(points, 'ySec')
  const areaPath = `${primaryPath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`

  const latestVal = dataset[dataset.length - 1]?.value || 0
  const firstVal = dataset[0]?.value || 1
  const percentChange = (((latestVal - firstVal) / firstVal) * 100).toFixed(1)
  const isPositiveChange = Number(percentChange) >= 0

  const MetricIcon = config.icon

  return (
    <div className={`glass-panel rounded-xl p-5 md:p-6 text-white space-y-6 ${className}`}>
      {/* Top Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border-muted/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-bg-muted border border-border/60 text-accent-gold">
              <MetricIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                {config.label}
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold border border-accent-gold/30 font-medium">
                  Live Insights
                </span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Filter Selector */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-bg-muted hover:bg-bg-subtle text-text-primary text-xs font-medium px-3 py-1.5 pr-8 rounded-lg border border-border/80 outline-none cursor-pointer transition-colors"
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id} className="bg-bg-card text-text-primary">
                  {p.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-bg-muted p-1 rounded-lg border border-border/60">
            {['7D', '30D', '90D', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTimeframe === tf
                    ? 'bg-accent-gold text-bg-primary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Live Telemetry Toggle */}
          <button
            onClick={() => setIsLiveTelemetry(!isLiveTelemetry)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              isLiveTelemetry
                ? 'bg-accent-rust/15 text-accent-rust border-accent-rust/40'
                : 'bg-bg-muted text-text-muted border-border/60 hover:text-text-primary'
            }`}
            title="Toggle Live Telemetry Simulation"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLiveTelemetry ? 'animate-spin-slow' : ''}`} />
            <span className="hidden sm:inline">Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.entries(metricConfigs).map(([key, item]) => {
          const isActive = activeMetric === key
          const ItemIcon = item.icon
          const currentVal = item.data[activeTimeframe]?.[item.data[activeTimeframe].length - 1]?.value || 0

          return (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`p-3 rounded-lg text-left border transition-all ${
                isActive
                  ? 'bg-bg-subtle/80 border-accent-gold/50 shadow-md shadow-black/20'
                  : 'bg-bg-muted/40 border-border/40 hover:bg-bg-muted hover:border-border-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isActive ? 'text-accent-gold' : 'text-text-secondary'}`}>
                  {key.toUpperCase()}
                </span>
                <ItemIcon className={`h-3.5 w-3.5 ${isActive ? 'text-accent-gold' : 'text-text-muted'}`} />
              </div>
              <div className="mt-1.5 text-base font-bold text-text-primary">
                {currentVal}
                <span className="text-xs text-text-secondary font-normal ml-0.5">{item.unit}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Key Summary Stats */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-text-muted">Current Output: </span>
            <span className="font-bold text-text-primary text-sm ml-1">
              {latestVal}
              <span className="text-text-secondary text-xs">{config.unit}</span>
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="text-text-muted">Period Shift: </span>
            <span className={`font-semibold ml-1 ${isPositiveChange ? 'text-emerald-400' : 'text-accent-rust'}`}>
              {isPositiveChange ? '+' : ''}
              {percentChange}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }}></span>
            <span className="text-text-secondary">Primary Metric</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.secondaryColor }}></span>
            <span className="text-text-secondary">Baseline</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-bg-primary/80 border border-border/60 p-2 md:p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>

            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

          {/* Horizontal Reference Lines */}
          {[0.25, 0.5, 0.75].map((factor, idx) => {
            const y = paddingY + chartHeight * factor
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Area Fill */}
          <motion.path
            key={`area-${activeMetric}-${activeTimeframe}-${selectedProject}`}
            d={areaPath}
            fill={`url(#gradient-${activeMetric})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Secondary Baseline Path */}
          <motion.path
            key={`sec-${activeMetric}-${activeTimeframe}-${selectedProject}`}
            d={secondaryPath}
            fill="none"
            stroke={config.secondaryColor}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeOpacity="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Primary Main Path */}
          <motion.path
            key={`main-${activeMetric}-${activeTimeframe}-${selectedProject}`}
            d={primaryPath}
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Interactive Hover Guides & Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint === idx

            return (
              <g key={idx}>
                {/* Vertical Guide Line when Hovered */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke="rgba(197, 160, 89, 0.4)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}

                {/* X-Axis Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  fill={isHovered ? '#ffffff' : '#686e80'}
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>

                {/* Interactive Target Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  fill={config.color}
                  stroke="#0a0b0d"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            )
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint !== null && points[hoveredPoint] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute z-20 pointer-events-none p-3 rounded-lg glass-panel text-xs text-white space-y-1 shadow-xl border border-accent-gold/40 max-w-xs"
              style={{
                left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / svgHeight) * 100 - 30}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-semibold text-accent-gold flex items-center justify-between gap-3">
                <span>{points[hoveredPoint].label}</span>
                <span className="text-text-muted text-[10px]">Realtime Snap</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                {points[hoveredPoint].value} {config.unit}
              </div>
              <div className="text-[11px] text-text-secondary border-t border-border-muted pt-1 mt-1">
                {points[hoveredPoint].details}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
