'use client'

import { MCQQuestion } from './questions/mcq-question'
import { TrueFalseQuestionComponent } from './questions/true-false-question'
import { FillBlankQuestionComponent } from './questions/fill-blank-question'
import { ScenarioMCQQuestionComponent } from './questions/scenario-mcq-question'
import { MatchingQuestionComponent } from './questions/matching-question'
import type { QuizQuestion } from '@/types/quiz'

interface QuestionRendererProps {
  question: QuizQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
  eliminatedOptionId?: string | null
}

export function QuestionRenderer({
  question,
  selectedAnswer,
  disabled,
  onAnswer,
  eliminatedOptionId,
}: QuestionRendererProps) {
  if (question.type === 'mcq') {
    return (
      <MCQQuestion
        question={question}
        selectedAnswer={selectedAnswer}
        disabled={disabled}
        onAnswer={onAnswer}
        eliminatedOptionId={eliminatedOptionId}
      />
    )
  }

  if (question.type === 'true-false') {
    return (
      <TrueFalseQuestionComponent
        question={question}
        selectedAnswer={selectedAnswer}
        disabled={disabled}
        onAnswer={onAnswer}
        eliminatedOptionId={eliminatedOptionId}
      />
    )
  }

  if (question.type === 'fill-blank') {
    return (
      <FillBlankQuestionComponent
        question={question}
        selectedAnswer={selectedAnswer}
        disabled={disabled}
        onAnswer={onAnswer}
      />
    )
  }

  if (question.type === 'scenario-mcq') {
    return (
      <ScenarioMCQQuestionComponent
        question={question}
        selectedAnswer={selectedAnswer}
        disabled={disabled}
        onAnswer={onAnswer}
        eliminatedOptionId={eliminatedOptionId}
      />
    )
  }

  return (
    <MatchingQuestionComponent
      question={question}
      selectedAnswer={selectedAnswer}
      disabled={disabled}
      onAnswer={onAnswer}
    />
  )
}
