'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface XPBarProps {
  xp: number
  level: number
  xpPerLevel?: number
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  compact?: boolean
  className?: string
}

export function XPBar({
  xp,
  level,
  xpPerLevel = 150,
  size = 'md',
  showLevel = true,
  compact = false,
  className,
}: XPBarProps) {
  const xpInCurrentLevel = xp % xpPerLevel

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#FFC800]/20">
          <Zap size={14} className="fill-[#FFC800] text-[#FFC800]" />
        </div>
        <motion.span
          key={xp}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold text-[#FFC800]"
        >
          {xp}
        </motion.span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1.5">
        <Zap size={18} className="fill-[#FFC800] text-[#FFC800]" />
        <motion.span
          key={xp}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold text-foreground"
        >
          {xpInCurrentLevel} XP
        </motion.span>
      </div>
      {showLevel && (
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-2.5 py-1 bg-primary/10 rounded-lg"
          >
            <span className="text-xs font-bold text-primary">
              Level {level}
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

interface XPFloaterProps {
  amount: number
  onComplete?: () => void
}

export function XPFloater({ amount, onComplete }: XPFloaterProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onComplete}
      className="absolute top-0 right-0 flex items-center gap-1 text-[#FFC800] font-bold pointer-events-none"
    >
      <Zap size={14} className="fill-[#FFC800]" />
      <span>+{amount}</span>
    </motion.div>
  )
}
