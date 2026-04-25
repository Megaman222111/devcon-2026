'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { QuizCard } from '@/components/quiz/quiz-card'
import { sampleQuiz } from '@/lib/mock-data'

type ExamQuestion = {
  id: string
  question: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  reference?: string
}

const examQuestions: ExamQuestion[] = [
  ...sampleQuiz
    .filter((question) => question.type === 'mcq' || question.type === 'scenario-mcq')
    .map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      correctId: question.correctOptionId,
      explanation: question.explanation,
      reference: question.reference,
    })),
  {
    id: 'q4',
    question: 'What is the first level of the use of force continuum?',
    options: [
      { id: 'a', text: 'Verbal commands' },
      { id: 'b', text: 'Officer presence' },
      { id: 'c', text: 'Soft physical control' },
      { id: 'd', text: 'Hard physical control' },
    ],
    correctId: 'b',
    explanation: 'Officer presence is the first and least forceful level of the continuum.',
    reference: 'ABST Manual, Chapter 3',
  },
  {
    id: 'q5',
    question: 'Which of the following is NOT a valid reason for using force?',
    options: [
      { id: 'a', text: 'Self-defense' },
      { id: 'b', text: 'Defense of another person' },
      { id: 'c', text: 'Prevention of property damage' },
      { id: 'd', text: 'Punishment for non-compliance' },
    ],
    correctId: 'd',
    explanation: 'Force should never be used as punishment. It is only justified for protection and lawful enforcement.',
    reference: 'Criminal Code s.25',
  },
]

export default function ModuleExamPage() {
  const params = useParams()
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes

  const totalQuestions = examQuestions.length
  const question = examQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  useEffect(() => {
    if (!started) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto submit
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started])

  const handleSelectAnswer = (answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: answerId,
    }))
  }

  const toggleFlag = () => {
    if (flagged.includes(question.id)) {
      setFlagged(flagged.filter((id) => id !== question.id))
    } else {
      setFlagged([...flagged, question.id])
    }
  }

  const handleSubmit = () => {
    const correct = Object.entries(answers).filter(([qId, aId]) => {
      const q = examQuestions.find((eq) => eq.id === qId)
      return q?.correctId === aId
    }).length

    router.push(
      `/module/${params.id}/exam/results?correct=${correct}&total=${totalQuestions}`
    )
  }

  if (!started) {
    return (
      <AppShell showBottomNav={false} showStats={false}>
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
              <Shield size={40} className="text-amber-500" />
            </div>

            <h1 className="font-display font-black text-4xl text-white">
              MODULE 2 EXAM
            </h1>
            <p className="mt-2 text-lg text-amber-300">
              The Canadian Legal System
            </p>

            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-lg">
                <Clock size={20} className="text-navy-400" />
                <span className="text-navy-300">20-minute time limit</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-lg">
                <span className="text-navy-400">📋</span>
                <span className="text-navy-300">{totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-lg">
                <span className="text-navy-400">✅</span>
                <span className="text-navy-300">70% required to pass</span>
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="mt-8 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-bold text-lg transition-colors btn-glow"
            >
              START EXAM
            </button>

            <button
              onClick={() => router.push('/home')}
              className="mt-3 w-full py-3 bg-navy-700 hover:bg-navy-600 text-navy-300 rounded-xl transition-colors"
            >
              Review Lessons First
            </button>
          </motion.div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={false} showStats={false}>
      {/* Exam Header */}
      <div className="sticky top-16 z-40 bg-navy-800 border-b border-navy-600 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy-400">
              Q {currentQuestion + 1}/{totalQuestions}
            </span>
            <ProgressBar
              value={progress}
              height="sm"
              className="w-24"
              animated={false}
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-1.5 font-display font-bold',
              timeRemaining < 120
                ? 'text-red-500 animate-pulse'
                : timeRemaining < 300
                ? 'text-amber-400'
                : 'text-white'
            )}
          >
            <Clock size={16} />
            {formatTime(timeRemaining)}
          </div>

          <button
            onClick={toggleFlag}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
              flagged.includes(question.id)
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-navy-700 text-navy-400 hover:text-white'
            )}
          >
            <Flag size={14} />
            Flag
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <h2 className="font-display font-semibold text-xl text-white leading-snug">
            {question.question}
          </h2>
        </motion.div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option: ExamQuestion['options'][number]) => (
            <QuizCard
              key={option.id}
              letter={option.id}
              text={option.text}
              selected={answers[question.id] === option.id}
              state={answers[question.id] === option.id ? 'selected' : 'default'}
              disabled={false}
              onClick={() => handleSelectAnswer(option.id)}
            />
          ))}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 flex flex-wrap gap-2">
          {examQuestions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                i === currentQuestion
                  ? 'bg-amber-500 text-navy-900'
                  : answers[q.id]
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-navy-700 text-navy-400',
                flagged.includes(q.id) && 'ring-2 ring-amber-500'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={cn(
              'flex items-center gap-1 px-4 py-2 rounded-lg transition-colors',
              currentQuestion === 0
                ? 'text-navy-600 cursor-not-allowed'
                : 'bg-navy-700 text-white hover:bg-navy-600'
            )}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-lg font-semibold transition-colors"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-colors"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
