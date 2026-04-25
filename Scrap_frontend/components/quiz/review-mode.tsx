'use client'

interface ReviewModeProps {
  topics: string[]
}

export function ReviewMode({ topics }: ReviewModeProps) {
  if (!topics.length) return null

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
      <span className="font-semibold uppercase tracking-[0.18em]">Review Mode</span>
      <p className="mt-1 leading-6">
        Focus on: {topics.join(', ')}. These topics appeared in your missed questions.
      </p>
    </div>
  )
}
