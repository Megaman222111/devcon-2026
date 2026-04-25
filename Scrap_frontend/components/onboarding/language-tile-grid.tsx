'use client'

import { useMemo, useState } from 'react'
import { Search, Globe2 } from 'lucide-react'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/data/languages'
import { LanguageTile } from './language-tile'

interface LanguageTileGridProps {
  selected: LanguageCode | null
  onSelect: (code: LanguageCode) => void
  onAutoDetect: () => void
}

export function LanguageTileGrid({
  selected,
  onSelect,
  onAutoDetect,
}: LanguageTileGridProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(
    () =>
      SUPPORTED_LANGUAGES.filter((language) => {
        const query = searchQuery.toLowerCase()
        return (
          language.name.toLowerCase().includes(query) ||
          language.nativeScript?.toLowerCase().includes(query)
        )
      }),
    [searchQuery]
  )

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3">
        <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search languages..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="mt-4 grid max-h-[320px] grid-cols-2 gap-3 overflow-y-auto pr-1">
          {filtered.map((language) => (
            <LanguageTile
              key={language.code}
              language={language}
              selected={selected === language.code}
              onClick={() => onSelect(language.code)}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onAutoDetect}
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
      >
        <Globe2 size={16} />
        Detect my language automatically
      </button>
    </div>
  )
}
