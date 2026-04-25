'use client'

import { QuizCard } from '@/components/quiz/quiz-card'
import type { MultipleChoiceQuestion, ScenarioMCQQuestion } from '@/types/quiz'

interface MCQQuestionProps {
  question: MultipleChoiceQuestion | ScenarioMCQQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
  eliminatedOptionId?: string | null
}

export function MCQQuestion({
  question,
  selectedAnswer,
  disabled,
  onAnswer,
  eliminatedOptionId,
}: MCQQuestionProps) {
  return (
    <div className="space-y-3">
      {question.options
        .filter((option) => option.id !== eliminatedOptionId)
        .map((option) => (
          <QuizCard
            key={option.id}
            letter={option.id}
            text={option.text}
            selected={selectedAnswer === option.id}
            state={selectedAnswer === option.id ? 'selected' : 'default'}
            disabled={disabled}
            onClick={() => onAnswer(option.id)}
          />
        ))}
    </div>
  )
}
