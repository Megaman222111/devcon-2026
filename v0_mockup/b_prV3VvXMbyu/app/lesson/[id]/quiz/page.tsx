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
      {/* Progress Bar */}
      <div className="sticky top-16 z-40 bg-navy-800 border-b border-navy-600">
        <ProgressBar value={progressPercent} height="sm" animated={false} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/lesson/${params.id}`}
            className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Exit Quiz
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-navy-400">
              Question {currentQuestion + 1}/{totalQuestions}
            </span>
            <HeartSystem lives={progress.hearts} size="sm" />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-display font-semibold text-2xl text-white leading-snug">
            {question.question}
          </h2>
        </motion.div>

        {/* Answer Options */}
        <div className="space-y-3">
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

        {/* Hint Button */}
        {!answerSubmitted && (
          <button className="mt-6 flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors">
            <Lightbulb size={16} />
            Need a hint?
          </button>
        )}

        {/* Submit Button */}
        {!answerSubmitted && selectedAnswer && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="mt-8 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-bold text-lg transition-colors btn-glow"
          >
            CHECK ANSWER
          </motion.button>
        )}
      </div>

      {/* Feedback Overlay */}
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
