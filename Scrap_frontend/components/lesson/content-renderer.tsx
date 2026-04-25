'use client'

import { useMemo } from 'react'
import type { ContentBlock, KeyTerm, ParagraphBlock } from '@/types/lesson'
import type { LanguageCode } from '@/data/languages'
import type { TranslationMode } from '@/types/quiz'
import { KeywordHighlighter } from './keyword-highlighter'
import { TranslationDrawer } from './translation-drawer'
import { cn } from '@/lib/utils'

interface ContentRendererProps {
  blocks: ContentBlock[]
  keyTerms: KeyTerm[]
  highlightedTermId: string | null
  translationMode: TranslationMode
  language: LanguageCode
  reviewTopics?: string[]
  onTermHover: (termId: string | null) => void
}

function ParagraphWithHighlight({
  block,
  keyTerms,
  highlightedTermId,
  translationMode,
  language,
  reviewTopics,
  onTermHover,
}: {
  block: ParagraphBlock
  keyTerms: KeyTerm[]
  highlightedTermId: string | null
  translationMode: TranslationMode
  language: LanguageCode
  reviewTopics: string[]
  onTermHover: (termId: string | null) => void
}) {
  const paragraphTerms = useMemo(
    () => keyTerms.filter((term) => block.keywordRefs.includes(term.id)),
    [block.keywordRefs, keyTerms]
  )
  const highlightedForReview =
    reviewTopics.length > 0 &&
    block.topicTags?.some((topic) => reviewTopics.includes(topic))

  return (
    <div
      data-block-id={block.id}
      className={cn(
        'rounded-2xl px-1 py-1',
        highlightedForReview && 'bg-amber-500/8 ring-1 ring-amber-500/15'
      )}
    >
      <p className="text-base leading-8 text-slate-100">
        <KeywordHighlighter
          text={block.text}
          keyTerms={paragraphTerms}
          highlightedTermId={highlightedTermId}
          language={language}
          onTermHover={onTermHover}
        />
      </p>

      {translationMode === 'ondemand' && language !== 'en' && (
        <TranslationDrawer
          paragraphId={block.id}
          paragraphText={block.text}
          targetLanguage={language}
        />
      )}
    </div>
  )
}

export function ContentRenderer({
  blocks,
  keyTerms,
  highlightedTermId,
  translationMode,
  language,
  reviewTopics = [],
  onTermHover,
}: ContentRendererProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <div key={block.id} id={block.id} className="border-l-4 border-amber-500 pl-4 pt-3">
              <h2 className="font-display text-[26px] font-semibold text-white">{block.text}</h2>
            </div>
          )
        }

        if (block.type === 'paragraph') {
          return (
            <ParagraphWithHighlight
              key={block.id}
              block={block}
              keyTerms={keyTerms}
              highlightedTermId={highlightedTermId}
              translationMode={translationMode}
              language={language}
              reviewTopics={reviewTopics}
              onTermHover={onTermHover}
            />
          )
        }

        if (block.type === 'definition') {
          return (
            <div key={block.id} className="rounded-2xl border-l-4 border-amber-500 bg-slate-800/80 px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Definition</div>
              <div className="mt-2 font-display text-xl font-semibold text-amber-300">{block.term}</div>
              <p className="mt-2 text-slate-100">{block.definition}</p>
            </div>
          )
        }

        if (block.type === 'list') {
          const ListTag = block.style === 'numbered' ? 'ol' : 'ul'
          return (
            <ListTag
              key={block.id}
              className={cn(
                'space-y-2 pl-6 text-slate-100',
                block.style === 'numbered' ? 'list-decimal' : 'list-disc'
              )}
            >
              {block.items.map((item) => (
                <li key={`${block.id}-${item}`}>{item}</li>
              ))}
            </ListTag>
          )
        }

        if (block.type === 'callout') {
          const styles = {
            info: 'border-blue-400/50 bg-blue-400/10',
            warning: 'border-orange-400/50 bg-orange-400/10',
            tip: 'border-emerald-400/50 bg-emerald-400/10',
            legal: 'border-amber-400/50 bg-amber-400/10',
          }

          return (
            <div
              key={block.id}
              className={cn('rounded-2xl border p-4 text-slate-100', styles[block.variant])}
            >
              {block.title && <div className="font-semibold text-white">{block.title}</div>}
              <p className="mt-2 leading-7">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'legal') {
          return (
            <div key={block.id} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <span className="rounded-full bg-slate-800 px-2.5 py-1 font-mono text-xs text-amber-300">
                {block.code}
              </span>
              <p className="mt-3 text-sm leading-7 text-slate-200">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'image') {
          return (
            <figure key={block.id} className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} className="w-full object-cover" />
              {block.caption && (
                <figcaption className="border-t border-slate-700 px-4 py-3 text-sm text-slate-400">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )
        }

        return <hr key={`divider-${index}`} className="border-slate-700" />
      })}
    </div>
  )
}
