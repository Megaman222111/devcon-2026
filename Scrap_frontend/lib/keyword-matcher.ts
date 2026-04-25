import type { KeyTerm } from '@/types/lesson'

export function parseKeywords(
  text: string,
  keyTerms: KeyTerm[]
): Array<{ type: 'text' | 'keyword'; content: string; termId?: string }> {
  if (!keyTerms.length) {
    return [{ type: 'text', content: text }]
  }

  const sorted = [...keyTerms].sort((a, b) => b.english.length - a.english.length)
  const pattern = sorted
    .map((term) => term.english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  return parts
    .filter(Boolean)
    .map((part) => {
      const term = sorted.find((item) => item.english.toLowerCase() === part.toLowerCase())
      return term
        ? { type: 'keyword' as const, content: part, termId: term.id }
        : { type: 'text' as const, content: part }
    })
}
