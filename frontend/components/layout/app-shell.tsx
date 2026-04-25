'use client'

import { cn } from '@/lib/utils'
import { TopNav } from './top-nav'
import { BottomNav } from './bottom-nav'
import { ConfettiEngine } from '@/components/gamification/confetti-engine'
import { ToastProvider } from '@/components/ui/toast-provider'

interface AppShellProps {
  children: React.ReactNode
  showNav?: boolean
  showBottomNav?: boolean
  showStats?: boolean
  breadcrumb?: {
    module?: string
    lesson?: string
  }
  className?: string
  contentClassName?: string
}

export function AppShell({
  children,
  showNav = true,
  showBottomNav = true,
  showStats = true,
  breadcrumb,
  className,
  contentClassName,
}: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {showNav && <TopNav breadcrumb={breadcrumb} showStats={showStats} />}
      <main
        className={cn(
          'flex-1',
          showNav && 'pt-0',
          showBottomNav && 'pb-[72px] md:pb-0',
          contentClassName
        )}
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
      <ConfettiEngine />
      <ToastProvider />
    </div>
  )
}
