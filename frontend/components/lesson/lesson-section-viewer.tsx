'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MarkdownRenderer } from '@/components/lesson/markdown-renderer'
import { useAppStore } from '@/lib/store'

interface LessonSection {
  heading: string
  markdown: string
}

interface LessonSectionViewerProps {
  lessonId: string
  sections: LessonSection[]
}

const TARGET_LANGUAGE = 'fr'
const TARGET_LANGUAGE_LABEL = 'French'
const TRANSLATION_UNLOCK_ENERGY = 5

export function LessonSectionViewer({ lessonId, sections }: LessonSectionViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [translationEnabled, setTranslationEnabled] = useState(false)
  const [translatedByKey, setTranslatedByKey] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [insightsByKey, setInsightsByKey] = useState<
    Record<string, { keyIdeas: string[]; keywords: { english: string; french: string }[] }>
  >({})
  const [translationUnlockedBySection, setTranslationUnlockedBySection] = useState<Record<number, boolean>>({})

  const section = sections[currentSectionIndex]
  const hasPrevious = currentSectionIndex > 0
  const hasNext = currentSectionIndex < sections.length - 1
  const translationCacheKey = `${currentSectionIndex}:${TARGET_LANGUAGE}`
  const energy = useAppStore((state) => state.progress.xp)
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)
  const sectionTranslationUnlocked = translationUnlockedBySection[currentSectionIndex] === true
  const canTranslate = energy >= TRANSLATION_UNLOCK_ENERGY

  const renderedMarkdown = useMemo(() => {
    if (!translationEnabled) return section.markdown
    return translatedByKey[translationCacheKey] ?? section.markdown
  }, [translationEnabled, translatedByKey, translationCacheKey, section.markdown])

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
            heading: section.heading,
            text: section.markdown,
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
            keywords: (payload.keywords ?? [])
              .filter(
                (item): item is { english: string; french: string } =>
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
  }, [insightsByKey, section.heading, section.markdown, translationCacheKey])

  const handleTranslateSelection = async (value: 'original' | 'french') => {
    if (value === 'original') {
      setTranslationEnabled(false)
      return
    }
    if (!sectionTranslationUnlocked) return
    setTranslationEnabled(true)

    if (translatedByKey[translationCacheKey]) return

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: section.markdown,
          targetLang: TARGET_LANGUAGE,
        }),
      })
      if (!response.ok) return

      const payload = (await response.json()) as { translatedText?: string }
      if (payload.translatedText) {
        setTranslatedByKey((prev) => ({ ...prev, [translationCacheKey]: payload.translatedText }))
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleUnlockTranslation = () => {
    if (sectionTranslationUnlocked) return
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
    setTranslationUnlockedBySection((prev) => ({ ...prev, [currentSectionIndex]: true }))
    addToast({
      type: 'info',
      message: `${TARGET_LANGUAGE_LABEL} translation unlocked for this section.`,
    })
  }

  const handleNext = () => {
    if (hasNext) {
      setCurrentSectionIndex((prev) => prev + 1)
      return
    }
  }

  const handlePrevious = () => {
    if (!hasPrevious) return
    setCurrentSectionIndex((prev) => prev - 1)
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-navy-700">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-sm text-amber-500 font-semibold">SECTION {currentSectionIndex + 1} OF {sections.length}</div>
          <h2 className="text-xl font-semibold text-black mt-1">{section.heading}</h2>
        </div>
      </div>

      <MarkdownRenderer content={renderedMarkdown} />

      <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <h3 className="text-lg font-semibold text-black">Key Ideas & Keywords</h3>
        {isLoadingInsights && !insightsByKey[translationCacheKey] ? (
          <p className="mt-2 text-sm text-navy-700">Generating insights with Gemini...</p>
        ) : (
          <>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-black">
              {(insightsByKey[translationCacheKey]?.keyIdeas ?? []).map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {(insightsByKey[translationCacheKey]?.keywords ?? []).map((keyword) => (
                <span
                  key={`${keyword.english}-${keyword.french}`}
                  className="inline-flex items-center rounded-full bg-white border border-amber-300 px-2.5 py-1 text-xs font-medium text-black"
                >
                  {keyword.english} {'->'} {keyword.french}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-navy-300 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-200 hover:bg-navy-300 text-navy-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {hasNext ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-lg text-sm font-semibold transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <Link
            href={`/lesson/${lessonId}/quiz`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-lg text-sm font-semibold transition-colors"
          >
            Take Quiz
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-navy-300 bg-navy-50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="translate-select" className="text-sm font-semibold text-black">
            Translate Section
          </label>
          {!sectionTranslationUnlocked && (
            <button
              type="button"
              onClick={handleUnlockTranslation}
              className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canTranslate}
            >
              Unlock ({TRANSLATION_UNLOCK_ENERGY} lightning)
            </button>
          )}
          <select
            id="translate-select"
            value={translationEnabled ? 'french' : 'original'}
            disabled={!sectionTranslationUnlocked || isTranslating}
            onChange={(event) => handleTranslateSelection(event.target.value as 'original' | 'french')}
            className="rounded-md border border-navy-300 bg-white px-3 py-2 text-sm text-black disabled:bg-navy-100 disabled:text-navy-500"
          >
            <option value="original">Original</option>
            <option value="french">French</option>
          </select>
          {!sectionTranslationUnlocked && (
            <span className="text-xs text-navy-700">
              Translation costs {TRANSLATION_UNLOCK_ENERGY} lightning for this section (current: {energy})
            </span>
          )}
          {isTranslating && <span className="text-xs text-navy-700">Translating this section...</span>}
        </div>
      </div>
    </div>
  )
}
