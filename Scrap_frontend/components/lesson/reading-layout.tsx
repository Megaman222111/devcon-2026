'use client'

import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import styles from './reading-layout.module.css'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import type { LessonContent } from '@/types/lesson'
import type { UserLanguagePreferences } from '@/lib/store'
import { ContentRenderer } from './content-renderer'
import { KeyTermPanel } from './key-term-panel'
import { ReadingTabBar } from './reading-tab-bar'
import { ReviewMode } from '@/components/quiz/review-mode'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ReadingLayoutProps {
  lesson: LessonContent
  languagePrefs: UserLanguagePreferences
  onComplete: () => void
}

export function ReadingLayout({
  lesson,
  languagePrefs,
  onComplete,
}: ReadingLayoutProps) {
  const [highlightedTermId, setHighlightedTermId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reading' | 'terms'>('reading')
  const reviewMode = useAppStore((state) => state.progress.reviewMode)

  const paragraphIds = useMemo(
    () =>
      lesson.blocks
        .filter((block) => block.type === 'paragraph')
        .map((block) => block.id),
    [lesson.blocks]
  )
  const { visibleIds, progress } = useScrollTracking(paragraphIds)
  const activeTermIds = useMemo(
    () =>
      lesson.keyTerms
        .filter((term) => term.paragraphIds.some((id) => visibleIds.includes(id)))
        .map((term) => term.id),
    [lesson.keyTerms, visibleIds]
  )
  const reviewTopics =
    reviewMode?.lessonId === lesson.id ? reviewMode.topicLabels : []

  const swipeBindings = useSwipeGesture(
    () => setActiveTab('terms'),
    () => setActiveTab('reading')
  )

  return (
    <div className={styles.readingContainer} dir={languagePrefs.rtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-16 z-40 mb-5 h-[3px] overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-[width]"
          style={{ width: `${Math.max(progress, 6)}%` }}
        />
      </div>

      <ReviewMode topics={reviewTopics} />
      <ReadingTabBar
        activeTab={activeTab}
        onChange={setActiveTab}
        totalTerms={lesson.keyTerms.length}
      />

      <div className={styles.panels}>
        <div
          {...swipeBindings}
          className={cn(activeTab === 'terms' && 'hidden lg:block')}
        >
          <div className="rounded-[28px] border border-slate-700 bg-slate-900/80 p-6 sm:p-8">
            <div className="mb-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
                {lesson.lessonLabel}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-white">{lesson.title}</h1>
              <p className="mt-2 text-sm text-slate-400">
                {lesson.moduleLabel} · {lesson.estimatedMinutes} min read
              </p>
            </div>

            <ContentRenderer
              blocks={lesson.blocks}
              keyTerms={lesson.keyTerms}
              highlightedTermId={highlightedTermId}
              translationMode={languagePrefs.translationMode}
              language={languagePrefs.language}
              reviewTopics={reviewTopics}
              onTermHover={setHighlightedTermId}
            />

            <div className="mt-8 border-t border-slate-700 pt-6">
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                I&apos;ve read this — Take Quiz
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <aside className={cn(styles.rightPanel, activeTab === 'reading' && 'hidden lg:block', 'lg:block')}>
          <KeyTermPanel
            allTerms={lesson.keyTerms}
            activeTermIds={activeTermIds}
            highlightedTermId={highlightedTermId}
            onTermHover={setHighlightedTermId}
            language={languagePrefs.language}
            translationMode={languagePrefs.translationMode}
          />
        </aside>
      </div>
    </div>
  )
}
