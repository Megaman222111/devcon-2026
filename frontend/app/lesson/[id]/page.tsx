import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { LessonSectionViewer } from '@/components/lesson/lesson-section-viewer'
import { lessonsForModule } from '@/lib/mock-data'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

async function resolveLessonMarkdownPath(id: string) {
  const lessonMeta = Object.values(lessonsForModule).flat().find((lesson) => lesson.id === id)
  if (!lessonMeta) return null

  const moduleNumber = lessonMeta.moduleId.replace('mod-', '')
  const filesRoot = path.join(process.cwd(), '..', 'files')
  const moduleFolder = path.join(filesRoot, `module_${moduleNumber}`)

  try {
    const moduleEntries = await fs.readdir(moduleFolder, { withFileTypes: true })
    const markdownEntry = moduleEntries.find(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name.startsWith(`${lessonMeta.filePrefix}_`)
    )
    if (markdownEntry) {
      return path.join(moduleFolder, markdownEntry.name)
    }
  } catch {
    return null
  }

  return null
}

async function loadLessonMarkdown(id: string, fallbackTitle: string, fallbackModuleLabel: string) {
  const absolutePath = await resolveLessonMarkdownPath(id)
  if (!absolutePath) {
    return {
      title: fallbackTitle || 'Lesson Coming Soon',
      moduleLabel: fallbackModuleLabel,
      sections: [
        {
          heading: 'Lesson Coming Soon',
          markdown: 'This lesson will be added in a future update.',
        },
      ],
    }
  }

  const source = await fs.readFile(absolutePath, 'utf8')
  const parsed = matter(source)
  const frontmatterTitle = typeof parsed.data.title === 'string' ? parsed.data.title : null
  const headingTitle = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null
  const title = frontmatterTitle ?? headingTitle ?? fallbackTitle ?? 'Lesson'
  const sections = splitMarkdownIntoSections(parsed.content)

  return { title, moduleLabel: fallbackModuleLabel, sections }
}

function splitMarkdownIntoSections(markdown: string) {
  const lines = markdown.split('\n')
  const sections: { heading: string; markdown: string }[] = []
  let currentHeading = 'Introduction'
  let currentLines: string[] = []

  const flushSection = () => {
    if (currentLines.join('\n').trim().length === 0) return
    sections.push({
      heading: currentHeading,
      markdown: currentLines.join('\n').trim(),
    })
  }

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/)
    if (match) {
      flushSection()
      currentHeading = match[1].trim()
      currentLines = []
      continue
    }
    if (line.startsWith('# ')) continue
    currentLines.push(line)
  }
  flushSection()

  if (sections.length === 0) {
    return [{ heading: titleCaseFallback(markdown), markdown }]
  }

  return sections
}

function titleCaseFallback(markdown: string) {
  const firstLine = markdown.split('\n').find((line) => line.trim().length > 0)
  if (!firstLine) return 'Lesson'
  return firstLine.replace(/^#+\s*/, '').trim() || 'Lesson'
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const lessonMeta = Object.values(lessonsForModule).flat().find((lesson) => lesson.id === id)
  const moduleLabel = lessonMeta ? `Module ${lessonMeta.moduleId.replace('mod-', '')}` : 'Module'
  const lesson = await loadLessonMarkdown(id, lessonMeta?.title ?? 'Lesson', moduleLabel)

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: lesson.title }}>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        {lessonMeta && (
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            Lesson {lessonMeta.number}
          </div>
        )}

        <LessonSectionViewer
          lessonId={id}
          lessonTitle={lesson.title}
          moduleLabel={lesson.moduleLabel}
          sections={lesson.sections}
        />
      </div>
    </AppShell>
  )
}
