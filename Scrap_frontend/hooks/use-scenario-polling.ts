'use client'

import { useEffect, useState } from 'react'

type ScenarioPollingState =
  | { status: 'pending' }
  | { status: 'ready'; imageUrl: string }
  | { status: 'failed'; reason: string }

export function useScenarioPolling(scenarioId: string, jobId: string, imageUrl: string) {
  const [state, setState] = useState<ScenarioPollingState>({ status: 'pending' })

  useEffect(() => {
    let elapsed = 0
    const interval = window.setInterval(() => {
      elapsed += 1500
      if (elapsed >= 4500) {
        setState({ status: 'ready', imageUrl })
        window.clearInterval(interval)
      } else if (elapsed >= 15000) {
        setState({ status: 'failed', reason: `Scenario ${scenarioId} timed out for ${jobId}.` })
        window.clearInterval(interval)
      }
    }, 1500)

    return () => window.clearInterval(interval)
  }, [scenarioId, jobId, imageUrl])

  return state
}
