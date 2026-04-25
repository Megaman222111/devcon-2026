'use client'

import Link from 'next/link'
import { Shield, Lock, CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ExamCardProps {
  moduleId: string
  moduleNumber: number
  questionsCount: number
  passingScore: number
  locked: boolean
  passed?: boolean
  score?: number
  className?: string
}

export function ExamCard({
  moduleId,
  moduleNumber,
  questionsCount,
  passingScore,
  locked,
  passed = false,
  score,
  className,
}: ExamCardProps) {
  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 transition-all p-5',
        locked
          ? 'bg-muted/50 border-border cursor-not-allowed opacity-60'
          : passed
          ? 'bg-primary/5 border-primary cursor-pointer hover:bg-primary/10'
          : 'bg-[#8B5CF6]/5 border-[#8B5CF6] cursor-pointer hover:bg-[#8B5CF6]/10',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-xl',
            locked
              ? 'bg-muted'
              : passed
              ? 'bg-primary'
              : 'bg-[#8B5CF6]'
          )}
        >
          {locked ? (
            <Lock size={24} className="text-muted-foreground" />
          ) : passed ? (
            <CheckCircle2 size={24} className="text-white" />
          ) : (
            <Shield size={24} className="text-white" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-bold text-lg',
                locked ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              Unit {moduleNumber} Exam
            </h4>
            {passed && (
              <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-full uppercase">
                Passed
              </span>
            )}
          </div>
          <p className={cn('text-sm mt-0.5', locked ? 'text-muted-foreground' : 'text-muted-foreground')}>
            {questionsCount} questions · {passingScore}% to pass
            {passed && score && ` · Score: ${score}%`}
          </p>
        </div>

        {!locked && !passed && (
          <ChevronRight size={20} className="text-[#8B5CF6]" />
        )}
        {passed && (
          <span className="text-2xl">🏆</span>
        )}
      </div>
    </div>
  )

  if (locked) {
    return content
  }

  return (
    <Link href={`/module/${moduleId}/exam`}>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        {content}
      </motion.div>
    </Link>
  )
}
