'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type Toast } from '@/lib/store'

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  'xp-gain': Star,
}

const colorMap = {
  success: 'border-l-emerald-500 bg-navy-800',
  error: 'border-l-red-500 bg-navy-800',
  info: 'border-l-amber-500 bg-navy-800',
  'xp-gain': 'bg-amber-500/90 border-l-amber-300',
}

const iconColorMap = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-amber-500',
  'xp-gain': 'text-navy-900 fill-navy-900',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useAppStore((state) => state.removeToast)
  const Icon = iconMap[toast.type]
  const duration = toast.duration ?? 3000

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id)
    }, duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, removeToast])

  const isXPToast = toast.type === 'xp-gain'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg min-w-[280px] max-w-[400px]',
        colorMap[toast.type]
      )}
    >
      <Icon size={20} className={iconColorMap[toast.type]} />
      <p
        className={cn(
          'flex-1 text-sm font-medium',
          isXPToast ? 'text-navy-900 font-display font-bold' : 'text-white'
        )}
      >
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className={cn(
          'p-1 rounded hover:bg-white/10 transition-colors',
          isXPToast ? 'text-navy-900/70' : 'text-navy-400'
        )}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastProvider() {
  const toasts = useAppStore((state) => state.ui.toasts)

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
