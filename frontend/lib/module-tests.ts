import { promises as fs } from 'node:fs'
import path from 'node:path'

export type ModuleTestKind = 'pretest' | 'posttest'

export type ModuleTestQuestionType = 'true-false' | 'multiple-choice' | 'open'

export interface ModuleTestOption {
  id: string
  text: string
}

export interface ModuleTestQuestion {
  id: string
  number: string
  prompt: string
  type: ModuleTestQuestionType
  options?: ModuleTestOption[]
}

export interface ModuleTest {
  moduleNumber: number
  kind: ModuleTestKind
  title: string
  subtitle: string | null
  questions: ModuleTestQuestion[]
}

function isOptionLine(line: string): boolean {
  return /^\s*-\s+[a-z]\.\s+/i.test(line)
}

function parseOptionLine(line: string): ModuleTestOption | null {
  const match = line.match(/^\s*-\s+([a-z])\.\s+(.+)$/i)
  if (!match) return null
  return {
    id: match[1].toLowerCase(),
    text: match[2].trim(),
  }
}

function classify(promptLines: string[], options: ModuleTestOption[]): ModuleTestQuestionType {
  if (options.length === 0) return 'open'
  const lowered = options.map((option) => option.text.trim().toLowerCase())
  const looksTrueFalse =
    options.length === 2 &&
    lowered.includes('true') &&
    lowered.includes('false')
  if (looksTrueFalse) return 'true-false'
  return 'multiple-choice'
}

function parseTestMarkdown(source: string, moduleNumber: number, kind: ModuleTestKind): ModuleTest {
  const lines = source.split(/\r?\n/)
  let title = `Module ${moduleNumber} ${kind === 'pretest' ? 'Pre-Test' : 'Post-Test'}`
  let subtitle: string | null = null

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)$/)
    if (headingMatch) {
      title = headingMatch[1].trim()
      continue
    }
    const subtitleMatch = line.match(/^\s*\*([^*]+)\*\s*$/)
    if (subtitleMatch && !subtitle) {
      subtitle = subtitleMatch[1].trim()
      break
    }
  }

  const questions: ModuleTestQuestion[] = []
  let currentNumber: string | null = null
  let currentPromptLines: string[] = []
  let currentOptions: ModuleTestOption[] = []

  const flushQuestion = () => {
    if (currentNumber === null) return
    const promptText = currentPromptLines.join(' ').replace(/\s+/g, ' ').trim()
    if (!promptText) {
      currentNumber = null
      currentPromptLines = []
      currentOptions = []
      return
    }
    const type = classify(currentPromptLines, currentOptions)
    questions.push({
      id: `q-${kind}-${moduleNumber}-${currentNumber}`,
      number: currentNumber,
      prompt: promptText,
      type,
      options: type === 'open' ? undefined : currentOptions,
    })
    currentNumber = null
    currentPromptLines = []
    currentOptions = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (line.startsWith('# ')) continue
    if (/^\s*\*[^*]+\*\s*$/.test(line)) continue

    const questionMatch = line.match(/^\*\*(\d+)\.\*\*\s*(.*)$/)
    if (questionMatch) {
      flushQuestion()
      currentNumber = questionMatch[1]
      const initial = questionMatch[2]?.trim()
      currentPromptLines = initial ? [initial] : []
      currentOptions = []
      continue
    }

    if (currentNumber === null) continue

    if (isOptionLine(line)) {
      const option = parseOptionLine(line)
      if (option) currentOptions.push(option)
      continue
    }

    if (line.trim().length > 0) {
      currentPromptLines.push(line.trim())
    }
  }

  flushQuestion()

  return {
    moduleNumber,
    kind,
    title,
    subtitle,
    questions,
  }
}

export async function loadModuleTest(
  moduleNumber: number,
  kind: ModuleTestKind
): Promise<ModuleTest | null> {
  const filesRoot = path.join(process.cwd(), '..', 'files', 'tests')
  const fileName = `module_${moduleNumber}_${kind}.md`
  const fullPath = path.join(filesRoot, fileName)

  try {
    const source = await fs.readFile(fullPath, 'utf8')
    return parseTestMarkdown(source, moduleNumber, kind)
  } catch {
    return null
  }
}
