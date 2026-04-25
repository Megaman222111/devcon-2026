'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { ReadingLayout } from '@/components/lesson/reading-layout'
import { getLessonContent, lessonsForModule } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

export default function LessonPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const startLesson = useAppStore((state) => state.startLesson)
  const id = params.id
  const lessonMeta = Object.values(lessonsForModule).flat().find((lesson) => lesson.id === id)
  const lesson = getLessonContent(id)

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: lesson.title }}>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        {lessonMeta && (
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Lesson {lessonMeta.number}
          </div>
        )}

        <ReadingLayout
          lesson={lesson}
          languagePrefs={
            user?.languagePrefs ?? {
              language: 'en',
              translationMode: 'none',
              rtl: false,
              awsTranslateCode: 'en',
            }
          }
          onComplete={() => {
            startLesson(id)
            router.push(`/lesson/${id}/quiz`)
          }}
        />
      </div>
    </AppShell>
  )
}
