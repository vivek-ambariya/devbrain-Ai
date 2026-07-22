import { Brain, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  'Index repositories and documentation automatically',
  'Map APIs, graph dependencies, and architecture',
  'Natural language AI Concierge with full project context',
  'Onboard developers 4.2x faster with zero debt inflation',
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row font-sans text-text-primary">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] border-r border-border-muted/60 bg-bg-sidebar flex-col justify-between p-10 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-accent-gold/10 blur-3xl" />

        <div>
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-rust text-bg-primary flex items-center justify-center font-bold shadow-md shadow-accent-gold/20">
                <Brain className="h-4 w-4" />
              </div>
              <span className="font-bold text-text-primary text-sm">
                DevBrain <span className="text-accent-gold font-light">AI</span>
              </span>
            </Link>
            <Link to="/" className="link-bracket text-xs">
              <span className="bracket bracket-left">[</span>
              <span>Back to Home</span>
              <span className="bracket bracket-right">]</span>
            </Link>
          </div>

          <h1 className="text-3xl font-medium text-text-primary leading-snug mb-4 tracking-tight">
            Understand your codebase to <span className="gold-gradient-text italic font-serif">grow with peace of mind</span>.
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Enterprise engineering intelligence, structural graph topography, and AI concierge assistance built for software leaders.
          </p>
        </div>

        <ul className="space-y-3.5 my-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-accent-gold shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="text-xs text-text-muted font-mono">
          &copy; {new Date().getFullYear()} DevBrain AI Inc. &bull; Enterprise SOC2 Type II
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2 text-xs text-accent-gold font-mono">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Landing</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  )
}
