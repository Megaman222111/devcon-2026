'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimationEngineProps {
  imageUrl: string
  altText: string
  durationSeconds?: number
  locationLabel: string
  replayKey?: number
  dimmed?: boolean
  onComplete?: () => void
}

const variants = [
  'scale-[1.08] -translate-x-2 -translate-y-1',
  'scale-[1.12] translate-x-2 -translate-y-2',
  'scale-[1.05] -translate-x-1 translate-y-1',
]

export function AnimationEngine({
  imageUrl,
  altText,
  durationSeconds = 8,
  locationLabel,
  replayKey = 0,
  dimmed = false,
  onComplete,
}: AnimationEngineProps) {
  const animationClass = useMemo(
    () => variants[replayKey % variants.length],
    [replayKey]
  )

  useEffect(() => {
    if (!onComplete) return
    const timeout = window.setTimeout(onComplete, durationSeconds * 1000)
    return () => window.clearTimeout(timeout)
  }, [durationSeconds, onComplete, replayKey])

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-slate-700 shadow-2xl shadow-black/30">
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={replayKey}
          src={imageUrl}
          alt={altText}
          className={cn(
            'h-full w-full object-cover transition-transform duration-[8000ms] ease-in-out',
            animationClass,
            dimmed && 'brightness-50 blur-[1px]'
          )}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('/noise.svg')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.45 }}
          className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur"
        >
          {locationLabel}
        </motion.div>

        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-slate-800/80">
          <motion.div
            key={replayKey}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: durationSeconds, ease: 'linear' }}
            className="h-full bg-amber-500"
          />
        </div>
      </div>
    </div>
  )
}
