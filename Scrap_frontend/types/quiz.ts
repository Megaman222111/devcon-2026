export type TranslationMode = 'keywords' | 'ondemand' | 'none'

export interface QuizOption {
  id: string
  text: string
}

interface QuestionBase {
  id: string
  explanation: string
  reference: string
  topicLabel: string
  hint?: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'mcq'
  question: string
  options: QuizOption[]
  correctOptionId: string
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false'
  statement: string
  correct: 'true' | 'false'
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill-blank'
  prompt: string
  acceptableAnswers: string[]
  placeholder?: string
}

export interface ScenarioMCQQuestion extends QuestionBase {
  type: 'scenario-mcq'
  question: string
  scenario: string
  options: QuizOption[]
  correctOptionId: string
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching'
  instruction: string
  pairs: {
    id: string
    term: string
    definition: string
  }[]
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ScenarioMCQQuestion
  | MatchingQuestion

export interface QuizConfig {
  mode: 'lesson' | 'exam'
  passingScore: number
  heartsEnabled: boolean
  timeLimitSeconds?: number
  showImmediateFeedback: boolean
}

export interface QuizAnswerRecord {
  questionId: string
  answerId: string
  correct: boolean
}

export interface QuizResult {
  score: number
  passed: boolean
  xpTotal: number
  heartsUsed: number
  correctCount: number
  totalQuestions: number
  answers: QuizAnswerRecord[]
  weakTopics: string[]
}
