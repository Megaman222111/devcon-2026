'use client'

import { Clapperboard } from 'lucide-react'

interface ScenarioErrorStateProps {
  showSkipOnly?: boolean
  onRetry: () => void
  onSkip: () => void
}

export function ScenarioErrorState({
  showSkipOnly = false,
  onRetry,
  onSkip,
}: ScenarioErrorStateProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-700 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-500">
        <Clapperboard size={28} />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold text-white">Scenario Unavailable</h1>
      <p className="mt-4 text-slate-300">
        We couldn&apos;t generate this scenario right now. Your progress will still be saved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {!showSkipOnly && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Try Again
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          Skip Scenario
        </button>
      </div>
    </div>
  )
}
