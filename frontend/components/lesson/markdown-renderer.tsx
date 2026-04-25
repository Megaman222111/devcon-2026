'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface KeywordHighlight {
  match: string
  translation: string
  translationLabel: string
}

interface MarkdownRendererProps {
  content: string
  highlightTerms?: KeywordHighlight[]
  activeHighlightTerm?: string | null
  onVisibleHighlightChange?: (term: string | null) => void
}

function resolveImageSrc(rawSrc: string): string | null {
  if (!rawSrc) return null
  if (/^https?:\/\//i.test(rawSrc) || rawSrc.startsWith('/')) return rawSrc

  const cleaned = rawSrc.replace(/^(\.\.?\/)+/, '')

  if (cleaned.startsWith('assets/')) {
    return `/files/${cleaned}`
  }
  if (cleaned.startsWith('files/')) {
    return `/${cleaned}`
  }
  if (cleaned.startsWith('lesson-images/')) {
    return `/${cleaned}`
  }
  if (/^module_\d+_p\d+\.png$/i.test(cleaned)) {
    return `/files/assets/${cleaned}`
  }

  return `/files/${cleaned}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function MarkdownRenderer({
  content,
  highlightTerms = [],
  activeHighlightTerm,
  onVisibleHighlightChange,
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tappedTerm, setTappedTerm] = useState<string | null>(null)
  const tapResetRef = useRef<number | null>(null)

  useEffect(() => {
    if (!tappedTerm) return
    if (tapResetRef.current) window.clearTimeout(tapResetRef.current)
    tapResetRef.current = window.setTimeout(() => setTappedTerm(null), 3000)
    return () => {
      if (tapResetRef.current) window.clearTimeout(tapResetRef.current)
    }
  }, [tappedTerm])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const existingHighlights = container.querySelectorAll('span[data-keyword-highlight="true"]')
    existingHighlights.forEach((highlightNode) => {
      const parent = highlightNode.parentNode
      if (!parent) return
      parent.replaceChild(document.createTextNode(highlightNode.textContent ?? ''), highlightNode)
      parent.normalize()
    })

    const termsByMatch = new Map<string, KeywordHighlight>()
    highlightTerms
      .filter((entry) => entry.match.trim().length > 0)
      .sort((a, b) => b.match.length - a.match.length)
      .forEach((entry) => {
        const key = normalize(entry.match)
        if (!termsByMatch.has(key)) termsByMatch.set(key, entry)
      })

    if (termsByMatch.size === 0) {
      onVisibleHighlightChange?.(null)
      return
    }

    const matcher = new RegExp(
      `(${Array.from(termsByMatch.values())
        .map((entry) => escapeRegExp(entry.match))
        .join('|')})`,
      'gi'
    )
    const active = normalize(activeHighlightTerm ?? '')
    const tapped = normalize(tappedTerm ?? '')

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parentElement = node.parentElement
        if (!parentElement) return NodeFilter.FILTER_REJECT
        if (parentElement.closest('code, pre, a, button[data-keyword-button="true"]')) {
          return NodeFilter.FILTER_REJECT
        }
        matcher.lastIndex = 0
        return node.nodeValue && matcher.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT
      },
    })

    const textNodes: Text[] = []
    let currentNode = walker.nextNode()
    while (currentNode) {
      textNodes.push(currentNode as Text)
      currentNode = walker.nextNode()
    }

    textNodes.forEach((textNode) => {
      const value = textNode.nodeValue
      if (!value) return
      const parts = value.split(matcher)
      if (parts.length <= 1) return

      const fragment = document.createDocumentFragment()
      parts.forEach((part, index) => {
        if (!part) return
        if (index % 2 === 1) {
          const normalizedPart = normalize(part)
          const meta = termsByMatch.get(normalizedPart)
          const wrapper = document.createElement('span')
          wrapper.dataset.keywordHighlight = 'true'
          wrapper.dataset.keywordTerm = normalizedPart
          wrapper.className = 'relative inline-block align-baseline'

          const button = document.createElement('button')
          button.type = 'button'
          button.dataset.keywordButton = 'true'
          button.dataset.keywordTerm = normalizedPart
          button.textContent = part
          const isActive = normalizedPart === active || normalizedPart === tapped
          button.className = isActive
            ? 'cursor-pointer rounded-md px-1 font-semibold underline decoration-solid underline-offset-4 transition-colors bg-amber-400 text-slate-950 dark:bg-amber-300 dark:text-slate-950'
            : 'cursor-pointer rounded-md px-1 font-medium underline decoration-dotted underline-offset-4 decoration-amber-500 text-slate-900 transition-colors bg-amber-100/85 hover:bg-amber-200 dark:decoration-amber-300 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/35'

          wrapper.appendChild(button)

          if (normalizedPart === tapped && meta) {
            const tip = document.createElement('span')
            tip.className =
              'absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-amber-500/40 bg-white px-3 py-2 text-xs text-amber-700 shadow-xl dark:bg-slate-950 dark:text-amber-200'
            const translationLine = document.createElement('span')
            translationLine.className = 'block whitespace-nowrap font-semibold'
            translationLine.textContent = meta.translation
            const labelLine = document.createElement('span')
            labelLine.className = 'mt-1 block whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400'
            labelLine.textContent = meta.translationLabel
            tip.appendChild(translationLine)
            tip.appendChild(labelLine)
            wrapper.appendChild(tip)
          }

          fragment.appendChild(wrapper)
          return
        }
        fragment.appendChild(document.createTextNode(part))
      })

      textNode.parentNode?.replaceChild(fragment, textNode)
    })

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('button[data-keyword-button="true"]') as HTMLButtonElement | null
      if (!button) return
      event.preventDefault()
      const term = button.dataset.keywordTerm ?? ''
      setTappedTerm((current) => (current === term ? null : term))
    }
    container.addEventListener('click', handleClick)

    const highlightButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-keyword-button="true"]')
    )
    let currentVisibleTerm: string | null | undefined

    const updateVisibleTerm = () => {
      if (!onVisibleHighlightChange) return

      const viewportAnchor = window.innerHeight * 0.35
      const candidates = highlightButtons
        .map((button) => {
          const rect = button.getBoundingClientRect()
          const intersectsViewport = rect.bottom >= 0 && rect.top <= window.innerHeight
          if (!intersectsViewport) return null

          return {
            button,
            distance: Math.abs(rect.top - viewportAnchor),
            height: rect.height,
          }
        })
        .filter(
          (candidate): candidate is { button: HTMLButtonElement; distance: number; height: number } =>
            candidate !== null
        )

      candidates.sort((left, right) => {
        if (left.distance !== right.distance) return left.distance - right.distance
        return right.height - left.height
      })

      const nextVisibleTerm = candidates[0]?.button.dataset.keywordTerm ?? null
      if (nextVisibleTerm === currentVisibleTerm) return
      currentVisibleTerm = nextVisibleTerm
      onVisibleHighlightChange(nextVisibleTerm)
    }

    if (highlightButtons.length > 0 && onVisibleHighlightChange) {
      const handleScrollOrResize = () => updateVisibleTerm()
      window.addEventListener('scroll', handleScrollOrResize, { passive: true })
      window.addEventListener('resize', handleScrollOrResize)
      window.requestAnimationFrame(updateVisibleTerm)
      return () => {
        container.removeEventListener('click', handleClick)
        window.removeEventListener('scroll', handleScrollOrResize)
        window.removeEventListener('resize', handleScrollOrResize)
      }
    }

    onVisibleHighlightChange?.(null)
    return () => {
      container.removeEventListener('click', handleClick)
    }
  }, [content, highlightTerms, activeHighlightTerm, onVisibleHighlightChange, tappedTerm])

  return (
    <div ref={containerRef} className="lesson-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 font-display text-3xl font-bold text-slate-900 dark:text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 border-l-4 border-amber-500 pl-4 font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-7 text-xl font-semibold text-slate-900 dark:text-white">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-8 text-slate-700 dark:text-slate-100">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-100">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-100">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-amber-700 dark:text-amber-200">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="mb-5 rounded-2xl border-l-4 border-amber-500 bg-amber-50 px-5 py-4 text-slate-800 dark:bg-slate-800/80 dark:text-slate-100 [&_p:last-child]:mb-0">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-amber-700 dark:bg-slate-950 dark:text-amber-300">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-amber-600 underline hover:text-amber-500 dark:text-amber-300 dark:hover:text-amber-200"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            const rawSrc = typeof src === 'string' ? src : ''
            const resolved = resolveImageSrc(rawSrc)
            const fileName = rawSrc.split('/').pop() ?? ''

            if (!resolved) {
              return (
                <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  Image not available: {alt ?? fileName}
                </div>
              )
            }

            return (
              <figure className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolved}
                  alt={alt ?? fileName}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {alt}
                  </figcaption>
                )}
              </figure>
            )
          },
          hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
