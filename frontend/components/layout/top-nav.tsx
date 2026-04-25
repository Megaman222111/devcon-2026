'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { XPBar } from '@/components/gamification/xp-bar'
import { HeartSystem } from '@/components/gamification/heart-system'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { useAppStore } from '@/lib/store'
import { ChevronRight, Plus, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const buyHearts = useAppStore((state) => state.buyHearts)
  const addToast = useAppStore((state) => state.addToast)

  const handleBuyHearts = (heartsToBuy: number, energyCost: number) => {
    const purchased = buyHearts(heartsToBuy, energyCost)
    if (!purchased) {
      addToast({
        type: 'error',
        message: `Not enough lightning. You need ${energyCost}, but have ${progress.xp}.`,
      })
    }
  }

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
              TrainSecureAI
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus size={12} />
                    <span className="hidden sm:inline">Buy</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Buy Lives</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleBuyHearts(1, 20)}>
                    +1 life
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600">
                      <Zap size={12} className="fill-amber-500 text-amber-500" />
                      20
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleBuyHearts(3, 55)}>
                    +3 lives
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600">
                      <Zap size={12} className="fill-amber-500 text-amber-500" />
                      55
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Lightning: {progress.xp}
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
              <StreakCounter streak={progress.streak} size="sm" />
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
