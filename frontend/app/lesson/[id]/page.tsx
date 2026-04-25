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

  const moduleNumber = lessonMeta.number.split('.')[0]
  const lessonNumber = lessonMeta.number
  const filesRoot = path.join(process.cwd(), '..', 'files')
  const moduleFolder = path.join(filesRoot, `module-${moduleNumber}`)

  try {
    const moduleEntries = await fs.readdir(moduleFolder, { withFileTypes: true })
    const markdownEntry = moduleEntries.find(
      (entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name.startsWith(`${lessonNumber}-`)
    )
    if (markdownEntry) {
      return path.join(moduleFolder, markdownEntry.name)
    }
  } catch {
    // Fall back to legacy root structure if module folder is unavailable.
  }

  try {
    const rootEntries = await fs.readdir(filesRoot, { withFileTypes: true })
    const markdownEntry = rootEntries.find(
      (entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name.startsWith(`${lessonNumber}-`)
    )
    if (markdownEntry) {
      return path.join(filesRoot, markdownEntry.name)
    }
  } catch {
    return null
  }

  return null
}

async function loadLessonMarkdown(id: string) {
  const absolutePath = await resolveLessonMarkdownPath(id)
  if (!absolutePath) {
    return {
      title: 'Lesson Coming Soon',
      moduleLabel: 'Module',
      sections: [{ heading: 'Lesson Coming Soon', markdown: 'This lesson will be added in a future update.' }],
    }
  }

  const source = await fs.readFile(absolutePath, 'utf8')
  const parsed = matter(source)
  const title = typeof parsed.data.title === 'string' ? parsed.data.title : 'Lesson'
  const moduleNumber = parsed.data.module
  const moduleLabel = Number.isInteger(moduleNumber) ? `Module ${moduleNumber}` : 'Module'
  const sections = splitMarkdownIntoSections(parsed.content)

  return { title, moduleLabel, sections }
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
  const lesson = await loadLessonMarkdown(id)

  return (
    <AppShell showBottomNav={false} breadcrumb={{ module: lesson.moduleLabel, lesson: lesson.title }}>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        <div>
          <div className="text-sm text-amber-500 font-semibold mb-2">LESSON {lessonMeta?.number ?? 'TBD'}</div>
          <LessonSectionViewer lessonId={id} sections={lesson.sections} />
        </div>

      </div>
    </AppShell>
  )
}
