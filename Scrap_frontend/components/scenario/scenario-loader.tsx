'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { useScenarioPolling } from '@/hooks/use-scenario-polling'

interface ScenarioLoaderProps {
  scenarioId: string
  imageUrl: string
  onLoaded: () => void
}

const loadingMessages = [
  'Setting the scene...',
  'Placing the guard on duty...',
  'Building the environment...',
  'Almost ready...',
]

export function ScenarioLoader({
  scenarioId,
  imageUrl,
  onLoaded,
}: ScenarioLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(18)
  const jobId = useMemo(() => `job-${scenarioId}`, [scenarioId])
  const pollState = useScenarioPolling(scenarioId, jobId, imageUrl)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % loadingMessages.length)
      setProgress((value) => Math.min(value + 18, 82))
    }, 2000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (pollState.status !== 'ready') return
    const image = new Image()
    image.onload = () => {
      setProgress(100)
      window.setTimeout(onLoaded, 250)
    }
    image.src = pollState.imageUrl
  }, [onLoaded, pollState])

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-700 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="aspect-video animate-pulse rounded-[24px] border border-slate-700 bg-slate-900" />
      <div className="mt-6 rounded-[24px] border border-slate-700 bg-slate-900 p-6 text-center">
        <div className="text-5xl">🎬</div>
        <h1 className="mt-4 text-xl font-semibold text-white">Generating your scenario...</h1>
        <p className="mt-2 text-slate-400">{loadingMessages[messageIndex]}</p>
        <div className="mt-6">
          <ProgressBar value={progress} color="gold" height="sm" />
        </div>
        {progress > 80 && <p className="mt-4 text-sm text-slate-500">This is taking a moment — almost there.</p>}
      </div>
    </div>
  )
}
