import { motion } from 'framer-motion'
import { GraduationCap, BookOpen } from 'lucide-react'
import OnboardingCard, { LearningPath } from '../components/onboarding/OnboardingCard'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import { onboardingSections } from '../utils/mockData'

export default function Onboarding() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">AI Onboarding Assistant</h1>
            <p className="text-text-secondary mt-0.5">
              Get up to speed with your project quickly
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {onboardingSections.map((section, i) => (
            <OnboardingCard key={section.id} section={section} index={i} />
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <CardTitle>Learning Path</CardTitle>
              </div>
            </CardHeader>
            <LearningPath sections={onboardingSections} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {[
                'Explain project architecture',
                'Explain feature flow',
                'Explain dependencies',
                'What should a new developer learn first?',
              ].map((q) => (
                <button
                  key={q}
                  className="w-full text-left p-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-border transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
