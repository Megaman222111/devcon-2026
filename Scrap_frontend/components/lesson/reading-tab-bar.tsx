'use client'

import { BookOpenText, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadingTabBarProps {
  activeTab: 'reading' | 'terms'
  onChange: (tab: 'reading' | 'terms') => void
  totalTerms: number
}

export function ReadingTabBar({ activeTab, onChange, totalTerms }: ReadingTabBarProps) {
  return (
    <div className="sticky top-16 z-30 mb-5 grid h-12 grid-cols-2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 lg:hidden">
      <button
        type="button"
        onClick={() => onChange('reading')}
        className={cn(
          'flex items-center justify-center gap-2 text-sm font-semibold transition-colors',
          activeTab === 'reading'
            ? 'border-b-2 border-amber-500 text-white'
            : 'text-slate-400'
        )}
      >
        <BookOpenText size={16} />
        Reading
      </button>
      <button
        type="button"
        onClick={() => onChange('terms')}
        className={cn(
          'flex items-center justify-center gap-2 text-sm font-semibold transition-colors',
          activeTab === 'terms'
            ? 'border-b-2 border-amber-500 text-white'
            : 'text-slate-400'
        )}
      >
        <Languages size={16} />
        Key Terms ({totalTerms})
      </button>
    </div>
  )
}
