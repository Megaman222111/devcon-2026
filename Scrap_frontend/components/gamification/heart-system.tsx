'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface HeartSystemProps {
  lives: number
  maxLives?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

const sizeMap = {
  sm: 18,
  md: 22,
  lg: 26,
}

export function HeartSystem({
  lives,
  maxLives = 3,
  size = 'md',
  showCount = true,
  className,
}: HeartSystemProps) {
  const iconSize = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={lives}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            size={iconSize}
            className="fill-[#FF4B4B] text-[#FF4B4B]"
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className={cn(
          'font-bold text-[#FF4B4B]',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}>
          {lives}
        </span>
      )}
    </div>
  )
}
