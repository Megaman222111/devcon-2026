'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, BookOpen, Languages } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { KeyTermPanel } from '@/components/lesson/key-term-panel'
import { lessonContent } from '@/lib/mock-data'

type Tab = 'english' | 'terms'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('english')

  const totalSections = lessonContent.sections.length
  const progress = ((currentSection + 1) / totalSections) * 100
  const isLastSection = currentSection === totalSections - 1

  const handleNext = () => {
    if (isLastSection) {
      router.push(`/lesson/${params.id}/quiz`)
    } else {
      setCurrentSection(currentSection + 1)
    }
  }

  return (
    <AppShell
      showBottomNav={false}
      breadcrumb={{ module: 'Module 2', lesson: lessonContent.title }}
    >
      {/* Progress Bar */}
      <div className="sticky top-16 z-40 bg-navy-800 border-b border-navy-600">
        <ProgressBar value={progress} height="sm" animated={false} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('english')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
              activeTab === 'english'
                ? 'bg-amber-500 text-navy-900'
                : 'bg-navy-700 text-navy-300 hover:text-white'
            )}
          >
            <BookOpen size={16} />
            English
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
              activeTab === 'terms'
                ? 'bg-amber-500 text-navy-900'
                : 'bg-navy-700 text-navy-300 hover:text-white'
            )}
          >
            <Languages size={16} />
            Key Terms
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(activeTab !== 'english' && 'hidden lg:block')}
          >
            <div className="bg-navy-800 rounded-2xl p-6 lg:p-8">
              <div className="text-sm text-amber-500 font-semibold mb-2">
                LESSON 2.4
              </div>
              <h1 className="font-display font-bold text-3xl text-white mb-8">
                {lessonContent.title}
              </h1>

              <div className="prose prose-invert max-w-none">
                <h2 className="font-display font-semibold text-xl text-white mb-4">
                  {lessonContent.sections[currentSection].heading}
                </h2>
                <div className="text-navy-200 leading-relaxed whitespace-pre-line">
                  {lessonContent.sections[currentSection].content}
                </div>
              </div>

              {/* Legal Reference Callout */}
              {currentSection === 2 && (
                <div className="mt-6 p-4 bg-navy-700 border-l-4 border-amber-500 rounded-r-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
                    DEFINITION
                  </div>
                  <p className="text-navy-200 text-sm">
                    <strong className="text-white">&quot;Use of Force&quot;</strong> — The application of physical
                    strength or power to compel compliance from an unwilling subject.
                  </p>
                </div>
              )}

              {/* Section Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-600">
                <button
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    currentSection === 0
                      ? 'text-navy-600 cursor-not-allowed'
                      : 'text-navy-300 hover:text-white hover:bg-navy-700'
                  )}
                >
                  Previous
                </button>

                <div className="flex gap-1.5">
                  {lessonContent.sections.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSection(i)}
                      className={cn(
                        'w-2.5 h-2.5 rounded-full transition-colors',
                        i === currentSection ? 'bg-amber-500' : 'bg-navy-600 hover:bg-navy-500'
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-lg text-sm font-semibold transition-colors"
                >
                  {isLastSection ? 'Take Quiz' : 'Next'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Key Terms Sidebar */}
          <aside
            className={cn(
              'lg:block',
              activeTab !== 'terms' && 'hidden'
            )}
          >
            <div className="lg:sticky lg:top-28 bg-navy-900 rounded-2xl p-5 border border-navy-700">
              <KeyTermPanel
                terms={lessonContent.keyTerms}
                targetLanguage="Tagalog"
              />
            </div>
          </aside>
        </div>

        {/* Fixed Bottom CTA (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-navy-900 border-t border-navy-700">
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-bold text-lg transition-colors"
          >
            {isLastSection ? "I'VE READ THIS — TAKE QUIZ" : 'Continue'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </AppShell>
  )
}
