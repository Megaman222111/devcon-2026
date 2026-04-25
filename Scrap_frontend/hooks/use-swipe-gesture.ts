'use client'

import { useMemo, useRef } from 'react'

export function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) {
  const startX = useRef<number | null>(null)

  return useMemo(
    () => ({
      onTouchStart: (event: React.TouchEvent<HTMLElement>) => {
        startX.current = event.changedTouches[0]?.clientX ?? null
      },
      onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
        if (startX.current === null) return
        const endX = event.changedTouches[0]?.clientX ?? startX.current
        const deltaX = endX - startX.current

        if (deltaX <= -threshold) onSwipeLeft()
        if (deltaX >= threshold) onSwipeRight()
        startX.current = null
      },
    }),
    [onSwipeLeft, onSwipeRight, threshold]
  )
}
