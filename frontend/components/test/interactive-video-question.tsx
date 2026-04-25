'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VideoCheckpoint } from '@/lib/module-tests'

interface InteractiveVideoQuestionProps {
  videoSrc: string
  poster?: string
  checkpoints: VideoCheckpoint[]
}

type Feedback = null | { kind: 'correct' } | { kind: 'incorrect'; rewindTo: number }

const FEEDBACK_DELAY_MS = 1400

export function InteractiveVideoQuestion({
  videoSrc,
  poster,
  checkpoints,
}: InteractiveVideoQuestionProps) {
  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.timeSeconds - b.timeSeconds),
    [checkpoints]
  )

  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  // Use refs inside listeners so we always read the latest state.
  const activeIndexRef = useRef<number | null>(null)
  const completedRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])
  useEffect(() => {
    completedRef.current = completed
  }, [completed])

  // Last checkpoint the user has cleared — rewind target on a wrong answer.
  const lastClearedTime = useMemo(() => {
    let max = 0
    for (const cp of sortedCheckpoints) {
      if (completed.has(cp.id) && cp.timeSeconds > max) {
        max = cp.timeSeconds
      }
    }
    return max
  }, [completed, sortedCheckpoints])

  const allCleared =
    sortedCheckpoints.length > 0 && sortedCheckpoints.every((cp) => completed.has(cp.id))

  // Watch playback for checkpoint hits + prevent seeking past unanswered checkpoints.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const findNextUnclearedAt = (time: number) => {
      for (let i = 0; i < sortedCheckpoints.length; i++) {
        const cp = sortedCheckpoints[i]
        if (completedRef.current.has(cp.id)) continue
        if (time + 0.05 >= cp.timeSeconds) return i
      }
      return null
    }

    const handleTimeUpdate = () => {
      if (activeIndexRef.current !== null) return
      const idx = findNextUnclearedAt(video.currentTime)
      if (idx === null) return
      const cp = sortedCheckpoints[idx]
      video.pause()
      video.currentTime = cp.timeSeconds
      setActiveIndex(idx)
      setSelected(null)
      setFeedback(null)
    }

    const handleSeeking = () => {
      // Block seeking past an unanswered checkpoint.
      for (const cp of sortedCheckpoints) {
        if (completedRef.current.has(cp.id)) continue
        if (video.currentTime > cp.timeSeconds) {
          video.currentTime = cp.timeSeconds
          break
        }
      }
    }

    const handleError = () => {
      setVideoError('Video failed to load.')
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('error', handleError)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('error', handleError)
    }
  }, [sortedCheckpoints])

  // Apply pending feedback resolution (resume or rewind) after the user sees the result.
  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => {
      const video = videoRef.current
      if (!video) return
      if (feedback.kind === 'incorrect') {
        video.currentTime = feedback.rewindTo
      }
      setActiveIndex(null)
      setSelected(null)
      setFeedback(null)
      void video.play()
    }, FEEDBACK_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const activeCheckpoint = activeIndex !== null ? sortedCheckpoints[activeIndex] : null

  const handleSelect = (optionId: string) => {
    if (feedback) return
    setSelected(optionId)
  }

  const handleSubmit = () => {
    if (!activeCheckpoint || !selected || feedback) return
    if (selected === activeCheckpoint.correctId) {
      setCompleted((prev) => {
        const next = new Set(prev)
        next.add(activeCheckpoint.id)
        return next
      })
      setFeedback({ kind: 'correct' })
    } else {
      setFeedback({ kind: 'incorrect', rewindTo: lastClearedTime })
    }
  }

  const handleRetake = () => {
    const video = videoRef.current
    if (!video) return
    setCompleted(new Set())
    setActiveIndex(null)
    setSelected(null)
    setFeedback(null)
    video.currentTime = 0
    void video.play()
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-900/80 bg-black shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          // Hide native controls while a question is up, so the user can't skip ahead.
          controls={!activeCheckpoint && !feedback}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          onPlay={() => setHasStarted(true)}
          className="aspect-video w-full bg-black"
        />

        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-rose-300">
            {videoError}
            <br />
            Drop the source file at the path referenced by <code className="font-mono">videoSrc</code>.
          </div>
        )}

        <AnimatePresence>
          {activeCheckpoint && !videoError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex flex-col items-stretch bg-gradient-to-b from-black/85 via-black/55 to-black/30 px-4 pt-4 sm:px-6 sm:pt-6"
            >
              <motion.div
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/95 p-4 shadow-2xl shadow-black/40 backdrop-blur dark:bg-slate-900/95 sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
                    Checkpoint · {formatTime(activeCheckpoint.timeSeconds)}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {completed.size + 1} / {sortedCheckpoints.length}
                  </div>
                </div>
                <div className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-white sm:text-lg">
                  {activeCheckpoint.prompt}
                </div>

                <div className="mt-3 grid gap-2">
                  {activeCheckpoint.options.map((option) => {
                    const isSelected = selected === option.id
                    const showCorrect = feedback?.kind === 'correct' && option.id === activeCheckpoint.correctId
                    const showIncorrect = feedback?.kind === 'incorrect' && isSelected
                    const showCorrectHint =
                      feedback?.kind === 'incorrect' && option.id === activeCheckpoint.correctId
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option.id)}
                        disabled={!!feedback}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all',
                          showCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15',
                          showIncorrect && 'border-rose-500 bg-rose-50 dark:bg-rose-500/15',
                          showCorrectHint && 'border-emerald-400/70 bg-emerald-50/70 dark:bg-emerald-500/10',
                          !showCorrect && !showIncorrect && !showCorrectHint && isSelected &&
                            'border-amber-500 bg-amber-100 dark:bg-amber-500/15',
                          !showCorrect && !showIncorrect && !showCorrectHint && !isSelected &&
                            'border-slate-300 bg-white hover:border-amber-400 dark:border-slate-700 dark:bg-slate-950'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold uppercase',
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-amber-100 text-amber-700 dark:bg-slate-800 dark:text-amber-300'
                          )}
                        >
                          {option.id}
                        </div>
                        <span className="flex-1 text-slate-900 dark:text-white">{option.text}</span>
                        {showCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                        {showIncorrect && <XCircle size={18} className="text-rose-500" />}
                      </button>
                    )
                  })}
                </div>

                {!feedback && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit answer
                  </button>
                )}

                {feedback?.kind === 'correct' && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    Correct — resuming the video…
                  </div>
                )}

                {feedback?.kind === 'incorrect' && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                    <RotateCcw size={16} />
                    Not quite — rewinding to {formatTime(feedback.rewindTo)}.
                  </div>
                )}

                {activeCheckpoint.explanation && feedback && (
                  <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {activeCheckpoint.explanation}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasStarted && !videoError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 text-xs text-white/80 sm:px-6">
            <div className="rounded-xl bg-black/60 px-3 py-2 backdrop-blur">
              Watch the video — questions appear at each checkpoint and the video pauses until you answer correctly.
            </div>
          </div>
        )}
      </div>

      {allCleared && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-4 py-3 text-sm text-emerald-200">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} />
            All {sortedCheckpoints.length} checkpoints cleared.
          </span>
          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            <RotateCcw size={14} />
            Watch again
          </button>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
