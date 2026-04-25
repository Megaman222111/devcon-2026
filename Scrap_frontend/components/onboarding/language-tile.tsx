'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupportedLanguage } from '@/data/languages'

interface LanguageTileProps {
  language: SupportedLanguage
  selected: boolean
  onClick: () => void
}

export function LanguageTile({ language, selected, onClick }: LanguageTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      animate={selected ? { scale: [1, 0.97, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative h-[88px] rounded-2xl border px-4 py-3 text-left transition-colors',
        selected
          ? 'border-2 border-amber-500 bg-amber-500/10'
          : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
      )}
      dir={language.rtl ? 'rtl' : 'ltr'}
    >
      {selected && <Check size={16} className="absolute right-3 top-3 text-amber-500" />}
      <div className="text-[28px] leading-none">{language.flag}</div>
      <div className="mt-2 text-sm font-semibold text-white">{language.name}</div>
      {language.nativeScript && (
        <div className="text-xs text-slate-300">{language.nativeScript}</div>
      )}
    </motion.button>
  )
}
