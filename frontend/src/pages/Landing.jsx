import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Network,
  ArrowUpRight,
  ChevronRight,
  Code2,
  Activity,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import InteractiveAnalyticsGraph from '../components/dashboard/InteractiveAnalyticsGraph'
import CustomCursor from '../components/ui/CustomCursor'

const services = [
  {
    id: '01',
    title: 'Codebase Architecture Audit',
    category: 'Diagnostic & Structural Heatmaps',
    description: 'Instant structural analysis revealing circular dependencies, tight coupling, and architectural drift.',
    stat: '85% Risk Reduction',
  },
  {
    id: '02',
    title: 'Live Dependency Mapping',
    category: 'Graph Topography & Flow',
    description: 'Interactive real-time graph visualization connecting API endpoints, database schemas, and background jobs.',
    stat: 'Sub-10ms Graph Render',
  },
  {
    id: '03',
    title: 'AI Engineering Concierge',
    category: 'Context-Aware AI Assistant',
    description: 'Query your entire repository using natural language to answer architecture, refactoring, and logic questions.',
    stat: '100% Code Privacy',
  },
  {
    id: '04',
    title: 'Refactoring & Security Guardrails',
    category: 'Continuous Health Monitoring',
    description: 'Automated CI/CD compliance preventing anti-patterns, technical debt inflation, and security vulnerabilities.',
    stat: '4.2x Faster Onboarding',
  },
]

const sectors = [
  { name: 'Fintech & Payments', tag: 'High-Throughput Microservices', health: '99.4%', loc: '1.2M Lines' },
  { name: 'AI & SaaS Platforms', tag: 'Distributed Agent Pipelines', health: '98.9%', loc: '850K Lines' },
  { name: 'E-Commerce Engines', tag: 'Event-Driven Architecture', health: '97.8%', loc: '640K Lines' },
  { name: 'DevTools & Cloud Infrastructure', tag: 'High-Performance Rust/Go', health: '99.9%', loc: '2.1M Lines' },
  { name: 'Healthtech & Security', tag: 'HIPAA/SOC2 Compliant Stacks', health: '99.2%', loc: '910K Lines' },
]

const clientStories = [
  {
    quote: 'DevBrain AI mapped our multi-repo microservices architecture in minutes, exposing 14 circular dependency cycles that had bottlenecked our deployment pipelines for months.',
    author: 'Elena Rostova',
    role: 'VP of Engineering',
    company: 'Fintech Core Systems',
    metrics: 'Freed 340 Dev Hours / Mo',
  },
  {
    quote: 'The interactive graph and AI Concierge reduced our new developer onboarding time from 3 weeks down to just 3 days. It is an indispensable architectural superpower.',
    author: 'Marcus Vance',
    role: 'Chief Technology Officer',
    company: 'Nexus SaaS Cloud',
    metrics: '70% Faster Onboarding',
  },
  {
    quote: 'We avoided a disastrous production outage by catching an unindexed query cascade in our dependency graph before shipping to 2 million active users.',
    author: 'Sarah Chen',
    role: 'Lead Architect',
    company: 'ScaleX Data Infrastructure',
    metrics: '99.99% Uptime Verified',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [activeServiceHover, setActiveServiceHover] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)

  // Interactive ROI Calculator State
  const [repoSizeKLOC, setRepoSizeKLOC] = useState(150) // KLOC (1000s lines of code)
  const [teamDevs, setTeamDevs] = useState(12)

  // Calculated ROI values
  const hoursSavedPerDevMonth = Math.round(18 + repoSizeKLOC * 0.08)
  const totalMonthlyHoursSaved = hoursSavedPerDevMonth * teamDevs
  const annualCostSaved = (totalMonthlyHoursSaved * 75 * 12).toLocaleString()

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-gold/30 selection:text-white font-sans">
      <CustomCursor />

      {/* Navigation Bar (Valeran Style Translucent Glass) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-bg-primary/75 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-rust flex items-center justify-center shadow-lg shadow-accent-gold/15">
              <Network className="h-4 w-4 text-bg-primary font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-text-primary group-hover:text-accent-gold transition-colors">
                DevBrain <span className="text-accent-gold font-light">AI</span>
              </span>
              <span className="text-[10px] text-text-muted tracking-widest uppercase font-mono">
                Architecture Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Bracket Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs">
            <a href="#services" className="link-bracket">
              <span className="bracket bracket-left">[</span>
              <span>Services</span>
              <span className="bracket bracket-right">]</span>
            </a>
            <a href="#graph-sandbox" className="link-bracket">
              <span className="bracket bracket-left">[</span>
              <span>Live Graph</span>
              <span className="bracket bracket-right">]</span>
            </a>
            <a href="#sectors" className="link-bracket">
              <span className="bracket bracket-left">[</span>
              <span>Sectors</span>
              <span className="bracket bracket-right">]</span>
            </a>
            <a href="#calculator" className="link-bracket">
              <span className="bracket bracket-left">[</span>
              <span>ROI Calculator</span>
              <span className="bracket bracket-right">]</span>
            </a>
            <a href="#stories" className="link-bracket">
              <span className="bracket bracket-left">[</span>
              <span>Case Studies</span>
              <span className="bracket bracket-right">]</span>
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary font-mono mr-2">
              <span className="bracket text-accent-gold">[</span>
              <span>En</span>
              <span className="bracket text-accent-gold">]</span>
            </div>

            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-gold to-accent-rust px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:brightness-110 active:scale-95 shadow-md shadow-accent-gold/20"
              >
                <span>Launch App</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="link-bracket text-xs hidden sm:inline-flex"
                >
                  <span className="bracket bracket-left">[</span>
                  <span>Sign In</span>
                  <span className="bracket bracket-right">]</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-gold to-accent-rust px-4 py-2 text-xs font-semibold text-bg-primary transition-all hover:brightness-110 active:scale-95 shadow-md shadow-accent-gold/20"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-border-muted/40">
        {/* Subtle Background Glows */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-accent-gold/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-accent-rust/10 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-8">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-bg-muted/80 border border-accent-gold/30 px-3.5 py-1.5 text-xs text-text-primary backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-accent-gold animate-pulse" />
                <span className="font-mono text-accent-gold">DevBrain AI v2.5 Release</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-secondary">Enterprise Codebase Intelligence</span>
              </div>

              {/* Main Headline (Valeran High-Contrast Style) */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.08] text-balance">
                Understand your financial & technical codebase to <span className="gold-gradient-text italic font-serif">grow with peace of mind</span>.
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
                DevBrain AI audits, maps, and monitors complex software architectures. Empowering engineering leaders, developers, and enterprises with total clarity, discretion, and structural precision.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(token ? '/dashboard' : '/register')}
                  className="inline-flex items-center gap-3 rounded-lg bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-primary transition-all hover:bg-accent-gold-light hover:shadow-lg hover:shadow-accent-gold/25 active:scale-95"
                >
                  <span>Explore DevBrain Platform</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <a
                  href="#graph-sandbox"
                  className="inline-flex items-center gap-2 rounded-lg bg-bg-muted border border-border px-5 py-3 text-sm font-medium text-text-primary hover:bg-bg-subtle transition-colors"
                >
                  <Activity className="h-4 w-4 text-accent-gold" />
                  <span>View Live Interactive Graph</span>
                </a>
              </div>

              {/* Trust Specs */}
              <div className="pt-6 border-t border-border-muted/50 grid grid-cols-3 gap-6 text-xs font-mono">
                <div>
                  <div className="text-text-muted uppercase text-[10px]">Graph Topography</div>
                  <div className="text-text-primary font-bold text-sm mt-0.5">Real-Time AST</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase text-[10px]">Code Privacy</div>
                  <div className="text-text-primary font-bold text-sm mt-0.5">SOC2 & Zero-Log</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase text-[10px]">Refactoring Speed</div>
                  <div className="text-text-primary font-bold text-sm mt-0.5">4.2x Faster</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card Visual */}
            <div className="lg:col-span-5">
              <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-5 border border-accent-gold/30 shadow-2xl relative overflow-hidden">
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent-gold/20 blur-2xl" />

                {/* Simulated Header Bar */}
                <div className="flex items-center justify-between border-b border-border-muted/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-accent-rust" />
                    <span className="h-3 w-3 rounded-full bg-accent-gold" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-mono text-xs text-text-secondary">devbrain-ai-core</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-muted text-accent-gold border border-accent-gold/20">
                    Live Audit Active
                  </span>
                </div>

                {/* Code & Graph Snippet Preview */}
                <div className="bg-bg-primary/90 rounded-xl p-4 font-mono text-xs space-y-2 border border-border-muted text-text-secondary">
                  <div className="flex items-center justify-between text-text-muted text-[11px] pb-2 border-b border-border-muted/40">
                    <span>Target Node: /src/api/projects.js</span>
                    <span className="text-emerald-400">Score: 98/100</span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-accent-rust">import</span> &#123; getArchitecture &#125; <span className="text-accent-rust">from</span> <span className="text-accent-gold">&apos;./services/graph&apos;</span>
                    </div>
                    <div>
                      <span className="text-accent-rust">export const</span> <span className="text-text-primary">auditPipeline</span> = <span className="text-accent-rust">async</span> () =&gt; &#123;
                    </div>
                    <div className="pl-4 text-text-muted">
                      <span className="text-accent-gold">// Automated AST indexing & coupling detection</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-accent-rust">const</span> graph = <span className="text-accent-rust">await</span> analyzeGraph(&#123; depth: <span className="text-emerald-400">5</span> &#125;)
                    </div>
                    <div className="pl-4">
                      <span className="text-accent-rust">return</span> graph.verifyZeroCycle()
                    </div>
                    <div>&#125;</div>
                  </div>
                </div>

                {/* Live Metrics Mini Bar */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-bg-muted/70 p-3 rounded-lg border border-border/50">
                    <span className="text-text-muted block text-[10px] uppercase">AST Nodes Parsed</span>
                    <span className="text-base font-bold text-text-primary mt-0.5 block">14,280 files</span>
                  </div>
                  <div className="bg-bg-muted/70 p-3 rounded-lg border border-border/50">
                    <span className="text-text-muted block text-[10px] uppercase">Cyclomatic Risk</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">Low (0.04)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTIONAL HOVER SERVICES SECTION (Valeran Inspired) */}
      <section id="services" className="py-24 border-b border-border-muted/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-xs font-mono text-accent-gold uppercase tracking-wider mb-2">
                [ Strategic Services & Capabilities ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
                For serene architectural growth.
              </h2>
            </div>
            <p className="text-sm text-text-secondary max-w-md">
              Make your software projects long-term viable with an end-to-end architectural vision and clear structural guidance.
            </p>
          </div>

          {/* Directional List Items */}
          <div className="divide-y divide-border/40 border-y border-border/40">
            {services.map((s) => (
              <div
                key={s.id}
                onMouseEnter={() => setActiveServiceHover(s.id)}
                onMouseLeave={() => setActiveServiceHover(null)}
                className="directional-item group py-8 px-4 sm:px-6 cursor-pointer"
              >
                <div className="directional-tile" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6 md:w-1/2">
                    <span className="font-mono text-sm text-accent-gold font-bold">{s.id}</span>
                    <div>
                      <h3 className="text-xl font-medium text-text-primary group-hover:text-accent-gold transition-colors">
                        {s.title}
                      </h3>
                      <span className="text-xs text-text-muted block mt-1 font-mono">{s.category}</span>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary md:w-1/3 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/6">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-bg-muted border border-border text-accent-gold">
                      {s.stat}
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-text-muted group-hover:text-accent-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE GRAPH SANDBOX (The Prompt Request) */}
      <section id="graph-sandbox" className="py-24 bg-bg-sidebar/40 border-b border-border-muted/40">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-accent-rust uppercase tracking-wider mb-2">
                [ Interactive Telemetry & Graph Sandbox ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
                Fully functional real-time graph analytics.
              </h2>
            </div>
            <p className="text-sm text-text-secondary max-w-md">
              Interact directly with the live telemetry engine below. Toggle metrics, change time horizons, filter repository datasets, and inspect real-time architecture health.
            </p>
          </div>

          {/* Embedded Interactive Analytics Graph */}
          <InteractiveAnalyticsGraph />
        </div>
      </section>

      {/* SECTOR SHOWCASE MARQUEE (Valeran Inspired) */}
      <section id="sectors" className="py-24 border-b border-border-muted/40 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 mb-12">
          <div className="text-xs font-mono text-accent-gold uppercase tracking-wider mb-2">
            [ Domain Excellence ]
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
            Engineered for high-stakes software ecosystems.
          </h2>
        </div>

        {/* Infinite Marquee Strip */}
        <div className="relative w-full">
          <div className="animate-marquee flex gap-6 px-6">
            {[...sectors, ...sectors].map((sec, idx) => (
              <div
                key={idx}
                className="w-80 shrink-0 glass-panel glass-panel-hover p-6 rounded-xl space-y-4 border border-border/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                    {sec.health} Health Score
                  </span>
                  <Code2 className="h-4 w-4 text-text-muted" />
                </div>
                <h4 className="text-lg font-medium text-text-primary">{sec.name}</h4>
                <p className="text-xs text-text-secondary font-mono">{sec.tag}</p>
                <div className="pt-3 border-t border-border-muted/50 flex items-center justify-between text-xs text-text-muted">
                  <span>Codebase Volume:</span>
                  <span className="text-text-primary font-bold">{sec.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROI & ARCHITECTURE CALCULATOR */}
      <section id="calculator" className="py-24 bg-bg-sidebar/30 border-b border-border-muted/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-wider">
                [ Interactive Yield & Efficiency Model ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
                Calculate your team&apos;s architectural ROI.
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Adjust your codebase parameters to estimate hours saved, onboarding acceleration, and cost reductions delivered by DevBrain AI.
              </p>

              <div className="space-y-6 pt-4">
                {/* Slider 1: Codebase Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Codebase Volume:</span>
                    <span className="text-accent-gold font-bold">{repoSizeKLOC * 1000} Lines of Code</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={repoSizeKLOC}
                    onChange={(e) => setRepoSizeKLOC(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-subtle rounded-lg appearance-none cursor-pointer accent-accent-gold"
                  />
                </div>

                {/* Slider 2: Team Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Engineering Team Size:</span>
                    <span className="text-accent-gold font-bold">{teamDevs} Developers</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={teamDevs}
                    onChange={(e) => setTeamDevs(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-subtle rounded-lg appearance-none cursor-pointer accent-accent-gold"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-8 rounded-2xl border border-accent-gold/40 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent-gold/10 blur-3xl" />

                <h3 className="text-sm font-mono uppercase tracking-widest text-text-muted">
                  Projected Annual Efficiency Yield
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-bg-muted/70 p-4 rounded-xl border border-border/60">
                    <span className="text-xs text-text-muted block font-mono">Monthly Hours Saved</span>
                    <span className="text-2xl font-bold text-text-primary mt-1 block gold-gradient-text">
                      {totalMonthlyHoursSaved} hrs
                    </span>
                  </div>
                  <div className="bg-bg-muted/70 p-4 rounded-xl border border-border/60">
                    <span className="text-xs text-text-muted block font-mono">Per-Dev Gain</span>
                    <span className="text-2xl font-bold text-text-primary mt-1 block">
                      {hoursSavedPerDevMonth} hrs/mo
                    </span>
                  </div>
                  <div className="bg-bg-muted/70 p-4 rounded-xl border border-border/60">
                    <span className="text-xs text-text-muted block font-mono">Annual Savings</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                      ${annualCostSaved}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-primary/90 border border-border-muted text-xs text-text-secondary flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-text-primary font-medium block">Verified Engineering Methodology</span>
                    <span>Based on average senior developer hourly rates ($75/hr) and 60% reduction in architectural context-switching overhead.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT STORIES / TESTIMONIAL SLIDER */}
      <section id="stories" className="py-24 border-b border-border-muted/40">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-accent-gold uppercase tracking-wider mb-2">
                [ Client Stories & Case Studies ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
                Their Successes, Our Success.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStoryIndex((prev) => (prev > 0 ? prev - 1 : clientStories.length - 1))}
                className="p-2.5 rounded-full bg-bg-muted hover:bg-bg-subtle text-text-primary border border-border transition-colors"
                aria-label="Previous story"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                onClick={() => setStoryIndex((prev) => (prev < clientStories.length - 1 ? prev + 1 : 0))}
                className="p-2.5 rounded-full bg-bg-muted hover:bg-bg-subtle text-text-primary border border-border transition-colors"
                aria-label="Next story"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Story Card */}
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-border/80 shadow-2xl relative overflow-hidden">
            <div className="max-w-4xl space-y-8">
              <p className="text-xl md:text-2xl font-serif leading-relaxed text-text-primary italic">
                &ldquo;{clientStories[storyIndex].quote}&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border-muted/50">
                <div>
                  <div className="text-base font-bold text-text-primary">{clientStories[storyIndex].author}</div>
                  <div className="text-xs text-text-secondary font-mono">
                    {clientStories[storyIndex].role} &bull; {clientStories[storyIndex].company}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-mono font-medium border border-accent-gold/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{clientStories[storyIndex].metrics}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & FINAL CTA (Valeran Style) */}
      <footer className="pt-20 pb-12 bg-bg-sidebar border-t border-border/40 text-xs">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          {/* Top Banner CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 md:p-12 rounded-2xl bg-gradient-to-r from-bg-card to-bg-muted border border-accent-gold/30 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
                Ready to transform your codebase architecture?
              </h3>
              <p className="text-sm text-text-secondary">
                Launch DevBrain AI today or schedule a private architectural consultation.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(token ? '/dashboard' : '/register')}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-primary transition-all hover:bg-accent-gold-light shadow-lg shadow-accent-gold/20"
              >
                <span>Launch App</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Links & Brand Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-text-secondary">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-accent-gold flex items-center justify-center text-bg-primary font-bold text-xs">
                  D
                </div>
                <span className="font-bold text-sm text-text-primary">DevBrain AI</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                AI-Powered Codebase Architecture Analysis & Concierge Platform for Engineering Teams.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-text-primary font-bold uppercase text-[10px] tracking-wider font-mono">Platform</div>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="hover:text-text-primary">Dashboard</Link></li>
                <li><Link to="/architecture" className="hover:text-text-primary">Architecture Map</Link></li>
                <li><Link to="/explorer" className="hover:text-text-primary">Code Explorer</Link></li>
                <li><Link to="/chat" className="hover:text-text-primary">AI Concierge</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-text-primary font-bold uppercase text-[10px] tracking-wider font-mono">Resources</div>
              <ul className="space-y-2">
                <li><a href="#services" className="hover:text-text-primary">Capabilities</a></li>
                <li><a href="#graph-sandbox" className="hover:text-text-primary">Live Graph</a></li>
                <li><a href="#calculator" className="hover:text-text-primary">ROI Calculator</a></li>
                <li><a href="#stories" className="hover:text-text-primary">Case Studies</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-text-primary font-bold uppercase text-[10px] tracking-wider font-mono">Compliance</div>
              <ul className="space-y-2">
                <li><span className="text-text-muted">SOC2 Type II</span></li>
                <li><span className="text-text-muted">ISO 27001</span></li>
                <li><span className="text-text-muted">GDPR Compliant</span></li>
                <li><span className="text-text-muted">Zero-Data Log</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Telemetry Status */}
          <div className="pt-8 border-t border-border-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-text-muted font-mono text-[11px]">
            <div>&copy; {new Date().getFullYear()} DevBrain AI Inc. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.99% SLA)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
