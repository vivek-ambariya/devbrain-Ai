import { Brain, CheckCircle2 } from 'lucide-react'

const features = [
  'Index repositories and documentation',
  'Map APIs and architecture automatically',
  'Ask AI questions with full project context',
  'Onboard new engineers faster',
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] border-r border-border bg-bg-sidebar flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="h-8 w-8 rounded-md bg-bg-subtle border border-border flex items-center justify-center">
              <Brain className="h-4 w-4 text-text-primary" />
            </div>
            <span className="font-semibold text-text-primary text-sm">DevBrain AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary leading-snug mb-3">
            Enterprise engineering intelligence for your codebase
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Understand architecture, APIs, and dependencies — powered by AI and built for engineering teams.
          </p>
        </div>

        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>

        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} DevBrain AI · Built for engineers
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[340px]">
          {children}
        </div>
      </div>
    </div>
  )
}
