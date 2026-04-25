'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface QuizCardProps {
  letter: string
  text: string
  selected: boolean
  state: 'default' | 'selected' | 'correct' | 'incorrect' | 'correct-unselected'
  disabled: boolean
  onClick: () => void
}

const letterMap: Record<string, string> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
}

export function QuizCard({
  letter,
  text,
  selected,
  state,
  disabled,
  onClick,
}: QuizCardProps) {
  const stateStyles = {
    default:
      'bg-white border-slate-200 hover:border-amber-400 dark:bg-slate-900 dark:border-slate-700',
    selected: 'bg-amber-100 border-amber-500 dark:bg-amber-500/15',
    correct: 'bg-emerald-500 border-emerald-400 text-white',
    incorrect: 'bg-red-500 border-red-400 text-white',
    'correct-unselected':
      'bg-emerald-50 border-emerald-500 dark:bg-emerald-500/10',
  }

  const letterStyles = {
    default: 'bg-amber-100 text-amber-700 dark:bg-slate-800 dark:text-amber-300',
    selected: 'bg-amber-500 text-slate-950',
    correct: 'bg-white/20 text-white',
    incorrect: 'bg-white/20 text-white',
    'correct-unselected':
      'bg-emerald-200 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-200',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      animate={
        state === 'correct'
          ? { scale: [1, 1.03, 1] }
          : state === 'incorrect'
          ? { x: [0, -6, 6, -4, 4, 0] }
          : {}
      }
      transition={{ duration: state === 'incorrect' ? 0.4 : 0.3 }}
      className={cn(
        'flex items-center gap-4 w-full p-4 rounded-xl border-2 text-left transition-all',
        stateStyles[state],
        disabled && 'cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg font-display font-bold text-lg flex-shrink-0 transition-colors',
          letterStyles[state]
        )}
      >
        {state === 'correct' ? (
          <Check size={20} />
        ) : state === 'incorrect' ? (
          <X size={20} />
        ) : (
          letterMap[letter] || letter.toUpperCase()
        )}
      </div>
      <span
        className={cn(
          'text-base',
          state === 'correct' || state === 'incorrect'
            ? 'text-white'
            : state === 'correct-unselected'
            ? 'text-emerald-800 dark:text-emerald-200'
            : 'text-slate-900 dark:text-slate-100'
        )}
      >
        {text}
      </span>
    </motion.button>
  )
}
