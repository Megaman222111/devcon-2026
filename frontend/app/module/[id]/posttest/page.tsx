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
        prompt: 'Watch the scenario and answer the checkpoint questions as they appear.',
        type: 'video',
        videoSrc: `/files/videos/module_${moduleNumber}_q1.mp4`,
        checkpoints: [
          {
            id: `q-${test.kind}-${moduleNumber}-v1-cp1`,
            timeSeconds: 12,
            prompt: 'At this point in the scenario, what is the security professional\'s primary responsibility?',
            options: [
              { id: 'a', text: 'Detain the individual immediately.' },
              { id: 'b', text: 'Observe and accurately document what is happening.' },
              { id: 'c', text: 'Use force to control the situation.' },
              { id: 'd', text: 'Ignore the incident until a supervisor arrives.' },
            ],
            correctId: 'b',
            explanation:
              'A security professional\'s first duty is observation and accurate reporting — escalation only happens when warranted.',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v1-cp2`,
            timeSeconds: 32,
            prompt: 'Which authority lets the security professional take this action?',
            options: [
              { id: 'a', text: 'The Criminal Code, s. 494 (citizen\'s arrest).' },
              { id: 'b', text: 'The Charter of Rights and Freedoms.' },
              { id: 'c', text: 'Provincial trespass legislation.' },
              { id: 'd', text: 'Their personal judgment alone.' },
            ],
            correctId: 'a',
          },
        ],
      },
      {
        id: `q-${test.kind}-${moduleNumber}-video-2`,
        number: String(existingCount + 2),
        prompt: 'Watch the second scenario and respond at each checkpoint.',
        type: 'video',
        videoSrc: `/files/videos/module_${moduleNumber}_q2.mp4`,
        checkpoints: [
          {
            id: `q-${test.kind}-${moduleNumber}-v2-cp1`,
            timeSeconds: 10,
            prompt: 'What should the officer say first when initiating an arrest?',
            options: [
              { id: 'a', text: 'Nothing — silence avoids escalation.' },
              { id: 'b', text: 'The reason for the arrest, clearly and calmly.' },
              { id: 'c', text: 'A demand for identification.' },
              { id: 'd', text: 'A threat of force.' },
            ],
            correctId: 'b',
            explanation:
              'The person being detained has a Charter right to be informed promptly of the reason for arrest.',
          },
          {
            id: `q-${test.kind}-${moduleNumber}-v2-cp2`,
            timeSeconds: 28,
            prompt: 'If the officer is unsure they have lawful authority, the safest action is to:',
            options: [
              { id: 'a', text: 'Proceed and resolve concerns later.' },
              { id: 'b', text: 'Pause and consult a supervisor or police.' },
              { id: 'c', text: 'Use minimum force to detain anyway.' },
              { id: 'd', text: 'Walk away and never report the incident.' },
            ],
            correctId: 'b',
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
