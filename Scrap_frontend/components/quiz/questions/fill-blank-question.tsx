'use client'

import type { FillBlankQuestion } from '@/types/quiz'

interface FillBlankQuestionProps {
  question: FillBlankQuestion
  selectedAnswer: string | null
  disabled: boolean
  onAnswer: (answerId: string) => void
}

export function FillBlankQuestionComponent({
  question,
  selectedAnswer,
  disabled,
  onAnswer,
}: FillBlankQuestionProps) {
  return (
    <div>
      <input
        value={selectedAnswer ?? ''}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={disabled}
        placeholder={question.placeholder ?? 'Type your answer'}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-500"
      />
    </div>
  )
}
