'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight, Lightbulb, Pencil, RotateCcw } from 'lucide-react'
import { HeartSystem } from '@/components/gamification/heart-system'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { ModuleTest, ModuleTestQuestion } from '@/lib/module-tests'

interface ModuleTestRunnerProps {
  test: ModuleTest
  moduleId: string
  backHref: string
}

type AnswerMap = Record<string, string>

const TEST_ANSWER_KEYS: Record<string, string> = {
  'q-pretest-1-1': 'b',
  'q-pretest-1-2': 'a',
  'q-pretest-1-3': 'b',
  'q-pretest-1-4': 'a',
  'q-pretest-1-5': 'b',
  'q-pretest-1-6': 'b',
  'q-pretest-2-1': 'b',
  'q-pretest-2-2': 'b',
  'q-pretest-2-3': 'a',
  'q-pretest-2-4': 'b',
  'q-pretest-2-5': 'b',
  'q-pretest-2-6': 'a',
  'q-pretest-3-1': 'b',
  'q-pretest-3-2': 'a',
  'q-pretest-3-3': 'b',
  'q-pretest-3-4': 'b',
  'q-pretest-3-5': 'b',
  'q-pretest-3-6': 'b',
  'q-pretest-4-1': 'b',
  'q-pretest-4-2': 'b',
  'q-pretest-4-3': 'a',
  'q-pretest-4-4': 'b',
  'q-pretest-4-5': 'b',
  'q-pretest-4-6': 'b',
  'q-pretest-5-1': 'b',
  'q-pretest-5-2': 'b',
  'q-pretest-5-3': 'a',
  'q-pretest-5-4': 'b',
  'q-pretest-5-5': 'a',
  'q-pretest-5-6': 'b',
  'q-pretest-6-1': 'b',
  'q-pretest-6-2': 'b',
  'q-pretest-6-3': 'b',
  'q-pretest-6-4': 'b',
  'q-pretest-6-5': 'b',
  'q-pretest-6-6': 'b',
  'q-pretest-7-1': 'b',
  'q-pretest-7-2': 'b',
  'q-pretest-7-3': 'b',
  'q-pretest-7-4': 'a',
  'q-pretest-7-5': 'a',
  'q-pretest-7-6': 'a',
  'q-posttest-1-1': 'b',
  'q-posttest-1-2': 'a',
  'q-posttest-2-2': 'a',
  'q-posttest-7-4': 'a',
}

function isAnswered(question: ModuleTestQuestion, answers: AnswerMap) {
  if (question.type === 'video') return true
  const value = answers[question.id]
  if (value === undefined || value === null) return false
  return value.toString().trim().length > 0
}

function VideoQuestionPlaceholder() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-900/80 bg-black shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="aspect-video w-full" />
    </div>
  )
}

export function ModuleTestRunner({ test, moduleId, backHref }: ModuleTestRunnerProps) {
  const [stage, setStage] = useState<'intro' | 'question' | 'review'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [hiddenOptionIdsByQuestion, setHiddenOptionIdsByQuestion] = useState<Record<string, string[]>>({})
  const [reviewRewardGranted, setReviewRewardGranted] = useState(false)
  const hearts = useAppStore((state) => state.progress.hearts)
  const loseHeart = useAppStore((state) => state.loseHeart)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)

  const totalQuestions = test.questions.length
  const question = test.questions[currentIndex]
  const questionId = question?.id ?? ''
  const hiddenOptionIds = questionId ? hiddenOptionIdsByQuestion[questionId] ?? [] : []
  const correctOptionId = questionId ? TEST_ANSWER_KEYS[questionId] : undefined
  const visibleOptions = question.options?.filter((option) => !hiddenOptionIds.includes(option.id)) ?? []
  const progressPercent = totalQuestions
    ? ((currentIndex + 1) / totalQuestions) * 100
    : 0
  const answeredCount = useMemo(
    () => test.questions.filter((item) => isAnswered(item, answers)).length,
    [answers, test.questions]
  )
  const objectiveCorrectCount = useMemo(
    () =>
      test.questions.reduce((count, item) => {
        const key = TEST_ANSWER_KEYS[item.id]
        if (!key || !item.options?.length) return count
        return answers[item.id] === key ? count + 1 : count
      }, 0),
    [answers, test.questions]
  )
  const reviewLightningReward = objectiveCorrectCount * 10

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1)
      return
    }
    setStage('review')
  }

  const handlePrev = () => {
    if (currentIndex === 0) return
    setCurrentIndex((i) => i - 1)
  }

  const handleRestart = () => {
    setAnswers({})
    setHiddenOptionIdsByQuestion({})
    setReviewRewardGranted(false)
    setCurrentIndex(0)
    setStage('intro')
  }

  useEffect(() => {
    if (stage !== 'review' || reviewRewardGranted) return
    if (reviewLightningReward > 0) {
      addXP(reviewLightningReward)
      addToast({
        type: 'xp-gain',
        message: `+${reviewLightningReward} lightning from ${test.kind === 'pretest' ? 'pre-test' : 'post-test'} results.`,
      })
    }
    setReviewRewardGranted(true)
  }, [addToast, addXP, reviewLightningReward, reviewRewardGranted, stage, test.kind])

  const handleUseHint = () => {
    if (!question || !question.options?.length) {
      addToast({ type: 'info', message: 'Hints are available only for multiple-choice questions.' })
      return
    }
    if (!correctOptionId) {
      addToast({ type: 'info', message: 'Hint key is not available for this question.' })
      return
    }
    if (hearts <= 0) {
      addToast({ type: 'error', message: 'No hearts left. You cannot use a hint right now.' })
      return
    }

    const selectedAnswer = answers[question.id]
    const hiddenSet = new Set(hiddenOptionIdsByQuestion[question.id] ?? [])
    const removableWrong = question.options.filter(
      (option) =>
        option.id !== correctOptionId &&
        !hiddenSet.has(option.id) &&
        option.id !== selectedAnswer
    )
    const fallbackWrong = question.options.filter(
      (option) => option.id !== correctOptionId && !hiddenSet.has(option.id)
    )
    const optionToHide = removableWrong[0] ?? fallbackWrong[0]

    if (!optionToHide) {
      addToast({ type: 'info', message: 'No more wrong options left to remove.' })
      return
    }

    setHiddenOptionIdsByQuestion((prev) => ({
      ...prev,
      [question.id]: [...(prev[question.id] ?? []), optionToHide.id],
    }))

    if (selectedAnswer === optionToHide.id) {
      setAnswers((prev) => {
        const next = { ...prev }
        delete next[question.id]
        return next
      })
    }

    loseHeart()
    addToast({ type: 'info', message: 'Hint used: removed one wrong answer (-1 life).' })
    if (hearts <= 1) {
      addToast({ type: 'error', message: 'You ran out of hearts.' })
    }
  }

  if (totalQuestions === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
        <p>This test has no questions yet. Check the source file at <code>files/tests/</code>.</p>
        <Link
          href={backHref}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
    )
  }

  if (stage === 'intro') {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-black/20 sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          {test.kind === 'pretest' ? 'Pre-Test' : 'Post-Test'} · Module {test.moduleNumber}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          {test.title}
        </h1>
        {test.subtitle && (
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{test.subtitle}</p>
        )}

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
          <div>📝 {totalQuestions} questions</div>
          <div>
            {test.kind === 'pretest'
              ? '🧠 Self-check — see how much you already know before the lessons.'
              : '✅ Reinforce what you learned. Open-ended questions invite reflection.'}
          </div>
          <div>📦 No grading — your answers stay on this device.</div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStage('question')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Start
            <ChevronRight size={18} />
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Back to Map
          </Link>
        </div>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-black/20 sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          Your Responses
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          {test.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You answered {answeredCount} of {totalQuestions} questions.
        </p>
        {reviewLightningReward > 0 && (
          <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
            Lightning earned: +{reviewLightningReward}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {test.questions.map((q) => {
            const value = answers[q.id]
            const optionMatch = q.options?.find((option) => option.id === value)
            const display =
              q.type === 'video' ? (
                <span className="italic text-slate-500 dark:text-slate-400">Blank video slot</span>
              ) :
              optionMatch?.text ??
              (value ? value : <span className="italic text-slate-500 dark:text-slate-400">No answer</span>)
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-950/50"
              >
                <div className="font-semibold text-slate-800 dark:text-white">
                  {q.number}. {q.prompt}
                </div>
                <div className="mt-2 text-slate-700 dark:text-slate-200">
                  <span className="font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Answer:
                  </span>{' '}
                  {display}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw size={18} />
            Take Again
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            <CheckCircle2 size={18} />
            Done
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 pb-3 pt-2 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
        <ProgressBar value={progressPercent} height="sm" animated={false} color="gold" />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-3">
            <span>{answeredCount} answered</span>
            <HeartSystem lives={hearts} size="sm" showCount />
          </div>
        </div>
      </div>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-black/20 sm:p-8"
      >
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          {test.kind === 'pretest' ? 'Module' : 'Module'} {test.moduleNumber} · {test.kind === 'pretest' ? 'Pre-Test' : 'Post-Test'}
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-slate-900 dark:text-white sm:text-3xl">
          <span className="mr-2 text-amber-600 dark:text-amber-400">{question.number}.</span>
          {question.prompt}
        </h2>

        <div className="mt-8">
          {question.type === 'video' ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Video placeholder
              </div>
              <VideoQuestionPlaceholder />
            </div>
          ) : question.type === 'open' ? (
            <div>
              <label
                htmlFor={`answer-${question.id}`}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                <Pencil size={14} />
                Your answer
              </label>
              <textarea
                id={`answer-${question.id}`}
                value={answers[question.id] ?? ''}
                onChange={(event) => setAnswer(question.id, event.target.value)}
                placeholder="Type your answer here…"
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {visibleOptions.map((option) => {
                const selected = answers[question.id] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAnswer(question.id, option.id)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all',
                      selected
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-500/15'
                        : 'border-slate-200 bg-white hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold uppercase transition-colors',
                        selected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-amber-100 text-amber-700 dark:bg-slate-800 dark:text-amber-300'
                      )}
                    >
                      {option.id}
                    </div>
                    <span className="text-base text-slate-900 dark:text-slate-100">
                      {option.text}
                    </span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={handleUseHint}
                disabled={
                  hearts <= 0 ||
                  !correctOptionId ||
                  !question.options?.some(
                    (option) =>
                      option.id !== correctOptionId &&
                      !hiddenOptionIds.includes(option.id)
                  )
                }
                className="mt-2 inline-flex items-center gap-2 text-sm text-amber-600 transition-colors hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
              >
                <Lightbulb size={16} />
                Need a hint? (-1 life)
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            {currentIndex === totalQuestions - 1 ? 'Review answers' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Tip: this {test.kind === 'pretest' ? 'pre-test' : 'post-test'} is self-graded.
        Pre-tests check what you already know before lessons; post-tests prompt reflection
        on what you learned. Module ID: {moduleId}.
      </div>
    </div>
  )
}
