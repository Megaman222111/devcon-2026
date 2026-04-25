'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import { cn } from '@/lib/utils'

type DrawerState = 'hidden' | 'loading' | 'expanded' | 'error'

interface TranslationDrawerProps {
  paragraphId: string
  paragraphText: string
  targetLanguage: LanguageCode
}

const cacheKey = (paragraphId: string, language: LanguageCode) =>
  `abst-paragraph:${paragraphId}:${language}`

export function TranslationDrawer({
  paragraphId,
  paragraphText,
  targetLanguage,
}: TranslationDrawerProps) {
  const [state, setState] = useState<DrawerState>('hidden')
  const [translatedText, setTranslatedText] = useState('')
  const language = useMemo(() => getLanguageByCode(targetLanguage), [targetLanguage])

  const toggle = async () => {
    if (state === 'expanded') {
      setState('hidden')
      return
    }

    const cached = sessionStorage.getItem(cacheKey(paragraphId, targetLanguage))
    if (cached) {
      setTranslatedText(cached)
      setState('expanded')
      return
    }

    setState('loading')

    try {
      const response = await fetch('/api/translate/paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraphId,
          text: paragraphText,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Translation unavailable')
      }

      const payload = (await response.json()) as { translatedText?: string }
      if (!payload.translatedText) {
        throw new Error('Translation unavailable')
      }

      sessionStorage.setItem(cacheKey(paragraphId, targetLanguage), payload.translatedText)
      setTranslatedText(payload.translatedText)
      setState('expanded')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
      >
        <Globe size={15} />
        <span>Show paragraph in {language.name}</span>
        <ChevronDown size={15} className={cn('transition-transform', state === 'expanded' && 'rotate-180')} />
      </button>

      {state === 'loading' && (
        <div className="mt-3 rounded-2xl border-l-2 border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-200">
          Translating...
        </div>
      )}

      {state === 'expanded' && (
        <div
          className="mt-3 rounded-2xl border-l-2 border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-7 text-amber-200"
          dir={language.rtl ? 'rtl' : 'ltr'}
        >
          {translatedText}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/8 p-4 text-sm text-red-200">
          Translation unavailable right now.
        </div>
      )}
    </div>
  )
}
