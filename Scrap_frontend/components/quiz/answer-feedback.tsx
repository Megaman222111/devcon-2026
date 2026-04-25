'use client'

import { CheckCircle2, ChevronRight, Heart, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnswerFeedbackProps {
  show: boolean
  correct: boolean
  explanation: string
  reference?: string
  xpGained?: number
  correctAnswerText?: string
  heartLost?: boolean
  outOfHearts?: boolean
  onContinue: () => void
}

export function AnswerFeedback({
  show,
  correct,
  explanation,
  reference,
  xpGained = 0,
  correctAnswerText,
  heartLost = false,
  outOfHearts = false,
  onContinue,
}: AnswerFeedbackProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 shadow-2xl',
            correct ? 'bg-emerald-500' : 'bg-red-500'
          )}
        >
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start gap-4">
              {correct ? (
                <CheckCircle2 size={28} className="mt-0.5 shrink-0 text-white" />
              ) : (
                <XCircle size={28} className="mt-0.5 shrink-0 text-white" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl font-black text-white">
                    {correct ? 'CORRECT!' : 'NOT QUITE'}
                  </h3>
                  {correct ? (
                    <div className="text-sm font-bold text-white">+{xpGained} XP</div>
                  ) : heartLost ? (
                    <div className="flex items-center gap-1 text-sm font-bold text-white">
                      <Heart size={14} className="fill-white text-white" />
                      -1
                    </div>
                  ) : null}
                </div>

                {!correct && correctAnswerText && (
                  <p className="mt-3 text-sm font-medium text-white/95">
                    The correct answer was: {correctAnswerText}
                  </p>
                )}

                <p className="mt-3 text-white/90">{explanation}</p>
                {reference && <p className="mt-2 text-sm italic text-white/70">📖 {reference}</p>}
                {outOfHearts && (
                  <div className="mt-4 rounded-2xl border border-white/20 bg-black/10 px-4 py-3 text-sm text-white/90">
                    You&apos;re out of lives. After this question, review the lesson before continuing.
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className={cn(
                'mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-lg font-bold transition-colors',
                correct
                  ? 'bg-white text-emerald-600 hover:bg-white/90'
                  : 'bg-white text-red-600 hover:bg-white/90'
              )}
            >
              {outOfHearts ? 'REVIEW LESSON' : correct ? 'CONTINUE' : 'GOT IT'}
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
