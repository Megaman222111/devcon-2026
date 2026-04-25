'use client'

import { useEffect, useState } from 'react'

export function useScrollTracking(ids: string[]) {
  const [visibleIds, setVisibleIds] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!ids.length) return

    const active = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false

        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.blockId
          if (!id) return

          if (entry.isIntersecting) {
            if (!active.has(id)) {
              active.add(id)
              changed = true
            }
          } else if (active.delete(id)) {
            changed = true
          }
        })

        if (changed) {
          const ordered = ids.filter((id) => active.has(id))
          setVisibleIds(ordered)
          const furthestIndex = ordered.length
            ? Math.max(...ordered.map((id) => ids.indexOf(id)))
            : 0
          setProgress(((furthestIndex + 1) / ids.length) * 100)
        }
      },
      { threshold: 0.5, rootMargin: '-20% 0px -35% 0px' }
    )

    const elements = ids
      .map((id) => document.querySelector<HTMLElement>(`[data-block-id="${id}"]`))
      .filter(Boolean) as HTMLElement[]

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids])

  return { visibleIds, progress }
}
