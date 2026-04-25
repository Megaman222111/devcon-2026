'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import type { QuizQuestion, QuizResult } from '@/types/quiz'
import { cn } from '@/lib/utils'

interface QuizResultsScreenProps {
  lessonTitle: string
  questions: QuizQuestion[]
  result: QuizResult
  onPrimary: () => void
  onReviewLesson?: () => void
  onRetry?: () => void
  primaryLabel: string
}

export function QuizResultsScreen({
  lessonTitle,
  questions,
  result,
  onPrimary,
  onReviewLesson,
  onRetry,
  primaryLabel,
}: QuizResultsScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const questionLookup = Object.fromEntries(questions.map((question) => [question.id, question]))
  const incorrectAnswers = result.answers.filter((answer) => !answer.correct)

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-700 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <h1 className={cn('font-display text-4xl font-black', result.passed ? 'text-amber-400' : 'text-white')}>
        {result.passed ? 'QUIZ COMPLETE!' : 'KEEP GOING'}
      </h1>
      <p className="mt-2 text-lg text-slate-300">{lessonTitle}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {result.correctCount}/{result.totalQuestions}
          </div>
          <div className="mt-1 text-sm text-slate-400">Correct</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">+{result.xpTotal}</div>
          <div className="mt-1 text-sm text-slate-400">XP Earned</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-center">
          <div className="text-3xl font-bold text-white">{result.score}%</div>
          <div className="mt-1 text-sm text-slate-400">Score</div>
        </div>
      </div>

      {!result.passed && result.weakTopics.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <div className="font-semibold uppercase tracking-[0.18em]">Topics to review</div>
          <ul className="mt-3 space-y-2">
            {result.weakTopics.map((topic) => (
              <li key={topic}>• {topic}</li>
            ))}
          </ul>
        </div>
      )}

      {incorrectAnswers.length > 0 && (
        <div className="mt-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Breakdown</div>
          <div className="mt-4 space-y-3">
            {incorrectAnswers.map((answer, index) => {
              const question = questionLookup[answer.questionId]
              if (!question) return null
              const expanded = expandedId === answer.questionId

              return (
                <div key={answer.questionId} className="rounded-2xl border border-slate-700 bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : answer.questionId)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <span className="text-sm text-slate-200">
                      Q{index + 1} · Incorrect
                    </span>
                    {expanded ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-700 px-4 py-4 text-sm leading-7 text-slate-300">
                      <p className="font-medium text-white">
                        {'question' in question
                          ? question.question
                          : 'statement' in question
                          ? question.statement
                          : 'prompt' in question
                          ? question.prompt
                          : question.instruction}
                      </p>
                      <p className="mt-3">{question.explanation}</p>
                      <p className="mt-2 text-xs italic text-slate-500">{question.reference}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPrimary}
          className="flex-1 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          {primaryLabel}
        </button>
        {!result.passed && onReviewLesson && (
          <button
            type="button"
            onClick={onReviewLesson}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Review Lesson
          </button>
        )}
        {!result.passed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <RotateCcw size={16} />
            Retry Quiz
          </button>
        )}
      </div>
    </div>
  )
}
