'use client'

import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KeyTerm {
  english: string
  translated: string
  nativeScript?: string
}

interface KeyTermPanelProps {
  terms: KeyTerm[]
  targetLanguage?: string
  className?: string
}

export function KeyTermPanel({
  terms,
  targetLanguage = 'Tagalog',
  className,
}: KeyTermPanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 pb-3 border-b border-navy-600">
        <Languages size={18} className="text-amber-500" />
        <span className="font-semibold text-amber-500">KEY TERMS</span>
        <span className="text-sm text-navy-400">({targetLanguage})</span>
      </div>

      <div className="space-y-3">
        {terms.map((term, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-navy-800/50 border border-navy-700 hover:border-navy-600 transition-colors"
          >
            <div className="font-semibold text-amber-500 text-sm">{term.english}</div>
            <div className="text-amber-300 text-sm mt-0.5">{term.translated}</div>
            {term.nativeScript && (
              <div className="text-navy-400 text-xs mt-0.5">{term.nativeScript}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
