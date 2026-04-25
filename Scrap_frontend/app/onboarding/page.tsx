'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { ConfettiEngine } from '@/components/gamification/confetti-engine'
import { LanguageTileGrid } from '@/components/onboarding/language-tile-grid'
import { TranslationModeSelector } from '@/components/onboarding/translation-mode-selector'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import type { TranslationMode } from '@/types/quiz'

const steps = ['Name', 'Language', 'Translation', 'Account']

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null)
  const [translationMode, setTranslationMode] = useState<TranslationMode>('keywords')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  const setUser = useAppStore((state) => state.setUser)
  const triggerConfetti = useAppStore((state) => state.triggerConfetti)
  const addToast = useAppStore((state) => state.addToast)

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return name.trim().length >= 2
      case 1:
        return selectedLanguage !== null
      case 2:
        return selectedLanguage !== null && translationMode !== null
      case 3:
        return email.includes('@') && password.length >= 6
      default:
        return false
    }
  }

  const handleAutoDetect = () => {
    const detected = navigator.language.split('-')[0] as LanguageCode
    const match = getLanguageByCode(detected)
    if (match.code === detected) {
      setSelectedLanguage(match.code)
      setTranslationMode(match.code === 'en' ? 'none' : 'keywords')
      addToast({ type: 'success', message: `Detected: ${match.name}` })
      return
    }

    addToast({ type: 'info', message: 'Language not detected — please select manually' })
  }

  const handleContinue = () => {
    if (currentStep < 3) {
      if (currentStep === 1 && selectedLanguage === 'en') {
        setTranslationMode('none')
      }
      setCurrentStep((step) => step + 1)
      return
    }

    if (!selectedLanguage) return
    const language = getLanguageByCode(selectedLanguage)
    const mode = selectedLanguage === 'en' ? 'none' : translationMode

    setUser({
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      email,
      language: selectedLanguage,
      translationMode: mode,
      languagePrefs: {
        language: selectedLanguage,
        translationMode: mode,
        rtl: Boolean(language.rtl),
        awsTranslateCode: language.awsCode,
      },
    })

    localStorage.setItem(
      'abst_lang_prefs',
      JSON.stringify({
        language: selectedLanguage,
        translationMode: mode,
        rtl: Boolean(language.rtl),
        awsTranslateCode: language.awsCode,
      })
    )

    setShowWelcome(true)
    triggerConfetti()
    setTimeout(() => router.push('/home'), 2200)
  }

  if (showWelcome) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <ConfettiEngine />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <ShieldLogo size={80} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-primary">Welcome aboard, {name}!</h1>
          <p className="mt-3 text-muted-foreground">Your security training journey begins now.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 pb-12 pt-8">
        <div className="flex items-center justify-center gap-2 pb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 rounded-full transition-all',
                index <= currentStep ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'
              )}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full rounded-[32px] border border-slate-700 bg-slate-950/75 p-6 shadow-2xl shadow-black/20 sm:p-8"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white">What&apos;s your name?</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      We&apos;ll personalize your learning path and progress tracking.
                    </p>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your first name..."
                    autoFocus
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-lg text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-500"
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white">What language do you speak most comfortably?</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      This helps us show key security terms in your language as you learn.
                    </p>
                  </div>

                  <LanguageTileGrid
                    selected={selectedLanguage}
                    onSelect={(code) => {
                      setSelectedLanguage(code)
                      if (code === 'en') setTranslationMode('none')
                    }}
                    onAutoDetect={handleAutoDetect}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white">How do you want help while reading?</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Choose how much translation support you want during lessons.
                    </p>
                  </div>

                  {selectedLanguage && (
                    <TranslationModeSelector
                      selectedLanguage={selectedLanguage}
                      selectedMode={selectedLanguage === 'en' ? 'none' : translationMode}
                      onSelect={setTranslationMode}
                    />
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white">Create your account</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Your language preferences will be saved and applied across lessons, quizzes, and scenarios.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email address"
                      autoFocus
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-500"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password (min 6 characters)"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={canContinue() ? { scale: 1.02 } : {}}
            whileTap={canContinue() ? { scale: 0.98, y: 2 } : {}}
            onClick={handleContinue}
            disabled={!canContinue()}
            className={cn(
              'mt-8 w-full max-w-2xl rounded-2xl px-6 py-4 font-bold transition-colors',
              canContinue()
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {currentStep === 3 ? 'CREATE MY ACCOUNT' : 'CONTINUE'}
              <ChevronRight size={20} />
            </span>
          </motion.button>

          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep((step) => step - 1)}
              className="mt-4 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
