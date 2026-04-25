'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { HeartSystem } from '@/components/gamification/heart-system'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { AnswerFeedback } from './answer-feedback'
import { QuestionRenderer } from './question-renderer'
import { QuizResultsScreen } from './quiz-results-screen'
import type { QuizConfig, QuizQuestion, QuizResult } from '@/types/quiz'

interface QuizEngineProps {
  lessonTitle: string
  questions: QuizQuestion[]
  config: QuizConfig
  startingLives: number
  onComplete: (result: QuizResult) => void
  onHeartLost: () => void
  onExit: () => void
  onReviewLesson: (result: QuizResult) => void
}

function evaluateAnswer(question: QuizQuestion, answer: string | null) {
  if (!answer) {
    return { correct: false, correctAnswerId: '' }
  }

  if (question.type === 'mcq' || question.type === 'scenario-mcq') {
    return { correct: answer === question.correctOptionId, correctAnswerId: question.correctOptionId }
  }

  if (question.type === 'true-false') {
    return { correct: answer === question.correct, correctAnswerId: question.correct }
  }

  if (question.type === 'fill-blank') {
    const normalized = answer.trim().toLowerCase()
    return {
      correct: question.acceptableAnswers.some((option) => option.toLowerCase() === normalized),
      correctAnswerId: question.acceptableAnswers[0] ?? '',
    }
  }

  try {
    const parsed = JSON.parse(answer) as Record<string, string>
    const correct = question.pairs.every((pair) => parsed[pair.id] === pair.id)
    return {
      correct,
      correctAnswerId: question.pairs.map((pair) => pair.term).join(', '),
    }
  } catch {
    return { correct: false, correctAnswerId: '' }
  }
}

function getCorrectAnswerText(question: QuizQuestion) {
  if (question.type === 'mcq' || question.type === 'scenario-mcq') {
    const match = question.options.find((option) => option.id === question.correctOptionId)
    return match ? `${question.correctOptionId.toUpperCase()} — ${match.text}` : question.correctOptionId
  }
  if (question.type === 'true-false') return question.correct === 'true' ? 'True' : 'False'
  if (question.type === 'fill-blank') return question.acceptableAnswers[0] ?? ''
  return 'Match each term with its correct definition.'
}

export function QuizEngine({
  lessonTitle,
  questions,
  config,
  startingLives,
  onComplete,
  onHeartLost,
  onExit,
  onReviewLesson,
}: QuizEngineProps) {
  const [stage, setStage] = useState<'intro' | 'question' | 'results'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<QuizResult['answers']>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [livesRemaining, setLivesRemaining] = useState(startingLives)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [lastHeartLost, setLastHeartLost] = useState(false)
  const [lastAnswerText, setLastAnswerText] = useState('')
  const [hintUsed, setHintUsed] = useState(false)
  const [eliminatedOptionId, setEliminatedOptionId] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)

  const question = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100
  const outOfHearts = config.heartsEnabled && livesRemaining <= 0

  useEffect(() => {
    setLivesRemaining(startingLives)
  }, [startingLives])

  const buildResult = useMemo(
    () => (finalAnswers: QuizResult['answers']): QuizResult => {
      const correctCount = finalAnswers.filter((answer) => answer.correct).length
      const score = Math.round((correctCount / questions.length) * 100)
      const weakTopics = Array.from(
        new Set(
          finalAnswers
            .filter((answer) => !answer.correct)
            .map((answer) => questions.find((question) => question.id === answer.questionId)?.topicLabel)
            .filter(Boolean) as string[]
        )
      )

      return {
        score,
        passed: score >= config.passingScore && !outOfHearts,
        xpTotal: finalAnswers.filter((answer) => answer.correct).length * 25,
        heartsUsed: Math.max(0, startingLives - livesRemaining),
        correctCount,
        totalQuestions: questions.length,
        answers: finalAnswers,
        weakTopics,
      }
    },
    [config.passingScore, livesRemaining, outOfHearts, questions, startingLives]
  )

  const nextStep = (finalAnswers: QuizResult['answers']) => {
    const computed = buildResult(finalAnswers)
    if (currentIndex === questions.length - 1 || outOfHearts) {
      setResult(computed)
      setStage('results')
      onComplete(computed)
      return
    }

    setCurrentIndex((index) => index + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setHintUsed(false)
    setEliminatedOptionId(null)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return

    const evaluation = evaluateAnswer(question, selectedAnswer)
    const nextAnswers = [
      ...answers,
      {
        questionId: question.id,
        answerId: selectedAnswer,
        correct: evaluation.correct,
      },
    ]

    setAnswers(nextAnswers)
    setLastCorrect(evaluation.correct)
    setLastAnswerText(getCorrectAnswerText(question))

    if (!evaluation.correct && config.heartsEnabled) {
      setLastHeartLost(true)
      setLivesRemaining((value) => Math.max(0, value - 1))
      onHeartLost()
    } else {
      setLastHeartLost(false)
    }

    if (config.showImmediateFeedback) {
      setShowFeedback(true)
      return
    }

    nextStep(nextAnswers)
  }

  const handleHint = () => {
    if (hintUsed || !config.heartsEnabled || livesRemaining <= 0) return
    setHintUsed(true)
    setLivesRemaining((value) => Math.max(0, value - 1))
    onHeartLost()

    if (question.type === 'mcq' || question.type === 'scenario-mcq') {
      const wrongOption = question.options.find((option) => option.id !== question.correctOptionId)
      setEliminatedOptionId(wrongOption?.id ?? null)
      return
    }

    if (question.type === 'true-false') {
      setEliminatedOptionId(question.correct === 'true' ? 'false' : 'true')
    }
  }

  if (stage === 'intro') {
    return (
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-700 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="text-5xl">📋</div>
        <h1 className="mt-6 font-display text-5xl font-black text-white">Lesson Quiz</h1>
        <p className="mt-3 text-lg text-amber-300">{lessonTitle}</p>
        <div className="mt-8 space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-200">
          <div>📝 {questions.length} questions</div>
          <div>❤️ {startingLives} lives (wrong answers cost 1 life)</div>
          <div>✅ {config.passingScore}% to pass</div>
          <div>🌐 Questions available in your preferred reading language setup</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setStage('question')
          }}
          className="mt-8 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          LET&apos;S GO
        </button>
      </div>
    )
  }

  if (stage === 'results' && result) {
    return (
      <QuizResultsScreen
        lessonTitle={lessonTitle}
        questions={questions}
        result={result}
        primaryLabel={result.passed ? 'Continue' : 'Back to lesson'}
        onPrimary={() => {
          if (result.passed) {
            onComplete(result)
            return
          }
          onReviewLesson(result)
        }}
        onReviewLesson={result.passed ? undefined : () => onReviewLesson(result)}
        onRetry={
          result.passed
            ? undefined
            : () => {
                setStage('question')
                setCurrentIndex(0)
                setSelectedAnswer(null)
                setAnswers([])
                setShowFeedback(false)
                setHintUsed(false)
                setEliminatedOptionId(null)
                setLivesRemaining(startingLives)
                setResult(null)
              }
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-16 z-30 border-b border-slate-700 bg-slate-950/95 pb-4 pt-2 backdrop-blur">
        <ProgressBar value={progressPercent} height="sm" color="gold" animated={false} />
      </div>

      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Exit Quiz
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Q {currentIndex + 1} / {questions.length}
            </span>
            <HeartSystem lives={livesRemaining} size="sm" />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-700 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Question {currentIndex + 1}
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white">
            {'question' in question
              ? question.question
              : 'statement' in question
              ? question.statement
              : 'prompt' in question
              ? question.prompt
              : question.instruction}
          </h2>

          <div className="mt-8">
            <QuestionRenderer
              question={question}
              selectedAnswer={selectedAnswer}
              disabled={showFeedback}
              onAnswer={setSelectedAnswer}
              eliminatedOptionId={eliminatedOptionId}
            />
          </div>

          {question.hint && (
            <button
              type="button"
              onClick={handleHint}
              disabled={hintUsed || livesRemaining <= 0}
              className="mt-6 inline-flex items-center gap-2 text-sm text-amber-400 transition-colors hover:text-amber-300 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              <Lightbulb size={16} />
              {hintUsed ? 'Hint used' : 'Use a Hint (-1 ❤)'}
            </button>
          )}

          {selectedAnswer && !showFeedback && (
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-8 w-full rounded-2xl bg-amber-500 py-4 text-lg font-bold text-slate-950 transition-colors hover:bg-amber-400"
            >
              CHECK ANSWER
            </button>
          )}
        </div>
      </div>

      <AnswerFeedback
        show={showFeedback}
        correct={lastCorrect}
        explanation={question.explanation}
        reference={question.reference}
        xpGained={lastCorrect ? 25 : 0}
        correctAnswerText={lastCorrect ? undefined : lastAnswerText}
        heartLost={lastHeartLost}
        outOfHearts={outOfHearts}
        onContinue={() => {
          setShowFeedback(false)
          nextStep(answers)
        }}
      />
    </div>
  )
}
