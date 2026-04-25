'use client'

import { useMemo, useState } from 'react'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import { getTranslationForTerm } from '@/lib/mock-data'
import { parseKeywords } from '@/lib/keyword-matcher'
import { cn } from '@/lib/utils'
import type { KeyTerm } from '@/types/lesson'

interface KeywordHighlighterProps {
  text: string
  keyTerms: KeyTerm[]
  highlightedTermId: string | null
  language: LanguageCode
  onTermHover: (termId: string | null) => void
}

export function KeywordHighlighter({
  text,
  keyTerms,
  highlightedTermId,
  language,
  onTermHover,
}: KeywordHighlighterProps) {
  const [tappedTermId, setTappedTermId] = useState<string | null>(null)
  const languageMeta = getLanguageByCode(language)
  const segments = useMemo(() => parseKeywords(text, keyTerms), [keyTerms, text])

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`${segment.content}-${index}`}>{segment.content}</span>
        }

        const term = keyTerms.find((item) => item.id === segment.termId)
        if (!term) return <span key={`${segment.content}-${index}`}>{segment.content}</span>
        const active = highlightedTermId === term.id || tappedTermId === term.id

        return (
          <span key={`${segment.content}-${index}`} className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => onTermHover(term.id)}
              onMouseLeave={() => onTermHover(null)}
              onClick={() => {
                setTappedTermId((current) => (current === term.id ? null : term.id))
                window.setTimeout(() => setTappedTermId(null), 3000)
              }}
              className={cn(
                'cursor-pointer rounded px-0.5 underline decoration-dotted underline-offset-4 transition-colors',
                active
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'decoration-amber-500 hover:bg-amber-500/15 hover:text-amber-300'
              )}
            >
              {segment.content}
            </button>

            {tappedTermId === term.id && (
              <span className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-xl border border-amber-500/40 bg-slate-950 px-3 py-2 text-xs text-amber-200 shadow-xl">
                <span className="block whitespace-nowrap" dir={languageMeta.rtl ? 'rtl' : 'ltr'}>
                  {getTranslationForTerm(term, language)}
                </span>
                <span className="mt-1 block whitespace-nowrap text-[11px] text-slate-400">
                  {languageMeta.name}
                </span>
              </span>
            )}
          </span>
        )
      })}
    </>
  )
}
