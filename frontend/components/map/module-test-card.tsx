'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ClipboardCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleTestCardProps {
  moduleId: string
  moduleNumber: number
  kind: 'pretest' | 'posttest'
  className?: string
}

const COPY = {
  pretest: {
    label: 'Pre-Test',
    description: 'Check what you already know before starting the lessons.',
    accent: 'from-amber-400 to-amber-500',
    iconColor: 'text-slate-950',
    pillBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  posttest: {
    label: 'Post-Test',
    description: 'Reflect on what you learned and reinforce the key ideas.',
    accent: 'from-emerald-400 to-emerald-500',
    iconColor: 'text-slate-950',
    pillBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
} as const

export function ModuleTestCard({
  moduleId,
  moduleNumber,
  kind,
  className,
}: ModuleTestCardProps) {
  const copy = COPY[kind]
  const Icon = kind === 'pretest' ? Sparkles : ClipboardCheck
  const href = `/module/${moduleId}/${kind}`

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-amber-400',
          className
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md',
            copy.accent
          )}
        >
          <Icon size={22} className={copy.iconColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', copy.pillBg)}>
              Module {moduleNumber}
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{copy.label}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {copy.description}
          </p>
        </div>
        <ChevronRight size={18} className="text-slate-400" />
      </motion.div>
    </Link>
  )
}
