'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { QuizEngine } from '@/components/quiz/quiz-engine'
import { getLessonContent, getLessonQuiz, getScenarioForLesson } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import type { QuizResult } from '@/types/quiz'

export default function QuizPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const lessonId = params.id
  const lesson = getLessonContent(lessonId)
  const questions = getLessonQuiz(lessonId)
  const scenario = getScenarioForLesson(lessonId)

  const progress = useAppStore((state) => state.progress)
  const loseHeart = useAppStore((state) => state.loseHeart)
  const setReviewMode = useAppStore((state) => state.setReviewMode)
  const refillHearts = useAppStore((state) => state.refillHearts)
  const clearReviewMode = useAppStore((state) => state.clearReviewMode)
  const addXP = useAppStore((state) => state.addXP)
  const markLessonComplete = useAppStore((state) => state.markLessonComplete)

  const handleComplete = (result: QuizResult) => {
    if (!result.passed) return
    addXP(result.xpTotal)
    markLessonComplete(lessonId)
    clearReviewMode()
    if (scenario) {
      router.push(`/lesson/${lessonId}/scenario?correct=${result.correctCount}&total=${result.totalQuestions}`)
      return
    }
    router.push(`/lesson/${lessonId}/results?correct=${result.correctCount}&total=${result.totalQuestions}`)
  }

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: 'Quiz' }}>
      <div className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <QuizEngine
          lessonTitle={`${lesson.lessonLabel} · ${lesson.title}`}
          questions={questions}
          startingLives={progress.hearts}
          config={{
            mode: 'lesson',
            heartsEnabled: true,
            passingScore: 80,
            showImmediateFeedback: true,
          }}
          onHeartLost={loseHeart}
          onExit={() => router.push(`/lesson/${lessonId}`)}
          onComplete={handleComplete}
          onReviewLesson={(result) => {
            setReviewMode(lessonId, result.weakTopics)
            refillHearts()
            router.push(`/lesson/${lessonId}`)
          }}
        />
      </div>
    </AppShell>
  )
}
