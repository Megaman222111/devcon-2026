'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Award, ChevronRight, RotateCcw, Star, Flame } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { getLessonContent } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const correct = parseInt(searchParams.get('correct') || '0', 10)
  const total = parseInt(searchParams.get('total') || '1', 10)
  const score = Math.round((correct / total) * 100)
  const passed = score >= 70
  const lesson = getLessonContent(params.id)

  const progress = useAppStore((state) => state.progress)
  const triggerConfetti = useAppStore((state) => state.triggerConfetti)

  useEffect(() => {
    if (passed) {
      triggerConfetti()
    }
  }, [passed, triggerConfetti])

  return (
    <AppShell showBottomNav={false} showStats={false}>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-md"
        >
          {/* Badge/Icon */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                passed
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30'
                  : 'bg-navy-700'
              }`}
            >
              <Award
                size={40}
                className={passed ? 'text-navy-900' : 'text-navy-400'}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`font-display font-black text-4xl ${
              passed ? 'text-amber-500' : 'text-white'
            }`}
          >
            {passed ? 'LESSON COMPLETE!' : 'KEEP GOING'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-navy-300"
          >
            {lesson.lessonLabel} - {lesson.title}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">
                {correct}/{total}
              </div>
              <div className="text-sm text-navy-400">Correct</div>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-3xl font-display font-bold text-amber-400">
                <Star size={24} className="fill-amber-400" />+{correct * 25}
              </div>
              <div className="text-sm text-navy-400">XP Earned</div>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-3xl font-display font-bold text-amber-400">
                <Flame size={24} className="fill-amber-400 text-amber-400" />
                {progress.streak}
              </div>
              <div className="text-sm text-navy-400">Streak</div>
            </div>
          </motion.div>

          {/* XP Progress Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 px-4"
          >
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-navy-400">Level {progress.level}</span>
              <span className="text-amber-400">
                {progress.xp % 150} / 150 XP
              </span>
            </div>
            <ProgressBar
              value={progress.xp % 150}
              max={150}
              height="lg"
              color="gold"
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-col gap-3"
          >
            <Link
              href="/home"
              className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-bold text-lg transition-colors btn-glow"
            >
              {passed ? 'NEXT LESSON' : 'BACK TO MAP'}
              <ChevronRight size={20} />
            </Link>
            {!passed && (
              <Link
                href={`/lesson/${params.id}/quiz`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-navy-700 hover:bg-navy-600 text-white rounded-xl font-bold text-lg transition-colors"
              >
                <RotateCcw size={18} />
                TRY AGAIN
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}
