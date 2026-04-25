'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AnimationEngine } from './animation-engine'
import { ScenarioFeedback } from './scenario-feedback'
import { cn } from '@/lib/utils'
import type { ScenarioData } from '@/lib/mock-data'

interface ScenarioPlayerProps {
  scenario: ScenarioData
  onComplete: (correct: boolean) => void
  onSkip: () => void
}

export function ScenarioPlayer({ scenario, onComplete, onSkip }: ScenarioPlayerProps) {
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  const correctOption = useMemo(
    () => scenario.options.find((option) => option.id === scenario.correctOptionId),
    [scenario.correctOptionId, scenario.options]
  )
  const correct = selectedOption === scenario.correctOptionId

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-2 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Skip
        </button>
        <span>Module 1 · 🎬</span>
      </div>

      <div className="relative">
        <AnimationEngine
          imageUrl={scenario.imageUrl}
          altText={scenario.altText}
          locationLabel={scenario.locationLabel}
          replayKey={replayKey}
          dimmed={showQuestion || showFeedback}
          onComplete={() => setShowQuestion(true)}
        />

        {showQuestion && !showFeedback && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] border-t border-amber-500/30 bg-slate-950/92 p-5 backdrop-blur">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
              What would you do?
            </div>
            <p className="mt-3 text-lg leading-8 text-white">{scenario.question}</p>

            <div className="mt-5 space-y-2">
              {scenario.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left text-white transition-colors',
                    selectedOption === option.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-800/80 hover:border-amber-500/50 hover:bg-slate-700/80'
                  )}
                >
                  <span className="mr-2 font-semibold text-amber-300">{option.id.toUpperCase()}</span>
                  {option.text}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!selectedOption}
              onClick={() => setShowFeedback(true)}
              className="mt-5 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              Check Response
            </button>
          </div>
        )}

        {showFeedback && (
          <ScenarioFeedback
            correct={correct}
            explanation={scenario.explanation}
            reference={scenario.reference}
            steps={scenario.steps}
            correctAnswerText={
              correctOption ? `${correctOption.id.toUpperCase()} — ${correctOption.text}` : scenario.correctOptionId
            }
            xpGained={correct ? 15 : 0}
            onReplay={() => setReplayKey((value) => value + 1)}
            onContinue={() => onComplete(correct)}
          />
        )}
      </div>
    </div>
  )
}
