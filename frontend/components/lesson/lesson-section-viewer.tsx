'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Languages } from 'lucide-react'
import { MarkdownRenderer } from '@/components/lesson/markdown-renderer'

interface LessonSection {
  heading: string
  markdown: string
}

interface LessonSectionViewerProps {
  lessonId: string
  sections: LessonSection[]
}

export function LessonSectionViewer({ lessonId, sections }: LessonSectionViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [translationEnabled, setTranslationEnabled] = useState(false)
  const [translatedByIndex, setTranslatedByIndex] = useState<Record<number, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)

  const section = sections[currentSectionIndex]
  const hasNext = currentSectionIndex < sections.length - 1

  const renderedMarkdown = useMemo(() => {
    if (!translationEnabled) return section.markdown
    return translatedByIndex[currentSectionIndex] ?? section.markdown
  }, [translationEnabled, translatedByIndex, currentSectionIndex, section.markdown])

  const handleToggleTranslation = async () => {
    const nextEnabled = !translationEnabled
    setTranslationEnabled(nextEnabled)
    if (!nextEnabled) return

    if (translatedByIndex[currentSectionIndex]) return

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: section.markdown,
          targetLang: 'es',
        }),
      })
      if (!response.ok) return

      const payload = (await response.json()) as { translatedText?: string }
      if (payload.translatedText) {
        setTranslatedByIndex((prev) => ({ ...prev, [currentSectionIndex]: payload.translatedText }))
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      setCurrentSectionIndex((prev) => prev + 1)
      return
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-navy-700">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-sm text-amber-500 font-semibold">SECTION {currentSectionIndex + 1} OF {sections.length}</div>
          <h2 className="text-xl font-semibold text-black mt-1">{section.heading}</h2>
        </div>

        <button
          type="button"
          onClick={handleToggleTranslation}
          className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-lg text-sm font-semibold transition-colors"
        >
          <Languages size={16} />
          {isTranslating ? 'Translating...' : translationEnabled ? 'Original' : 'Translation'}
        </button>
      </div>

      <MarkdownRenderer content={renderedMarkdown} />

      <div className="mt-8 pt-6 border-t border-navy-300 flex justify-end">
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
    </div>
  )
}
