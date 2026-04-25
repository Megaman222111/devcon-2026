'use client'

import { CheckCircle2, Lock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export type NodeState = 'completed' | 'current' | 'upcoming' | 'locked'

interface PathNodeProps {
  state: NodeState
  lessonNumber: string
  lessonTitle: string
  xp?: number
  onClick?: () => void
  className?: string
}

const stateConfig = {
  completed: {
    bg: 'bg-primary',
    border: 'border-[#46A302]',
    icon: CheckCircle2,
    iconColor: 'text-white',
    textColor: 'text-foreground',
    subtextColor: 'text-muted-foreground',
    size: 'w-16 h-16',
    shadow: 'shadow-[0_4px_0_#46A302]',
  },
  current: {
    bg: 'bg-primary',
    border: 'border-[#46A302]',
    icon: Star,
    iconColor: 'text-white',
    textColor: 'text-foreground font-bold',
    subtextColor: 'text-primary font-semibold',
    size: 'w-20 h-20',
    shadow: 'shadow-[0_6px_0_#46A302]',
  },
  upcoming: {
    bg: 'bg-secondary',
    border: 'border-border',
    icon: null,
    iconColor: '',
    textColor: 'text-muted-foreground',
    subtextColor: 'text-muted-foreground',
    size: 'w-16 h-16',
    shadow: 'shadow-[0_4px_0_var(--border)]',
  },
  locked: {
    bg: 'bg-muted',
    border: 'border-border',
    icon: Lock,
    iconColor: 'text-muted-foreground',
    textColor: 'text-muted-foreground',
    subtextColor: 'text-muted-foreground',
    size: 'w-16 h-16',
    shadow: '',
  },
}

export function PathNode({
  state,
  lessonNumber,
  lessonTitle,
  xp,
  onClick,
  className,
}: PathNodeProps) {
  const config = stateConfig[state]
  const Icon = config.icon
  const isInteractive = state === 'current' || state === 'completed' || state === 'upcoming'

  return (
    <motion.button
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      whileHover={isInteractive ? { scale: 1.05 } : {}}
      whileTap={isInteractive ? { scale: 0.95, y: 2 } : {}}
      className={cn(
        'flex flex-col items-center gap-3',
        isInteractive && 'cursor-pointer',
        !isInteractive && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <div className="relative">
        {/* Pulse ring for current */}
        {state === 'current' && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
        )}
        
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2 transition-all',
            config.bg,
            config.border,
            config.size,
            config.shadow
          )}
        >
          {Icon && <Icon size={state === 'current' ? 32 : 24} className={config.iconColor} />}
          {!Icon && state === 'upcoming' && (
            <span className="font-bold text-xl text-muted-foreground">
              {lessonNumber}
            </span>
          )}
        </div>

        {/* Start badge for current */}
        {state === 'current' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-xl whitespace-nowrap shadow-md"
          >
            START
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45" />
          </motion.div>
        )}
      </div>

      <div className="text-center max-w-[120px]">
        <div className={cn('text-sm', config.subtextColor)}>
          Lesson {lessonNumber}
        </div>
        <div className={cn('text-sm mt-0.5 line-clamp-2', config.textColor)}>
          {lessonTitle}
        </div>
        {xp && state === 'completed' && (
          <div className="text-xs text-primary font-semibold mt-1">+{xp} XP</div>
        )}
      </div>
    </motion.button>
  )
}
