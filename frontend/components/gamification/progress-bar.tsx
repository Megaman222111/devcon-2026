'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'green' | 'blue' | 'gold' | 'red'
  height?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  label?: string
  className?: string
}

const heightMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

const colorMap = {
  green: 'bg-primary',
  blue: 'bg-[#1CB0F6]',
  gold: 'bg-[#FFC800]',
  red: 'bg-[#FF4B4B]',
}

const trackColorMap = {
  green: 'bg-primary/20',
  blue: 'bg-[#1CB0F6]/20',
  gold: 'bg-[#FFC800]/20',
  red: 'bg-[#FF4B4B]/20',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'green',
  height = 'md',
  animated = true,
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          <span className="text-sm font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          trackColorMap[color],
          heightMap[height]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', colorMap[color])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.6 : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
    </div>
  )
}
