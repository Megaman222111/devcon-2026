'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { MatchingQuestion } from '@/types/quiz'

interface MatchingQuestionProps {
  question: MatchingQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
}

type PairMap = Record<string, string>

export function MatchingQuestionComponent({
  question,
  selectedAnswer,
  disabled,
  onAnswer,
}: MatchingQuestionProps) {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)
  const [pairs, setPairs] = useState<PairMap>(() => {
    if (!selectedAnswer) return {}
    try {
      return JSON.parse(selectedAnswer) as PairMap
    } catch {
      return {}
    }
  })

  const definitions = useMemo(
    () => [...question.pairs].sort((a, b) => a.definition.localeCompare(b.definition)),
    [question.pairs]
  )

  useEffect(() => {
    onAnswer(JSON.stringify(pairs))
  }, [onAnswer, pairs])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Terms</div>
          {question.pairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedTermId(pair.id)}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                selectedTermId === pair.id
                  ? 'border-amber-500 bg-amber-500/10 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-100',
                pairs[pair.id] && 'border-emerald-500/50 bg-emerald-500/10'
              )}
            >
              {pair.term}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Definitions</div>
          {definitions.map((pair) => (
            <button
              key={pair.id}
              type="button"
              disabled={disabled || !selectedTermId}
              onClick={() => {
                if (!selectedTermId) return
                setPairs((current) => ({
                  ...current,
                  [selectedTermId]: pair.id,
                }))
                setSelectedTermId(null)
              }}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-slate-100 transition-colors hover:border-amber-500/50"
            >
              {pair.definition}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-400">Tap a term, then tap its matching definition.</p>
    </div>
  )
}
