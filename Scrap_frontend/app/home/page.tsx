'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Flame, Star, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ModuleHeader } from '@/components/map/module-header'
import { PathNode } from '@/components/map/path-node'
import { ExamCard } from '@/components/map/exam-card'
import { useAppStore } from '@/lib/store'
import { modules, lessonsForModule } from '@/lib/mock-data'
import { staggerContainer, staggerItem } from '@/lib/motion-presets'

export default function HomePage() {
  const progress = useAppStore((state) => state.progress)
  const user = useAppStore((state) => state.user)
  const addToast = useAppStore((state) => state.addToast)
  const addXP = useAppStore((state) => state.addXP)

  const handleClaimBonus = () => {
    addXP(5)
    addToast({ type: 'xp-gain', message: '+5 XP Daily Bonus!' })
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 py-6 pb-24">
        {/* Streak Banner */}
        {progress.streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-[#FF9600]/10 border-2 border-[#FF9600]/30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF9600]/20">
                  <Flame size={26} className="text-[#FF9600] animate-flame-pulse" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">
                    {progress.streak} day streak!
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep it going{user?.name ? `, ${user.name}` : ''}!
                  </p>
                </div>
              </div>
              <button
                onClick={handleClaimBonus}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF9600] hover:bg-[#E68A00] text-white font-bold text-sm rounded-xl transition-colors shadow-[0_3px_0_#CC7A00] active:shadow-none active:translate-y-[3px]"
              >
                <Star size={14} />
                +5 XP
              </button>
            </div>
          </motion.div>
        )}

        {/* Modules Path */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-10"
        >
          {modules.map((module) => {
            const lessons = lessonsForModule[module.id] || []
            const isModuleComplete = module.completedLessons === module.lessonsCount

            return (
              <motion.section key={module.id} variants={staggerItem}>
                {/* Module Header */}
                <ModuleHeader module={module} />

                {/* Lesson Nodes - Zigzag Path */}
                {!module.locked && (
                  <div className="relative mt-8 flex flex-col items-center">
                    {/* Nodes */}
                    <div className="flex flex-col items-center gap-6">
                      {lessons.map((lesson, index) => {
                        // Create zigzag pattern
                        const offset = index % 2 === 0 ? '-40px' : '40px'
                        
                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ marginLeft: offset }}
                          >
                            <Link href={`/lesson/${lesson.id}`}>
                              <PathNode
                                state={lesson.state}
                                lessonNumber={lesson.number}
                                lessonTitle={lesson.title}
                                xp={lesson.xp}
                              />
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Module Exam Card */}
                {!module.locked && (
                  <div className="mt-8">
                    <ExamCard
                      moduleId={module.id}
                      moduleNumber={module.number}
                      questionsCount={15}
                      passingScore={70}
                      locked={!isModuleComplete}
                      passed={module.number === 1}
                      score={module.number === 1 ? 87 : undefined}
                    />
                  </div>
                )}
              </motion.section>
            )
          })}
        </motion.div>

        {/* Continue Learning CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl bg-primary/10 border-2 border-primary/20 text-center"
        >
          <h3 className="font-bold text-lg text-foreground">Ready to continue?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off</p>
          <Link
            href="/lesson/l-1-2"
            className="mt-4 inline-flex items-center gap-2 btn-duo btn-duo-primary"
          >
            Continue Learning
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      </div>
    </AppShell>
  )
}
