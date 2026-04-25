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

  return {
    ...test,
    questions: [
      ...test.questions,
      {
        id: `q-${test.kind}-${test.moduleNumber}-video-1`,
        number: String(existingCount + 1),
        prompt: 'Video question 1',
        type: 'video',
      },
      {
        id: `q-${test.kind}-${test.moduleNumber}-video-2`,
        number: String(existingCount + 2),
        prompt: 'Video question 2',
        type: 'video',
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
