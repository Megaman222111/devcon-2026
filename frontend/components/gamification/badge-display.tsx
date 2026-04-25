'use client'

import { Award, Shield, Eye, Scale, FileCheck, Heart as HeartIcon, Zap, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
}

interface BadgeDisplayProps {
  badge: Badge
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  onClick?: () => void
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  eye: Eye,
  scale: Scale,
  file: FileCheck,
  heart: HeartIcon,
  zap: Zap,
  star: Star,
  award: Award,
}

const sizeMap = {
  sm: { container: 'w-10 h-10', icon: 16, text: 'text-xs' },
  md: { container: 'w-14 h-14', icon: 24, text: 'text-sm' },
  lg: { container: 'w-20 h-20', icon: 32, text: 'text-base' },
}

export function BadgeDisplay({
  badge,
  size = 'md',
  showName = false,
  onClick,
  className,
}: BadgeDisplayProps) {
  const { container, icon: iconSize, text: textSize } = sizeMap[size]
  const IconComponent = iconMap[badge.icon] || Award

  return (
    <motion.button
      onClick={onClick}
      disabled={!onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={cn(
        'flex flex-col items-center gap-1.5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-200',
          container,
          badge.earned
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30'
            : 'bg-navy-700 opacity-50'
        )}
      >
        <IconComponent
          size={iconSize}
          className={cn(
            badge.earned ? 'text-navy-900' : 'text-navy-500'
          )}
        />
      </div>
      {showName && (
        <span
          className={cn(
            'font-medium text-center',
            textSize,
            badge.earned ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {badge.name}
        </span>
      )}
    </motion.button>
  )
}

interface BadgeGridProps {
  badges: Badge[]
  size?: 'sm' | 'md' | 'lg'
  showNames?: boolean
  onBadgeClick?: (badge: Badge) => void
  className?: string
}

export function BadgeGrid({
  badges,
  size = 'md',
  showNames = false,
  onBadgeClick,
  className,
}: BadgeGridProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          size={size}
          showName={showNames}
          onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
        />
      ))}
    </div>
  )
}
