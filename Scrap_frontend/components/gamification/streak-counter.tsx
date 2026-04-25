'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StreakCounterProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 18, text: 'text-sm' },
  md: { icon: 22, text: 'text-base' },
  lg: { icon: 26, text: 'text-lg' },
}

export function StreakCounter({
  streak,
  size = 'md',
  animated = true,
  className,
}: StreakCounterProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size]
  const isActive = streak > 0
  const isHot = streak >= 7

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <motion.div
        animate={
          animated && isActive
            ? { scale: [1, 1.1, 1] }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame
          size={iconSize}
          className={cn(
            'transition-all duration-200',
            isActive
              ? isHot
                ? 'fill-[#FF9600] text-[#FF9600]'
                : 'fill-[#FF9600] text-[#FF9600]'
              : 'fill-muted-foreground text-muted-foreground'
          )}
        />
      </motion.div>
      <motion.span
        key={streak}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'font-bold',
          textSize,
          isActive ? 'text-[#FF9600]' : 'text-muted-foreground'
        )}
      >
        {streak}
      </motion.span>
    </div>
  )
}
