import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_LANGUAGE_CODE,
  getLanguageByCode,
  isLanguageRTL,
  type LanguageCode,
} from '@/data/languages'
import type { TranslationMode } from '@/types/quiz'

export type { LanguageCode } from '@/data/languages'
export type { TranslationMode } from '@/types/quiz'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'xp-gain'
  message: string
  duration?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: string
}

export interface UserLanguagePreferences {
  language: LanguageCode
  translationMode: TranslationMode
  rtl: boolean
  awsTranslateCode: string
}

interface User {
  id: string
  name: string
  email: string
  language: LanguageCode
  translationMode: TranslationMode
  languagePrefs: UserLanguagePreferences
  avatarUrl?: string
}

interface Progress {
  xp: number
  level: number
  streak: number
  lastActiveDate: string | null
  hearts: number
  maxHearts: number
  heartsRefillAt: string | null
  completedLessons: string[]
  completedModules: string[]
  badges: string[]
  weakTopics: string[]
  reviewMode: {
    lessonId: string | null
    topicLabels: string[]
  } | null
  skippedScenarioIds: string[]
}

interface LessonSession {
  lessonId: string | null
  currentQuestionIndex: number
  answers: Record<string, string>
  correctCount: number
  scenarioAnswered: boolean
  scenarioState: {
    scenarioId: string | null
    jobId: string | null
    imageUrl: string | null
    answered: boolean
    skipped: boolean
  } | null
}

interface ExamSession {
  moduleId: string | null
  answers: Record<string, string>
  flagged: string[]
  timeRemaining: number
  submitted: boolean
}

interface UIState {
  toasts: Toast[]
  isLoading: boolean
  showConfetti: boolean
}

interface AppState {
  user: User | null
  setUser: (user: Partial<User> | null) => void
  updateUserLanguage: (language: LanguageCode) => void
  updateTranslationMode: (mode: TranslationMode) => void
  updateLanguagePrefs: (prefs: Partial<UserLanguagePreferences>) => void

  progress: Progress
  addXP: (amount: number) => void
  loseHeart: () => void
  refillHearts: () => void
  markLessonComplete: (lessonId: string) => void
  markModuleComplete: (moduleId: string) => void
  earnBadge: (badgeId: string) => void
  incrementStreak: () => void
  resetStreak: () => void
  setWeakTopics: (topics: string[]) => void
  setReviewMode: (lessonId: string, topicLabels: string[]) => void
  clearReviewMode: () => void
  markScenarioSkipped: (scenarioId: string) => void

  lessonSession: LessonSession
  startLesson: (lessonId: string) => void
  answerQuestion: (questionId: string, answerId: string, correct: boolean) => void
  nextQuestion: () => void
  completeScenario: () => void
  startScenarioLoad: (scenarioId: string, jobId: string) => void
  setScenarioReady: (imageUrl: string) => void
  skipScenario: () => void
  resetLessonSession: () => void

  examSession: ExamSession
  startExam: (moduleId: string, timeLimit: number) => void
  answerExamQuestion: (questionId: string, answerId: string) => void
  flagQuestion: (questionId: string) => void
  unflagQuestion: (questionId: string) => void
  tickTimer: () => void
  submitExam: () => void
  resetExamSession: () => void

  ui: UIState
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setLoading: (loading: boolean) => void
  triggerConfetti: () => void
  stopConfetti: () => void
}

const XP_PER_LEVEL = 150

const calculateLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1

const buildLanguagePrefs = (
  language: LanguageCode = DEFAULT_LANGUAGE_CODE,
  translationMode: TranslationMode = language === 'en' ? 'none' : 'ondemand'
): UserLanguagePreferences => {
  const match = getLanguageByCode(language)
  return {
    language,
    translationMode,
    rtl: isLanguageRTL(language),
    awsTranslateCode: match.awsCode,
  }
}

const normalizeUser = (user: Partial<User>): User => {
  const baseLanguage = user.languagePrefs?.language ?? user.language ?? DEFAULT_LANGUAGE_CODE
  const baseMode =
    user.languagePrefs?.translationMode ??
    user.translationMode ??
    (baseLanguage === 'en' ? 'none' : 'ondemand')
  const languagePrefs = {
    ...buildLanguagePrefs(baseLanguage, baseMode),
    ...user.languagePrefs,
  }

  return {
    id: user.id ?? Math.random().toString(36).slice(2),
    name: user.name ?? 'Learner',
    email: user.email ?? '',
    avatarUrl: user.avatarUrl,
    language: languagePrefs.language,
    translationMode: languagePrefs.translationMode,
    languagePrefs,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user: user ? normalizeUser(user) : null }),
      updateUserLanguage: (language) =>
        set((state) => ({
          user: state.user
            ? normalizeUser({
                ...state.user,
                language,
                languagePrefs: {
                  ...state.user.languagePrefs,
                  language,
                },
              })
            : null,
        })),
      updateTranslationMode: (mode) =>
        set((state) => ({
          user: state.user
            ? normalizeUser({
                ...state.user,
                translationMode: mode,
                languagePrefs: {
                  ...state.user.languagePrefs,
                  translationMode: mode,
                },
              })
            : null,
        })),
      updateLanguagePrefs: (prefs) =>
        set((state) => ({
          user: state.user
            ? normalizeUser({
                ...state.user,
                languagePrefs: {
                  ...state.user.languagePrefs,
                  ...prefs,
                },
              })
            : null,
        })),

      progress: {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: null,
        hearts: 3,
        maxHearts: 3,
        heartsRefillAt: null,
        completedLessons: [],
        completedModules: [],
        badges: [],
        weakTopics: [],
        reviewMode: null,
        skippedScenarioIds: [],
      },

      addXP: (amount) =>
        set((state) => {
          const newXP = state.progress.xp + amount
          const newLevel = calculateLevel(newXP)
          const leveledUp = newLevel > state.progress.level

          if (leveledUp) {
            get().addToast({
              type: 'success',
              message: `Level Up! You're now Level ${newLevel}!`,
              duration: 4000,
            })
          }

          return {
            progress: {
              ...state.progress,
              xp: newXP,
              level: newLevel,
            },
          }
        }),

      loseHeart: () =>
        set((state) => {
          const newHearts = Math.max(0, state.progress.hearts - 1)
          const heartsRefillAt =
            newHearts === 0 && !state.progress.heartsRefillAt
              ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
              : state.progress.heartsRefillAt

          return {
            progress: {
              ...state.progress,
              hearts: newHearts,
              heartsRefillAt,
            },
          }
        }),

      refillHearts: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            hearts: state.progress.maxHearts,
            heartsRefillAt: null,
          },
        })),

      markLessonComplete: (lessonId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            completedLessons: state.progress.completedLessons.includes(lessonId)
              ? state.progress.completedLessons
              : [...state.progress.completedLessons, lessonId],
          },
        })),

      markModuleComplete: (moduleId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            completedModules: state.progress.completedModules.includes(moduleId)
              ? state.progress.completedModules
              : [...state.progress.completedModules, moduleId],
          },
        })),

      earnBadge: (badgeId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            badges: state.progress.badges.includes(badgeId)
              ? state.progress.badges
              : [...state.progress.badges, badgeId],
          },
        })),

      incrementStreak: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            streak: state.progress.streak + 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
          },
        })),

      resetStreak: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            streak: 0,
          },
        })),

      setWeakTopics: (topics) =>
        set((state) => ({
          progress: {
            ...state.progress,
            weakTopics: topics,
          },
        })),

      setReviewMode: (lessonId, topicLabels) =>
        set((state) => ({
          progress: {
            ...state.progress,
            reviewMode: { lessonId, topicLabels },
            weakTopics: topicLabels,
          },
        })),

      clearReviewMode: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            reviewMode: null,
            weakTopics: [],
          },
        })),

      markScenarioSkipped: (scenarioId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            skippedScenarioIds: state.progress.skippedScenarioIds.includes(scenarioId)
              ? state.progress.skippedScenarioIds
              : [...state.progress.skippedScenarioIds, scenarioId],
          },
        })),

      lessonSession: {
        lessonId: null,
        currentQuestionIndex: 0,
        answers: {},
        correctCount: 0,
        scenarioAnswered: false,
        scenarioState: null,
      },

      startLesson: (lessonId) =>
        set({
          lessonSession: {
            lessonId,
            currentQuestionIndex: 0,
            answers: {},
            correctCount: 0,
            scenarioAnswered: false,
            scenarioState: null,
          },
        }),

      answerQuestion: (questionId, answerId, correct) =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            answers: {
              ...state.lessonSession.answers,
              [questionId]: answerId,
            },
            correctCount: correct
              ? state.lessonSession.correctCount + 1
              : state.lessonSession.correctCount,
          },
        })),

      nextQuestion: () =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            currentQuestionIndex: state.lessonSession.currentQuestionIndex + 1,
          },
        })),

      completeScenario: () =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            scenarioAnswered: true,
            scenarioState: state.lessonSession.scenarioState
              ? {
                  ...state.lessonSession.scenarioState,
                  answered: true,
                  skipped: false,
                }
              : state.lessonSession.scenarioState,
          },
        })),

      startScenarioLoad: (scenarioId, jobId) =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            scenarioState: {
              scenarioId,
              jobId,
              imageUrl: null,
              answered: false,
              skipped: false,
            },
          },
        })),

      setScenarioReady: (imageUrl) =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            scenarioState: state.lessonSession.scenarioState
              ? {
                  ...state.lessonSession.scenarioState,
                  imageUrl,
                }
              : state.lessonSession.scenarioState,
          },
        })),

      skipScenario: () =>
        set((state) => ({
          lessonSession: {
            ...state.lessonSession,
            scenarioState: state.lessonSession.scenarioState
              ? {
                  ...state.lessonSession.scenarioState,
                  skipped: true,
                }
              : state.lessonSession.scenarioState,
          },
        })),

      resetLessonSession: () =>
        set({
          lessonSession: {
            lessonId: null,
            currentQuestionIndex: 0,
            answers: {},
            correctCount: 0,
            scenarioAnswered: false,
            scenarioState: null,
          },
        }),

      examSession: {
        moduleId: null,
        answers: {},
        flagged: [],
        timeRemaining: 0,
        submitted: false,
      },

      startExam: (moduleId, timeLimit) =>
        set({
          examSession: {
            moduleId,
            answers: {},
            flagged: [],
            timeRemaining: timeLimit,
            submitted: false,
          },
        }),

      answerExamQuestion: (questionId, answerId) =>
        set((state) => ({
          examSession: {
            ...state.examSession,
            answers: {
              ...state.examSession.answers,
              [questionId]: answerId,
            },
          },
        })),

      flagQuestion: (questionId) =>
        set((state) => ({
          examSession: {
            ...state.examSession,
            flagged: state.examSession.flagged.includes(questionId)
              ? state.examSession.flagged
              : [...state.examSession.flagged, questionId],
          },
        })),

      unflagQuestion: (questionId) =>
        set((state) => ({
          examSession: {
            ...state.examSession,
            flagged: state.examSession.flagged.filter((id) => id !== questionId),
          },
        })),

      tickTimer: () =>
        set((state) => ({
          examSession: {
            ...state.examSession,
            timeRemaining: Math.max(0, state.examSession.timeRemaining - 1),
          },
        })),

      submitExam: () =>
        set((state) => ({
          examSession: {
            ...state.examSession,
            submitted: true,
          },
        })),

      resetExamSession: () =>
        set({
          examSession: {
            moduleId: null,
            answers: {},
            flagged: [],
            timeRemaining: 0,
            submitted: false,
          },
        }),

      ui: {
        toasts: [],
        isLoading: false,
        showConfetti: false,
      },

      addToast: (toast) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toasts: [
              ...state.ui.toasts,
              { ...toast, id: Math.random().toString(36).slice(2) },
            ],
          },
        })),

      removeToast: (id) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toasts: state.ui.toasts.filter((toast) => toast.id !== id),
          },
        })),

      setLoading: (loading) =>
        set((state) => ({
          ui: {
            ...state.ui,
            isLoading: loading,
          },
        })),

      triggerConfetti: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showConfetti: true,
          },
        })),

      stopConfetti: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            showConfetti: false,
          },
        })),
    }),
    {
      name: 'abst-storage',
      partialize: (state) => ({
        user: state.user,
        progress: state.progress,
      }),
    }
  )
)
