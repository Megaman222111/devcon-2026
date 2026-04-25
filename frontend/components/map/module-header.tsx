'use client'

import { Lock, Clock, BookOpen, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/gamification/progress-bar'

export interface ModuleData {
  id: string
  number: number
  title: string
  lessonsCount: number
  completedLessons: number
  scenariosCount: number
  estimatedMinutes: number
  locked: boolean
}

interface ModuleHeaderProps {
  module: ModuleData
  className?: string
}

export function ModuleHeader({ module, className }: ModuleHeaderProps) {
  const progress = module.completedLessons / module.lessonsCount * 100
  const isComplete = progress === 100

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 transition-all',
        module.locked
          ? 'bg-muted/50 border-border opacity-60'
          : isComplete
          ? 'bg-primary/5 border-primary'
          : 'bg-card border-border shadow-md',
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl',
                module.locked
                  ? 'bg-muted'
                  : isComplete
                  ? 'bg-primary'
                  : 'bg-[#1CB0F6]'
              )}
            >
              {module.locked ? (
                <Lock size={22} className="text-muted-foreground" />
              ) : isComplete ? (
                <span className="text-xl">✓</span>
              ) : (
                <Play size={22} className="text-white" fill="white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-bold text-sm uppercase tracking-wide',
                    module.locked ? 'text-muted-foreground' : 'text-muted-foreground'
                  )}
                >
                  Unit {module.number}
                </span>
              </div>
              <h3
                className={cn(
                  'text-lg font-bold mt-0.5',
                  module.locked ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {module.title}
              </h3>
            </div>
          </div>
        </div>

        {!module.locked && (
          <>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{module.estimatedMinutes} min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} />
                <span>{module.lessonsCount} lessons</span>
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar
                value={module.completedLessons}
                max={module.lessonsCount}
                height="md"
                color={isComplete ? 'green' : 'blue'}
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  {module.completedLessons}/{module.lessonsCount} complete
                </span>
                <span
                  className={cn(
                    'font-bold',
                    isComplete ? 'text-primary' : 'text-[#1CB0F6]'
                  )}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </>
        )}

        {module.locked && (
          <p className="mt-3 text-sm text-muted-foreground">
            Complete the previous module exam to unlock
          </p>
        )}
      </div>
    </div>
  )
}
