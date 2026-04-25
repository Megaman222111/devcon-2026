'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { XPBar } from '@/components/gamification/xp-bar'
import { HeartSystem } from '@/components/gamification/heart-system'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { useAppStore } from '@/lib/store'
import { ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface TopNavProps {
  breadcrumb?: {
    module?: string
    lesson?: string
  }
  showStats?: boolean
  className?: string
}

export function TopNav({
  breadcrumb,
  showStats = true,
  className,
}: TopNavProps) {
  const progress = useAppStore((state) => state.progress)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className="flex h-full items-center justify-between px-4 max-w-5xl mx-auto">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <ShieldLogo size={32} />
            <span className="hidden sm:block font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              ABST
            </span>
          </Link>
        </div>

        {/* Center: Breadcrumb */}
        {breadcrumb && (
          <nav className="hidden md:flex items-center text-sm text-muted-foreground">
            {breadcrumb.module && (
              <>
                <span>{breadcrumb.module}</span>
                {breadcrumb.lesson && (
                  <>
                    <ChevronRight size={14} className="mx-1 text-border" />
                    <span className="text-foreground font-medium">{breadcrumb.lesson}</span>
                  </>
                )}
              </>
            )}
          </nav>
        )}

        {/* Right: Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showStats && (
            <>
              <div className="hidden sm:block">
                <XPBar
                  xp={progress.xp}
                  level={progress.level}
                  compact
                />
              </div>
              <HeartSystem lives={progress.hearts} size="sm" />
              <StreakCounter streak={progress.streak} size="sm" />
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
