'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { ScenarioLoader } from '@/components/scenario/scenario-loader'
import { ScenarioPlayer } from '@/components/scenario/scenario-player'
import { ScenarioErrorState } from '@/components/scenario/scenario-error-state'
import { getLessonContent, getScenarioForLesson } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'

export default function ScenarioPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const addXP = useAppStore((state) => state.addXP)
  const addToast = useAppStore((state) => state.addToast)
  const completeScenario = useAppStore((state) => state.completeScenario)
  const markScenarioSkipped = useAppStore((state) => state.markScenarioSkipped)
  const skipScenario = useAppStore((state) => state.skipScenario)

  const lesson = getLessonContent(params.id)
  const scenario = getScenarioForLesson(params.id)
  const [loaded, setLoaded] = useState(false)

  const finish = () => {
    router.push(
      `/lesson/${params.id}/results?correct=${searchParams.get('correct') ?? 0}&total=${searchParams.get('total') ?? 0}`
    )
  }

  if (!scenario) {
    return (
      <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: 'Scenario' }}>
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24">
          <ScenarioErrorState showSkipOnly onRetry={() => undefined} onSkip={finish} />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: 'Scenario' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
        {!loaded ? (
          <ScenarioLoader
            scenarioId={scenario.id}
            imageUrl={scenario.imageUrl}
            onLoaded={() => setLoaded(true)}
          />
        ) : (
          <ScenarioPlayer
            scenario={scenario}
            onComplete={(correct) => {
              if (correct) addXP(15)
              completeScenario()
              finish()
            }}
            onSkip={() => {
              skipScenario()
              markScenarioSkipped(scenario.id)
              addToast({ type: 'info', message: 'Scenario skipped - no XP awarded for this one' })
              finish()
            }}
          />
        )}
      </div>
    </AppShell>
  )
}
