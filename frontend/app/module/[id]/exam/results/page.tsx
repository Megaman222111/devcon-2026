'use client'

import { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ChevronRight, RotateCcw, BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/lib/store'

export default function ExamResultsPage() {
  const params = useParams<{ id: string }>()
  const moduleId = params?.id
  const searchParams = useSearchParams()
  const correct = parseInt(searchParams.get('correct') || '0', 10)
  const total = parseInt(searchParams.get('total') || '1', 10)
  const attemptId = searchParams.get('attempt') || `${correct}-${total}`
  const score = Math.round((correct / total) * 100)
  const passed = score >= 70
  const earnedLightning = Math.max(0, correct * 20)

  const triggerConfetti = useAppStore((state) => state.triggerConfetti)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)
  const markModuleComplete = useAppStore((state) => state.markModuleComplete)

  useEffect(() => {
    if (passed) {
      triggerConfetti()
      markModuleComplete(moduleId ?? 'mod-2')
    }
  }, [markModuleComplete, moduleId, passed, triggerConfetti])

  useEffect(() => {
    if (earnedLightning <= 0 || !moduleId) return
    const rewardKey = `exam-reward:${moduleId}:${attemptId}`
    if (window.sessionStorage.getItem(rewardKey)) return

    addXP(earnedLightning)
    addToast({ type: 'xp-gain', message: `+${earnedLightning} lightning from exam results.` })
    window.sessionStorage.setItem(rewardKey, '1')
  }, [addToast, addXP, attemptId, earnedLightning, moduleId])

  return (
    <AppShell showBottomNav={false} showStats={false}>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-md"
        >
          {/* Shield Icon */}
          <motion.div
            initial={{ y: -50, opacity: 0, rotate: -20 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <div
              className={cn(
                'inline-flex items-center justify-center w-24 h-24 rounded-full',
                passed
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/40'
                  : 'bg-navy-700'
              )}
            >
              <Shield
                size={48}
                className={passed ? 'text-navy-900' : 'text-navy-400'}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              'font-display font-black text-5xl',
              passed ? 'text-amber-500' : 'text-white'
            )}
          >
            {passed ? 'MODULE PASSED!' : 'KEEP GOING'}
          </motion.h1>

          {/* Score */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="mt-6"
          >
            <div className="font-display font-black text-7xl text-white">
              {score}%
            </div>
            <div className="text-navy-400 mt-1">
              {correct} of {total} correct
              {!passed && ` (70% needed)`}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 rounded-full"
          >
            <Zap size={18} className="fill-amber-400 text-amber-400" />
            <span className="font-display font-bold text-xl text-amber-400">
              +{earnedLightning} Lightning
            </span>
          </motion.div>

          {passed ? (
            <>
              {/* CTA */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10"
              >
                <Link
                  href="/home"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-bold text-lg transition-colors btn-glow"
                >
                  UNLOCK MODULE 3
                  <ChevronRight size={20} />
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              {/* Topics to Review */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-left bg-navy-800 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-navy-400 mb-3">
                  TOPICS TO REVIEW
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-navy-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Use of Force Continuum
                  </li>
                  <li className="flex items-center gap-2 text-navy-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Arrest Powers
                  </li>
                </ul>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-col gap-3"
              >
                <Link
                  href="/home"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-navy-700 hover:bg-navy-600 text-white rounded-xl font-bold text-lg transition-colors"
                >
                  <BookOpen size={20} />
                  REVIEW WEAK TOPICS
                </Link>
                <button
                  disabled
                  className="flex items-center justify-center gap-2 w-full py-4 bg-navy-800 text-navy-500 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  <RotateCcw size={18} />
                  RETAKE IN 24:00:00
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  )
}
