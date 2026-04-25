'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Languages, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import { getTranslationForTerm } from '@/lib/mock-data'
import type { KeyTerm } from '@/types/lesson'
import type { TranslationMode } from '@/types/quiz'

interface KeyTermPanelProps {
  allTerms: KeyTerm[]
  activeTermIds: string[]
  highlightedTermId: string | null
  onTermHover: (id: string | null) => void
  language: LanguageCode
  translationMode: TranslationMode
  className?: string
}

export function KeyTermPanel({
  allTerms,
  activeTermIds,
  highlightedTermId,
  onTermHover,
  language,
  translationMode,
  className,
}: KeyTermPanelProps) {
  const languageMeta = getLanguageByCode(language)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const activeRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const activeTerms = useMemo(
    () => allTerms.filter((term) => activeTermIds.includes(term.id)),
    [activeTermIds, allTerms]
  )

  useEffect(() => {
    const firstActive = activeTerms[0]
    if (!firstActive) return
    activeRefs.current[firstActive.id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeTerms])

  const playAudio = (term: KeyTerm) => {
    if (!term.audioUrl) return
    setPlayingId(term.id)
    const audio = new Audio(term.audioUrl)
    audio.play().catch(() => undefined)
    audio.onended = () => setPlayingId(null)
  }

  if (translationMode === 'none') {
    return (
      <div className={cn('rounded-3xl border border-slate-700 bg-slate-900 p-5', className)}>
        <div className="flex items-center gap-2 text-slate-300">
          <Languages size={18} className="text-amber-400" />
          <span className="font-semibold">English only</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          You chose full English immersion, so the translation sidebar stays hidden during reading.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-5 rounded-3xl border border-slate-700 bg-slate-900 p-5', className)}>
      <div className="border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2 text-amber-400">
          <span className="text-xl">{languageMeta.flag}</span>
          <span className="font-semibold uppercase tracking-[0.18em]">Key Terms</span>
        </div>
        <div className="mt-1 text-sm text-slate-400">{languageMeta.name}</div>
      </div>

      {activeTerms.length > 0 && (
        <section>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            In this section
          </div>
          <div className="mt-3 space-y-3">
            {activeTerms.map((term) => {
              const isHighlighted = highlightedTermId === term.id
              return (
                <div
                  key={term.id}
                  ref={(element) => {
                    activeRefs.current[term.id] = element
                  }}
                  onMouseEnter={() => onTermHover(term.id)}
                  onMouseLeave={() => onTermHover(null)}
                  className={cn(
                    'rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 transition-all',
                    'border-l-2 border-l-amber-500 shadow-lg shadow-slate-950/20',
                    isHighlighted && 'bg-amber-500/10'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-white">{term.english}</div>
                    {term.audioUrl && (
                      <button type="button" onClick={() => playAudio(term)}>
                        <Volume2
                          size={15}
                          className={cn(
                            'text-slate-300 transition-transform',
                            playingId === term.id && 'scale-110 text-amber-300'
                          )}
                        />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-amber-300" dir={languageMeta.rtl ? 'rtl' : 'ltr'}>
                    {getTranslationForTerm(term, language)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          All terms in lesson
        </div>
        <div className="mt-3 space-y-2">
          {allTerms.map((term) => {
            const isActive = activeTermIds.includes(term.id)
            const isHighlighted = highlightedTermId === term.id
            return (
              <div
                key={term.id}
                onMouseEnter={() => onTermHover(term.id)}
                onMouseLeave={() => onTermHover(null)}
                className={cn(
                  'rounded-2xl border px-4 py-3 transition-colors',
                  isActive
                    ? 'border-amber-500/50 bg-slate-800 text-white'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300',
                  isHighlighted && 'bg-amber-500/10'
                )}
              >
                <div className="font-medium">{term.english}</div>
                <div className="mt-1 text-sm text-amber-300" dir={languageMeta.rtl ? 'rtl' : 'ltr'}>
                  {getTranslationForTerm(term, language)}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
