'use client'

import type { ElementType } from 'react'
import { BookOpenText, Check, Globe, Languages } from 'lucide-react'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import type { TranslationMode } from '@/types/quiz'
import { cn } from '@/lib/utils'

interface TranslationModeSelectorProps {
  selectedLanguage: LanguageCode
  selectedMode: TranslationMode
  onSelect: (mode: TranslationMode) => void
}

const previewTranslations: Record<string, string> = {
  en: 'Use of Force',
  tl: 'Paggamit ng Puwersa',
  hi: 'बल का प्रयोग',
  ur: 'طاقت کا استعمال',
  zh: '使用武力',
  ko: '물리력 사용',
  vi: 'Sử dụng vũ lực',
  es: 'Uso de la fuerza',
  pt: 'Uso da força',
  fr: 'Usage de la force',
  ar: 'استخدام القوة',
  ja: '有形力の行使',
}

type ModeCard = {
  mode: TranslationMode
  icon: ElementType
  title: string
  description: string
  recommended?: boolean
}

const modeCards: ModeCard[] = [
  {
    mode: 'keywords',
    icon: BookOpenText,
    title: 'Keywords only',
    description: 'Security terms appear translated in the sidebar and build confidence over time.',
    recommended: true,
  },
  {
    mode: 'ondemand',
    icon: Globe,
    title: 'Keywords + full paragraphs on request',
    description: 'See key terms translated, then expand any paragraph when you need extra support.',
  },
  {
    mode: 'none',
    icon: Languages,
    title: 'English only',
    description: 'No translations. Best for learners who want full English immersion.',
  },
]

export function TranslationModeSelector({
  selectedLanguage,
  selectedMode,
  onSelect,
}: TranslationModeSelectorProps) {
  const language = getLanguageByCode(selectedLanguage)
  const modes = selectedLanguage === 'en' ? modeCards.filter((card) => card.mode === 'none') : modeCards

  return (
    <div className="space-y-4">
      {selectedLanguage === 'en' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-sm text-slate-300">
          Since English is your primary language, no translation sidebar will appear.
        </div>
      )}

      {modes.map((card) => {
        const selected = selectedMode === card.mode
        return (
          <button
            key={card.mode}
            type="button"
            onClick={() => onSelect(card.mode)}
            className={cn(
              'relative w-full rounded-3xl border p-5 text-left transition-colors',
              selected
                ? 'border-2 border-amber-500 bg-amber-500/8'
                : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
            )}
          >
            {card.recommended && card.mode === 'keywords' && (
              <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950">
                Recommended
              </span>
            )}

            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl',
                  selected ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-800 text-slate-300'
                )}
              >
                <card.icon size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{card.title}</h3>
                  {selected && <Check size={16} className="text-amber-400" />}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>

                {card.mode === 'keywords' && selectedLanguage !== 'en' && (
                  <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Preview
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">EN: Use of Force</div>
                    <div
                      className="mt-1 text-sm text-amber-300"
                      dir={language.rtl ? 'rtl' : 'ltr'}
                    >
                      {language.flag} {previewTranslations[selectedLanguage]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}

      <p className="text-xs text-slate-400">You can change this any time in Settings.</p>
    </div>
  )
}
