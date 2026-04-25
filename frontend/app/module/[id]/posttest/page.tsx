import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { ModuleTestRunner } from '@/components/test/module-test-runner'
import type { ModuleTest } from '@/lib/module-tests'
import { loadModuleTest } from '@/lib/module-tests'
import { modules } from '@/lib/mock-data'

interface PosttestPageProps {
  params: Promise<{ id: string }>
}

function withVideoQuestions(test: ModuleTest): ModuleTest {
  const existingCount = test.questions.length
  const moduleNumber = test.moduleNumber

  return {
    ...test,
    questions: [
      ...test.questions,
      {
        id: `q-${test.kind}-${moduleNumber}-video-1`,
        number: String(existingCount + 1),
        prompt: 'Use of Force — agitated man shouting at staff in a mall. Watch and answer at each checkpoint.',
        type: 'video',
        videoSrc: `/files/videos/test.mp4`,
        checkpoints: [
          {
            id: `q-${test.kind}-${moduleNumber}-v1-cp1`,
            timeSeconds: 1,
            prompt:
              'The guard observes the agitated man from a distance before moving in. According to the Alberta Basic Security Training, what are the THREE key things a guard must assess before deciding to use force?',
            options: [
              {
                id: 'a',
                text: 'The time of day, how long the guard has been on shift, and whether the manager has been notified',
              },
              {
                id: 'b',
                text: "The subject's age and fitness, whether a weapon is visible, and the presence of bystanders",
              },
              {
                id: 'c',
                text: "The subject's name, their reason for being upset, and whether they have ID",
              },
            ],
            correctId: 'b',
            explanation:
              'Module 3, page 33 — before using force a guard must assess what they know about the subject (age, fitness, weapons, mental state) and what the situation involves including the safety of nearby persons.',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v1-cp2`,
            timeSeconds: 4,
            prompt:
              'The guard chooses verbal communication over physical intervention. According to the manual, what percentage of situations can be resolved WITHOUT using physical force?',
            options: [
              { id: 'a', text: '50%' },
              { id: 'b', text: '65%' },
              { id: 'c', text: '80%' },
            ],
            correctId: 'c',
            explanation:
              'Module 3, page 32 — the manual states directly: "It is commonly said that 80% of situations can be addressed without using force."',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v1-cp3`,
            timeSeconds: 6,
            prompt:
              'The guard steps in and force becomes necessary to stop the threat. When should the guard STOP using force?',
            options: [
              { id: 'a', text: 'When police arrive on scene' },
              { id: 'b', text: 'When the subject is no longer resisting or using force' },
              { id: 'c', text: 'After the subject has been handcuffed' },
            ],
            correctId: 'b',
            explanation:
              'Module 3, page 34 — the decision flowchart states explicitly: "Stop using force when the subject is no longer resisting or using force."',
          },
        ],
      },
      {
        id: `q-${test.kind}-${moduleNumber}-video-2`,
        number: String(existingCount + 2),
        prompt: 'Bomb Threat — guard receives a phone call in the office lobby. Watch and answer at each checkpoint.',
        type: 'video',
        videoSrc: `/files/videos/test1.mp4`,
        checkpoints: [
          {
            id: `q-${test.kind}-${moduleNumber}-v2-cp1`,
            timeSeconds: 2,
            prompt:
              'The caller says there is a bomb in the building. What is the CORRECT first action the guard should take?',
            options: [
              { id: 'a', text: 'Hang up and immediately dial 911' },
              { id: 'b', text: 'Activate the building PA system to begin evacuation' },
              {
                id: 'c',
                text: 'Stay on the line, remain calm, do not interrupt, and write down everything the caller says',
              },
            ],
            correctId: 'c',
            explanation:
              'Module 6, page 13 — the RCMP guidelines taught in this module state: listen, remain calm, be polite, do not interrupt the caller, and obtain as much information as possible. Hanging up loses critical evidence.',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v2-cp2`,
            timeSeconds: 4,
            prompt:
              'The guard is still on the call and silently passes a note to a passing colleague. What should that note instruct the colleague to do?',
            options: [
              { id: 'a', text: 'Pull the fire alarm to begin evacuating the building' },
              { id: 'b', text: 'Notify a supervisor and request that police be called' },
              { id: 'c', text: 'Search the lobby and mailroom for suspicious packages' },
            ],
            correctId: 'b',
            explanation:
              'Module 6, page 13 — while still on the call, the RCMP guidelines say to "notify your partner or supervisor of the call and request the police be called" — done silently so the caller is not tipped off.',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v2-cp3`,
            timeSeconds: 7,
            prompt:
              'The call ends. The guard is now wondering whether to search the building or evacuate. According to Module 6, who is responsible for making that decision?',
            options: [
              { id: 'a', text: 'The security guard, based on their own threat assessment' },
              { id: 'b', text: 'The most senior person currently in the building' },
              { id: 'c', text: 'Someone other than the guard — a supervisor or police' },
            ],
            correctId: 'c',
            explanation:
              'Module 6, page 15 — the manual is clear: "A decision whether or not to ignore the threat, search for the threat, or evacuate the premises must come from someone other than yourself."',
          },
        ],
      },
    ],
  }
}

export default async function ModulePosttestPage({ params }: PosttestPageProps) {
  const { id } = await params
  const moduleMeta = modules.find((module) => module.id === id)
  const moduleNumber = moduleMeta?.number ?? Number(id.replace('mod-', '')) ?? 0
  const loadedTest = await loadModuleTest(moduleNumber, 'posttest')
  const test = loadedTest ? withVideoQuestions(loadedTest) : null

  return (
    <AppShell
      showBottomNav={false}
      breadcrumb={{ module: `Module ${moduleNumber}`, lesson: 'Post-Test' }}
    >
      <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        {test ? (
          <ModuleTestRunner test={test} moduleId={id} backHref="/home" />
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
            <p>No post-test markdown found for module {moduleNumber}.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Expected file: <code>files/tests/module_{moduleNumber}_posttest.md</code>
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
