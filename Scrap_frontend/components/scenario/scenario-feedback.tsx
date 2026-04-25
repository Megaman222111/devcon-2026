'use client'

import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScenarioFeedbackProps {
  correct: boolean
  explanation: string
  reference: string
  steps: string[]
  correctAnswerText: string
  xpGained: number
  onReplay: () => void
  onContinue: () => void
}

export function ScenarioFeedback({
  correct,
  explanation,
  reference,
  steps,
  correctAnswerText,
  xpGained,
  onReplay,
  onContinue,
}: ScenarioFeedbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          {correct ? (
            <CheckCircle2 size={28} className="mt-0.5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle size={28} className="mt-0.5 shrink-0 text-red-400" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <h2 className={cn('font-display text-3xl font-black', correct ? 'text-emerald-400' : 'text-white')}>
                {correct ? 'GOOD CALL!' : 'NOT QUITE'}
              </h2>
              <div className="text-sm font-bold text-amber-300">+{xpGained} XP</div>
            </div>
            {!correct && (
              <p className="mt-3 text-sm text-emerald-300">
                The best answer was: {correctAnswerText}
              </p>
            )}
            <p className="mt-4 leading-7 text-slate-200">{explanation}</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-300">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm italic text-slate-500">📖 {reference}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReplay}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <RotateCcw size={16} />
            Replay Scene
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Continue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
