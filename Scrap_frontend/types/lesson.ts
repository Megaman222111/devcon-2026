import type { LanguageCode } from '@/data/languages'

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | DefinitionBlock
  | ListBlock
  | CalloutBlock
  | LegalReferenceBlock
  | ImageBlock
  | DividerBlock

interface BlockBase {
  id?: string
  topicTags?: string[]
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  id: string
  level: 2 | 3
  text: string
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph'
  id: string
  text: string
  keywordRefs: string[]
}

export interface DefinitionBlock extends BlockBase {
  type: 'definition'
  id: string
  term: string
  definition: string
}

export interface ListBlock extends BlockBase {
  type: 'list'
  id: string
  style: 'bullet' | 'numbered'
  items: string[]
}

export interface CalloutBlock extends BlockBase {
  type: 'callout'
  id: string
  variant: 'info' | 'warning' | 'tip' | 'legal'
  title?: string
  text: string
}

export interface LegalReferenceBlock extends BlockBase {
  type: 'legal'
  id: string
  code: string
  text: string
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  id: string
  src: string
  alt: string
  caption?: string
}

export interface DividerBlock extends BlockBase {
  type: 'divider'
}

export interface KeyTerm {
  id: string
  english: string
  translated: string
  nativeScript?: string
  audioUrl?: string
  paragraphIds: string[]
  translations?: Partial<Record<LanguageCode, string>>
}

export interface LessonContent {
  id: string
  moduleId: string
  title: string
  moduleLabel: string
  lessonLabel: string
  estimatedMinutes: number
  totalSections: number
  blocks: ContentBlock[]
  keyTerms: KeyTerm[]
}
