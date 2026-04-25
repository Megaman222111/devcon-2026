'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Award, ChevronRight, RotateCcw, Star, Flame } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { useAppStore } from '@/lib/store'
import { lessonsForModule } from '@/lib/mock-data'

export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const lessonId = params?.id
  const searchParams = useSearchParams()
  const correct = parseInt(searchParams.get('correct') || '0', 10)
  const total = parseInt(searchParams.get('total') || '1', 10)
  const attemptId = searchParams.get('attempt') || `${correct}-${total}`
  const score = Math.round((correct / total) * 100)
  const passed = score >= 70
  const earnedLightning = Math.max(0, correct * 20)
  const lessonMeta = useMemo(
    () => Object.values(lessonsForModule).flat().find((lesson) => lesson.id === lessonId),
    [lessonId]
  )

  const progress = useAppStore((state) => state.progress)
  const triggerConfetti = useAppStore((state) => state.triggerConfetti)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)
  const markLessonComplete = useAppStore((state) => state.markLessonComplete)
  const markModuleComplete = useAppStore((state) => state.markModuleComplete)

  useEffect(() => {
    if (passed) {
      triggerConfetti()
    }
  }, [passed, triggerConfetti])

  useEffect(() => {
    if (earnedLightning <= 0 || !lessonId) return
    const rewardKey = `lesson-reward:${lessonId}:${attemptId}`
    if (window.sessionStorage.getItem(rewardKey)) return

    addXP(earnedLightning)
    addToast({ type: 'xp-gain', message: `+${earnedLightning} lightning from quiz results.` })
    window.sessionStorage.setItem(rewardKey, '1')
  }, [addToast, addXP, attemptId, earnedLightning, lessonId])

  useEffect(() => {
    if (!passed || !lessonId) return
    if (progress.completedLessons.includes(lessonId)) return

    markLessonComplete(lessonId)

    const moduleId = lessonMeta?.moduleId
    if (moduleId) {
      const moduleLessons = lessonsForModule[moduleId] ?? []
      const completedSet = new Set([...progress.completedLessons, lessonId])
      const isModuleComplete =
        moduleLessons.length > 0 && moduleLessons.every((lesson) => completedSet.has(lesson.id))

      if (isModuleComplete) {
        markModuleComplete(moduleId)
      }
    }
  }, [
    lessonId,
    lessonMeta?.moduleId,
    markLessonComplete,
    markModuleComplete,
    passed,
    progress.completedLessons,
  ])

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
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <Award
                size={40}
                className={passed ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`font-display font-black text-4xl ${
              passed ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {passed ? 'LESSON COMPLETE!' : 'KEEP GOING'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-slate-600 dark:text-slate-300"
          >
            {lessonMeta ? `Lesson ${lessonMeta.number} - ${lessonMeta.title}` : 'Lesson Results'}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                {correct}/{total}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Correct</div>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-3xl font-display font-bold text-amber-600 dark:text-amber-400">
                <Star size={24} className="fill-amber-500 dark:fill-amber-400" />+{earnedLightning}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Lightning Earned</div>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-3xl font-display font-bold text-amber-600 dark:text-amber-400">
                <Flame size={24} className="fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                {progress.streak}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Streak</div>
            </div>
          </motion.div>

          {/* Lightning Progress */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 px-4"
          >
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Level {progress.level}</span>
              <span className="text-amber-600 dark:text-amber-400">
                {progress.xp % 150} / 150 Lightning
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
              className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-lg transition-colors"
            >
              {passed ? 'NEXT LESSON' : 'BACK TO MAP'}
              <ChevronRight size={20} />
            </Link>
            {!passed && (
              <Link
                href={lessonId ? `/lesson/${lessonId}/quiz` : '/home'}
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 rounded-2xl font-bold text-lg transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
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
