'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpenText, ChevronRight, Languages } from 'lucide-react'
import { MarkdownRenderer } from '@/components/lesson/markdown-renderer'
import { AiAssistant } from '@/components/chatbot/ai-assistant'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function normalizeTerm(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

interface LessonSection {
  heading: string
  markdown: string
}

interface LessonSectionViewerProps {
  lessonId: string
  lessonTitle: string
  moduleLabel: string
  sections: LessonSection[]
}

interface KeywordPair {
  english: string
  french: string
}

interface LessonInsights {
  keyIdeas: string[]
  keywords: KeywordPair[]
}

const TARGET_LANGUAGE = 'fr'
const TARGET_LANGUAGE_LABEL = 'French'
const TRANSLATION_UNLOCK_ENERGY = 5

export function LessonSectionViewer({
  lessonId,
  lessonTitle,
  moduleLabel,
  sections,
}: LessonSectionViewerProps) {
  const [translationEnabled, setTranslationEnabled] = useState(false)
  const [translatedByKey, setTranslatedByKey] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [insightsByKey, setInsightsByKey] = useState<Record<string, LessonInsights>>({})
  const [translationUnlocked, setTranslationUnlocked] = useState(false)
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reading' | 'terms'>('reading')
  const [scrollProgress, setScrollProgress] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)

  const normalizedHovered = hoveredKeyword ? normalizeTerm(hoveredKeyword) : null

  const fullMarkdown = useMemo(
    () => sections.map((section) => `## ${section.heading}\n\n${section.markdown}`).join('\n\n'),
    [sections]
  )
  const translationCacheKey = `lesson:${TARGET_LANGUAGE}`
  const energy = useAppStore((state) => state.progress.xp)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)
  const canTranslate = energy >= TRANSLATION_UNLOCK_ENERGY

  const insights = insightsByKey[translationCacheKey]
  const keywords = insights?.keywords ?? []
  const keyIdeas = insights?.keyIdeas ?? []

  const renderedMarkdown = useMemo(() => {
    if (!translationEnabled) return fullMarkdown
    return translatedByKey[translationCacheKey] ?? fullMarkdown
  }, [translationEnabled, translatedByKey, translationCacheKey, fullMarkdown])

  const highlightTerms = useMemo(
    () =>
      keywords.map((keyword) => ({
        match: translationEnabled ? keyword.french : keyword.english,
        translation: translationEnabled ? keyword.english : keyword.french,
        translationLabel: translationEnabled ? 'English' : TARGET_LANGUAGE_LABEL,
      })),
    [keywords, translationEnabled]
  )

  useEffect(() => {
    const existing = insightsByKey[translationCacheKey]
    if (existing) return

    let cancelled = false
    const loadInsights = async () => {
      setIsLoadingInsights(true)
      try {
        const response = await fetch('/api/lesson-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heading: 'Lesson content',
            text: fullMarkdown,
            targetLang: TARGET_LANGUAGE,
          }),
        })
        if (!response.ok || cancelled) return

        const payload = (await response.json()) as {
          keyIdeas?: string[]
          keywords?: { english?: string; french?: string }[]
        }
        setInsightsByKey((prev) => ({
          ...prev,
          [translationCacheKey]: {
            keyIdeas: payload.keyIdeas ?? [],
            keywords: (payload.keywords ?? []).filter(
              (item): item is KeywordPair =>
                typeof item.english === 'string' && typeof item.french === 'string'
            ),
          },
        }))
      } finally {
        if (!cancelled) setIsLoadingInsights(false)
      }
    }

    loadInsights()
    return () => {
      cancelled = true
    }
  }, [insightsByKey, fullMarkdown, translationCacheKey])


  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateProgress = () => {
      const rect = node.getBoundingClientRect()
      const total = Math.max(1, rect.height - window.innerHeight)
      const scrolled = Math.min(Math.max(0, window.innerHeight - rect.top), rect.height)
      const ratio = Math.min(1, Math.max(0, scrolled / total))
      setScrollProgress(Math.round(ratio * 100))
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [renderedMarkdown])

  const handleTranslateSelection = async (value: 'original' | 'french') => {
    if (value === 'original') {
      setTranslationEnabled(false)
      return
    }
    if (!translationUnlocked) return
    setTranslationEnabled(true)

    if (translatedByKey[translationCacheKey]) return

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullMarkdown,
          targetLang: TARGET_LANGUAGE,
        }),
      })
      if (!response.ok) return

      const payload = (await response.json()) as { translatedText?: string }
      if (payload.translatedText) {
        setTranslatedByKey((prev) => ({ ...prev, [translationCacheKey]: payload.translatedText! }))
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleUnlockTranslation = () => {
    if (translationUnlocked) return
    if (!canTranslate) {
      addToast({
        type: 'error',
        message: `You need ${TRANSLATION_UNLOCK_ENERGY} lightning to unlock translation.`,
      })
      return
    }

    const confirmed = window.confirm(
      `Unlock ${TARGET_LANGUAGE_LABEL} translation for this section for ${TRANSLATION_UNLOCK_ENERGY} lightning?`
    )
    if (!confirmed) return

    addXP(-TRANSLATION_UNLOCK_ENERGY)
    setTranslationUnlocked(true)
    addToast({
      type: 'info',
      message: `${TARGET_LANGUAGE_LABEL} translation unlocked for this lesson.`,
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="sticky top-16 z-40 mb-5 h-[3px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-[width]"
          style={{ width: `${Math.max(scrollProgress, 6)}%` }}
        />
      </div>

      <div className="sticky top-16 z-30 mb-5 grid h-12 grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('reading')}
          className={cn(
            'flex items-center justify-center gap-2 text-sm font-semibold transition-colors',
            activeTab === 'reading'
              ? 'border-b-2 border-amber-500 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <BookOpenText size={16} />
          Reading
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={cn(
            'flex items-center justify-center gap-2 text-sm font-semibold transition-colors',
            activeTab === 'terms'
              ? 'border-b-2 border-amber-500 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Languages size={16} />
          Key Terms ({keywords.length})
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={cn(activeTab === 'terms' && 'hidden lg:block')}>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-2xl dark:shadow-black/20 sm:p-8">
            <div className="mb-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                {moduleLabel}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{lessonTitle}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lesson Content</p>
            </div>

            <MarkdownRenderer
              content={renderedMarkdown}
              highlightTerms={highlightTerms}
              activeHighlightTerm={hoveredKeyword}
            />

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {isLoadingInsights ? 'Generating key terms…' : `${keywords.length} key terms detected`}
              </div>
              <Link
                href={`/lesson/${lessonId}/quiz`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                I&apos;ve read this — Take Quiz
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="translate-select"
                className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400"
              >
                Translate Lesson
              </label>
              {!translationUnlocked && (
                <button
                  type="button"
                  onClick={handleUnlockTranslation}
                  className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canTranslate}
                >
                  Unlock ({TRANSLATION_UNLOCK_ENERGY} lightning)
                </button>
              )}
              <select
                id="translate-select"
                value={translationEnabled ? 'french' : 'original'}
                disabled={!translationUnlocked || isTranslating}
                onChange={(event) =>
                  handleTranslateSelection(event.target.value as 'original' | 'french')
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="original">Original</option>
                <option value="french">French</option>
              </select>
              {!translationUnlocked && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Costs {TRANSLATION_UNLOCK_ENERGY} lightning to unlock (current: {energy})
                </span>
              )}
              {isTranslating && (
                <span className="text-xs text-slate-500 dark:text-slate-400">Translating this lesson…</span>
              )}
            </div>
          </div>
        </div>

        <aside
          className={cn(
            'lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto',
            activeTab === 'reading' && 'hidden lg:block'
          )}
        >
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Languages size={18} />
                <span className="font-semibold uppercase tracking-[0.18em]">Key Terms</span>
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {translationEnabled ? 'English ↔ French' : `English ↔ ${TARGET_LANGUAGE_LABEL}`}
              </div>
            </div>

            {keyIdeas.length > 0 && (
              <section>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Key ideas
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {keyIdeas.map((idea) => (
                    <li key={idea} className="flex gap-2">
                      <span className="text-amber-500 dark:text-amber-400">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {keywords.length === 0 && isLoadingInsights
                  ? 'Generating terms…'
                  : 'All terms in lesson'}
              </div>
              <div className="mt-3 space-y-2">
                {keywords.length === 0 && !isLoadingInsights && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No key terms detected.</p>
                )}
                {keywords.map((keyword) => {
                  const inlineTerm = translationEnabled ? keyword.french : keyword.english
                  const altTerm = translationEnabled ? keyword.english : keyword.french
                  const normalizedTerm = normalizeTerm(inlineTerm)
                  const isHovered = normalizedHovered === normalizedTerm
                  return (
                    <button
                      key={`${keyword.english}-${keyword.french}`}
                      type="button"
                      onMouseEnter={() => setHoveredKeyword(inlineTerm)}
                      onMouseLeave={() => setHoveredKeyword(null)}
                      onFocus={() => setHoveredKeyword(inlineTerm)}
                      onBlur={() => setHoveredKeyword(null)}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                        isHovered
                          ? 'border-amber-500 bg-amber-100 text-slate-900 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/60 dark:bg-amber-500/15 dark:text-white dark:shadow-amber-500/10 dark:ring-amber-400/50'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-amber-500/40 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-amber-500/40 dark:hover:bg-slate-900'
                      )}
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">{inlineTerm}</div>
                      <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">{altTerm}</div>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <AiAssistant />
    </div>
  )
}
