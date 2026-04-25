import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageCode = 'en' | 'tl' | 'hi' | 'ur' | 'zh' | 'ko' | 'vi' | 'es' | 'pt' | 'fr' | 'ar' | 'ja' | 'gu'
export type TranslationMode = 'keywords' | 'ondemand' | 'none'

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

interface User {
  id: string
  name: string
  email: string
  language: LanguageCode
  translationMode: TranslationMode
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
}

interface LessonSession {
  lessonId: string | null
  currentQuestionIndex: number
  answers: Record<string, string>
  correctCount: number
  scenarioAnswered: boolean
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
  // User
  user: User | null
  setUser: (user: User | null) => void
  updateUserLanguage: (language: LanguageCode) => void
  updateTranslationMode: (mode: TranslationMode) => void

  // Progress
  progress: Progress
  addXP: (amount: number) => void
  buyHearts: (heartsToBuy: number, energyCost: number) => boolean
  loseHeart: () => void
  refillHearts: () => void
  markLessonComplete: (lessonId: string) => void
  markModuleComplete: (moduleId: string) => void
  earnBadge: (badgeId: string) => void
  incrementStreak: () => void
  resetStreak: () => void

  // Lesson Session
  lessonSession: LessonSession
  startLesson: (lessonId: string) => void
  answerQuestion: (questionId: string, answerId: string, correct: boolean) => void
  nextQuestion: () => void
  completeScenario: () => void
  resetLessonSession: () => void

  // Exam Session
  examSession: ExamSession
  startExam: (moduleId: string, timeLimit: number) => void
  answerExamQuestion: (questionId: string, answerId: string) => void
  flagQuestion: (questionId: string) => void
  unflagQuestion: (questionId: string) => void
  tickTimer: () => void
  submitExam: () => void
  resetExamSession: () => void

  // UI
  ui: UIState
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setLoading: (loading: boolean) => void
  triggerConfetti: () => void
  stopConfetti: () => void
}

const XP_PER_LEVEL = 150

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateUserLanguage: (language) =>
        set((state) => ({
          user: state.user ? { ...state.user, language } : null,
        })),
      updateTranslationMode: (mode) =>
        set((state) => ({
          user: state.user ? { ...state.user, translationMode: mode } : null,
        })),

      // Progress
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
      },

      addXP: (amount) =>
        set((state) => {
          const newXP = Math.max(0, state.progress.xp + amount)
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

      buyHearts: (heartsToBuy, energyCost) => {
        if (heartsToBuy <= 0 || energyCost <= 0) return false

        let didPurchase = false
        set((state) => {
          if (state.progress.xp < energyCost) return state
          didPurchase = true
          return {
            progress: {
              ...state.progress,
              xp: state.progress.xp - energyCost,
              hearts: state.progress.hearts + heartsToBuy,
              heartsRefillAt: null,
            },
          }
        })

        if (didPurchase) {
          get().addToast({
            type: 'info',
            message: `Purchased ${heartsToBuy} life${heartsToBuy > 1 ? 's' : ''} for ${energyCost} lightning.`,
          })
        }

        return didPurchase
      },

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

      // Lesson Session
      lessonSession: {
        lessonId: null,
        currentQuestionIndex: 0,
        answers: {},
        correctCount: 0,
        scenarioAnswered: false,
      },

      startLesson: (lessonId) =>
        set({
          lessonSession: {
            lessonId,
            currentQuestionIndex: 0,
            answers: {},
            correctCount: 0,
            scenarioAnswered: false,
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
          },
        }),

      // Exam Session
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

      // UI
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
            toasts: state.ui.toasts.filter((t) => t.id !== id),
          },
        })),

      setLoading: (loading) =>
        set((state) => ({
          ui: { ...state.ui, isLoading: loading },
        })),

      triggerConfetti: () =>
        set((state) => ({
          ui: { ...state.ui, showConfetti: true },
        })),

      stopConfetti: () =>
        set((state) => ({
          ui: { ...state.ui, showConfetti: false },
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
