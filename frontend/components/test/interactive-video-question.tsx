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
              className="absolute inset-0 flex items-center justify-center bg-black/40 px-3 py-3 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ y: -8, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -8, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-900/85 p-3 text-white shadow-xl shadow-black/30 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300">
                    Checkpoint · {formatTime(activeCheckpoint.timeSeconds)}
                  </div>
                  <div className="text-[9px] font-medium text-slate-300">
                    {completed.size + 1} / {sortedCheckpoints.length}
                  </div>
                </div>
                <div className="mt-1.5 text-[13px] font-semibold leading-snug">
                  {activeCheckpoint.prompt}
                </div>

                <div className="mt-2 grid gap-1.5">
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
                          'flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-[12px] leading-snug transition-colors',
                          showCorrect && 'border-emerald-400 bg-emerald-500/20',
                          showIncorrect && 'border-rose-400 bg-rose-500/20',
                          showCorrectHint && 'border-emerald-400/60 bg-emerald-500/10',
                          !showCorrect && !showIncorrect && !showCorrectHint && isSelected &&
                            'border-amber-400 bg-amber-400/20',
                          !showCorrect && !showIncorrect && !showCorrectHint && !isSelected &&
                            'border-white/15 bg-white/5 hover:border-amber-400/60 hover:bg-white/10'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold uppercase',
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 text-amber-200'
                          )}
                        >
                          {option.id}
                        </div>
                        <span className="flex-1">{option.text}</span>
                        {showCorrect && <CheckCircle2 size={14} className="mt-px text-emerald-300" />}
                        {showIncorrect && <XCircle size={14} className="mt-px text-rose-300" />}
                      </button>
                    )
                  })}
                </div>

                {!feedback && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="mt-2 w-full rounded-md bg-amber-400 py-1.5 text-[12px] font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit
                  </button>
                )}

                {feedback?.kind === 'correct' && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                    <CheckCircle2 size={12} />
                    Correct — resuming…
                  </div>
                )}

                {feedback?.kind === 'incorrect' && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2 py-1 text-[11px] font-semibold text-rose-300">
                    <RotateCcw size={12} />
                    Rewinding to {formatTime(feedback.rewindTo)}…
                  </div>
                )}

                {activeCheckpoint.explanation && feedback && (
                  <div className="mt-1.5 text-[11px] leading-snug text-slate-300">
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
