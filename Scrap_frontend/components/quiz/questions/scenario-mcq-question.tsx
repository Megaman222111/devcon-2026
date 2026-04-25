'use client'

import { MCQQuestion } from './mcq-question'
import type { ScenarioMCQQuestion } from '@/types/quiz'

interface ScenarioMCQQuestionProps {
  question: ScenarioMCQQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
  eliminatedOptionId?: string | null
}

export function ScenarioMCQQuestionComponent(props: ScenarioMCQQuestionProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
        {props.question.scenario}
      </div>
      <MCQQuestion {...props} />
    </div>
  )
}
