'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, BookOpen, Globe, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type LanguageCode, type TranslationMode } from '@/lib/store'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { ConfettiEngine } from '@/components/gamification/confetti-engine'

const languages: { code: LanguageCode; flag: string; name: string; native: string }[] = [
  { code: 'en', flag: '🇨🇦', name: 'English', native: '' },
  { code: 'tl', flag: '🇵🇭', name: 'Tagalog', native: 'Filipino' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', native: 'اردو' },
  { code: 'zh', flag: '🇨🇳', name: 'Mandarin', native: '中文' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
  { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
]

const translationModes: { mode: TranslationMode; icon: React.ElementType; title: string; description: string }[] = [
  {
    mode: 'keywords',
    icon: BookOpen,
    title: 'Keywords only',
    description: 'See key terms translated in the sidebar. Best for building English confidence.',
  },
  {
    mode: 'ondemand',
    icon: Globe,
    title: 'Keywords + On-demand paragraphs',
    description: 'Tap a paragraph to see full translation. Recommended for most learners.',
  },
  {
    mode: 'none',
    icon: Languages,
    title: 'English only',
    description: 'No translations. Pure English immersion.',
  },
]

const steps = ['Name', 'Language', 'Translation', 'Account']

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en')
  const [translationMode, setTranslationMode] = useState<TranslationMode>('ondemand')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  const setUser = useAppStore((state) => state.setUser)
  const triggerConfetti = useAppStore((state) => state.triggerConfetti)

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return name.trim().length >= 2
      case 1:
        return selectedLanguage !== null
      case 2:
        return translationMode !== null
      case 3:
        return email.includes('@') && password.length >= 6
      default:
        return false
    }
  }

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Create account
      setUser({
        id: Math.random().toString(36).slice(2),
        name: name.trim(),
        email,
        language: selectedLanguage,
        translationMode,
      })
      setShowWelcome(true)
      triggerConfetti()
      setTimeout(() => {
        router.push('/home')
      }, 2500)
    }
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
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
          <h1 className="mt-6 font-bold text-3xl text-primary">
            Welcome aboard, {name}!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your security training journey begins now.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-2 rounded-full transition-all',
              index <= currentStep ? 'bg-primary w-8' : 'bg-border w-2'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="font-bold text-2xl sm:text-3xl text-foreground text-center">
                  What&apos;s your name?
                </h2>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name..."
                  className="w-full px-5 py-4 bg-secondary border-2 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-bold text-2xl sm:text-3xl text-foreground text-center">
                  What is your primary language?
                </h2>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left',
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-muted-foreground'
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{lang.name}</div>
                        {lang.native && (
                          <div className="text-sm text-muted-foreground truncate">{lang.native}</div>
                        )}
                      </div>
                      {selectedLanguage === lang.code && (
                        <Check size={18} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="font-bold text-2xl sm:text-3xl text-foreground text-center">
                  How would you like translations?
                </h2>
                <div className="space-y-3">
                  {translationModes.map((option) => (
                    <button
                      key={option.mode}
                      onClick={() => setTranslationMode(option.mode)}
                      className={cn(
                        'flex items-start gap-4 w-full px-5 py-4 rounded-2xl border-2 transition-all text-left',
                        translationMode === option.mode
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-muted-foreground'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0',
                        translationMode === option.mode ? 'bg-primary/20' : 'bg-secondary'
                      )}>
                        <option.icon
                          size={20}
                          className={cn(
                            translationMode === option.mode
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{option.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      </div>
                      {translationMode === option.mode && (
                        <Check size={18} className="text-primary flex-shrink-0 mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-bold text-2xl sm:text-3xl text-foreground text-center">
                  Create your account
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-5 py-4 bg-secondary border-2 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full px-5 py-4 bg-secondary border-2 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {password.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all rounded-full',
                            password.length < 6
                              ? 'bg-[#FF4B4B] w-1/3'
                              : password.length < 10
                              ? 'bg-[#FFC800] w-2/3'
                              : 'bg-primary w-full'
                          )}
                        />
                      </div>
                      <span className={cn(
                        'text-sm font-medium',
                        password.length < 6
                          ? 'text-[#FF4B4B]'
                          : password.length < 10
                          ? 'text-[#FFC800]'
                          : 'text-primary'
                      )}>
                        {password.length < 6
                          ? 'Weak'
                          : password.length < 10
                          ? 'Good'
                          : 'Strong'}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account you agree to the Terms of Service
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Continue Button */}
        <motion.button
          whileHover={canContinue() ? { scale: 1.02 } : {}}
          whileTap={canContinue() ? { scale: 0.98, y: 2 } : {}}
          onClick={handleContinue}
          disabled={!canContinue()}
          className={cn(
            'mt-10 w-full max-w-md',
            canContinue()
              ? 'btn-duo btn-duo-primary'
              : 'btn-duo bg-muted text-muted-foreground cursor-not-allowed shadow-none'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {currentStep === 3 ? 'CREATE MY ACCOUNT' : 'CONTINUE'}
            <ChevronRight size={20} />
          </span>
        </motion.button>

        {/* Back Button */}
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mt-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  )
}
