'use client'

import { QuizCard } from '@/components/quiz/quiz-card'
import type { TrueFalseQuestion } from '@/types/quiz'

interface TrueFalseQuestionProps {
  question: TrueFalseQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
  eliminatedOptionId?: string | null
}

const options = [
  { id: 'true', text: 'True' },
  { id: 'false', text: 'False' },
]

export function TrueFalseQuestionComponent({
  selectedAnswer,
  disabled,
  onAnswer,
  eliminatedOptionId,
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-3">
      {options
        .filter((option) => option.id !== eliminatedOptionId)
        .map((option, index) => (
          <QuizCard
            key={option.id}
            letter={String.fromCharCode(97 + index)}
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
