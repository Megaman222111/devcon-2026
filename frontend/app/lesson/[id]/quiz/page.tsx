'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { HeartSystem } from '@/components/gamification/heart-system'
import { QuizCard } from '@/components/quiz/quiz-card'
import { AnswerFeedback } from '@/components/quiz/answer-feedback'
import { useAppStore } from '@/lib/store'
import { sampleQuiz } from '@/lib/mock-data'

type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect' | 'correct-unselected'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const progress = useAppStore((state) => state.progress)
  const loseHeart = useAppStore((state) => state.loseHeart)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)

  const question = sampleQuiz[currentQuestion]
  const totalQuestions = sampleQuiz.length
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100
  const isCorrect = selectedAnswer === question.correctId

  const getAnswerState = (optionId: string): AnswerState => {
    if (!answerSubmitted) {
      return selectedAnswer === optionId ? 'selected' : 'default'
    }
    if (optionId === question.correctId) {
      return selectedAnswer === optionId ? 'correct' : 'correct-unselected'
    }
    if (selectedAnswer === optionId) {
      return 'incorrect'
    }
    return 'default'
  }

  const handleSelectAnswer = (optionId: string) => {
    if (answerSubmitted) return
    setSelectedAnswer(optionId)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || answerSubmitted) return
    setAnswerSubmitted(true)
    setShowFeedback(true)

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      addXP(25)
    } else {
      loseHeart()
      if (progress.hearts <= 1) {
        addToast({ type: 'error', message: 'You ran out of hearts! Review the lesson and try again.' })
      }
    }
  }

  const handleContinue = () => {
    setShowFeedback(false)
    
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setAnswerSubmitted(false)
      }, 300)
    } else {
      // Quiz complete - go to results
      router.push(`/lesson/${params.id}/results?correct=${correctCount + (isCorrect ? 1 : 0)}&total=${totalQuestions}`)
    }
  }

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: 'Module 2', lesson: 'Quiz' }}>
      <div className="mx-auto max-w-3xl px-4 pb-24">
        <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 pb-4 pt-2 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
          <ProgressBar value={progressPercent} height="sm" animated={false} />
        </div>

        <div className="py-6">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={`/lesson/${params.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Exit Quiz
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Q {currentQuestion + 1} / {totalQuestions}
              </span>
              <HeartSystem lives={progress.hearts} size="sm" />
            </div>
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-950/80 dark:shadow-2xl dark:shadow-black/20 sm:p-8"
          >
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Question {currentQuestion + 1}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-slate-900 dark:text-white">
              {question.question}
            </h2>

            <div className="mt-8 space-y-3">
              {question.options.map((option) => (
                <QuizCard
                  key={option.id}
                  letter={option.id}
                  text={option.text}
                  selected={selectedAnswer === option.id}
                  state={getAnswerState(option.id)}
                  disabled={answerSubmitted}
                  onClick={() => handleSelectAnswer(option.id)}
                />
              ))}
            </div>

            {!answerSubmitted && (
              <button className="mt-6 inline-flex items-center gap-2 text-sm text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300">
                <Lightbulb size={16} />
                Need a hint?
              </button>
            )}

            {!answerSubmitted && selectedAnswer && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSubmit}
                className="mt-8 w-full rounded-2xl bg-amber-500 py-4 text-lg font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                CHECK ANSWER
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      <AnswerFeedback
        show={showFeedback}
        correct={isCorrect}
        explanation={question.explanation}
        reference={question.reference}
        xpGained={isCorrect ? 25 : 0}
        onContinue={handleContinue}
      />
    </AppShell>
  )
}
