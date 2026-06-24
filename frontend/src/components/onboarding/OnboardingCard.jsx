import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Layers, GitBranch, Package, GraduationCap } from 'lucide-react'
import Card from '../ui/Card'
import MarkdownRenderer from '../chat/MarkdownRenderer'
import { cn } from '../../utils/cn'

const iconMap = {
  layers: Layers,
  'git-branch': GitBranch,
  package: Package,
  'graduation-cap': GraduationCap,
}

export default function OnboardingCard({ section, index = 0 }) {
  const [expanded, setExpanded] = useState(index === 0)
  const Icon = iconMap[section.icon] || Layers

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card padding={false} className="overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-4 w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
          aria-expanded={expanded}
        >
          <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary">{section.title}</h3>
            <p className="text-sm text-text-secondary mt-0.5">{section.description}</p>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-text-secondary" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border pt-4">
                <MarkdownRenderer content={section.content} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.steps.map((step, i) => (
                    <span
                      key={step}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs',
                        'bg-bg-primary border border-border text-text-secondary'
                      )}
                    >
                      <span className="h-4 w-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export function LearningPath({ sections }) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="relative pl-14"
          >
            <div className="absolute left-4 top-1 h-4 w-4 rounded-full bg-accent border-2 border-bg-primary z-10" />
            <h4 className="font-medium text-text-primary">{section.title}</h4>
            <p className="text-sm text-text-secondary mt-1">{section.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {section.steps.map((step) => (
                <span
                  key={step}
                  className="text-xs px-2 py-1 rounded bg-bg-card border border-border text-text-secondary"
                >
                  {step}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
