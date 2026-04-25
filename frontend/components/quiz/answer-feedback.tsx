'use client'

import { CheckCircle2, XCircle, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AnswerFeedbackProps {
  show: boolean
  correct: boolean
  explanation: string
  reference?: string
  xpGained?: number
  onContinue: () => void
}

export function AnswerFeedback({
  show,
  correct,
  explanation,
  reference,
  xpGained = 0,
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
            'fixed bottom-0 left-0 right-0 z-50 p-6 rounded-t-3xl',
            correct ? 'bg-emerald-500' : 'bg-red-500'
          )}
        >
          <div className="max-w-xl mx-auto">
            <div className="flex items-start gap-4">
              {correct ? (
                <CheckCircle2 size={28} className="text-white flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={28} className="text-white flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-display font-black text-2xl text-white">
                  {correct ? 'CORRECT!' : 'INCORRECT'}
                </h3>
                <p className="text-white/90 mt-2">{explanation}</p>
                {reference && (
                  <p className="text-white/70 text-sm italic mt-2">({reference})</p>
                )}
              </div>
              {correct && xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-white font-display font-bold"
                >
                  <Star size={16} className="fill-white" />
                  <span>+{xpGained}</span>
                </motion.div>
              )}
            </div>

            <button
              onClick={onContinue}
              className={cn(
                'mt-6 w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors',
                correct
                  ? 'bg-white text-emerald-600 hover:bg-white/90'
                  : 'bg-white text-red-600 hover:bg-white/90'
              )}
            >
              {correct ? 'CONTINUE' : 'GOT IT'}
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
