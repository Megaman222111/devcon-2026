'use client'

import { motion } from 'framer-motion'
import { Settings, LogOut, Zap, Flame, BookOpen, Clapperboard, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { BadgeGrid } from '@/components/gamification/badge-display'
import { useAppStore } from '@/lib/store'
import { modules, badges } from '@/lib/mock-data'
import { staggerContainer, staggerItem } from '@/lib/motion-presets'

export default function ProfilePage() {
  const user = useAppStore((state) => state.user)
  const progress = useAppStore((state) => state.progress)

  const earnedBadges = badges.map((badge) => ({
    ...badge,
    earned: progress.badges.includes(badge.id) || badge.earned,
  }))

  const stats = [
    { icon: Flame, label: 'Streak', value: progress.streak, color: 'text-[#FF9600]', bgColor: 'bg-[#FF9600]/10' },
    { icon: Zap, label: 'Lightning', value: progress.xp, color: 'text-[#FFC800]', bgColor: 'bg-[#FFC800]/10' },
    { icon: BookOpen, label: 'Lessons', value: progress.completedLessons.length || 7, color: 'text-[#1CB0F6]', bgColor: 'bg-[#1CB0F6]/10' },
    { icon: Clapperboard, label: 'Scenarios', value: 4, color: 'text-[#8B5CF6]', bgColor: 'bg-[#8B5CF6]/10' },
  ]

  const getLanguageLabel = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      tl: 'Tagalog',
      hi: 'Hindi',
      ur: 'Urdu',
      zh: 'Mandarin',
      ko: 'Korean',
      vi: 'Vietnamese',
      es: 'Spanish',
      pt: 'Portuguese',
      fr: 'French',
      ar: 'Arabic',
      ja: 'Japanese',
    }
    return languages[code] || 'English'
  }

  return (
    <AppShell showStats={false}>
      <div className="max-w-xl mx-auto px-4 py-6 pb-24">
        <h1 className="font-bold text-2xl text-foreground mb-6">Profile</h1>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {/* User Card */}
          <motion.div
            variants={staggerItem}
            className="bg-card border-2 border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-2xl text-foreground">
                  {user?.name || 'User'}
                </h2>
                <p className="text-muted-foreground">
                  Level {progress.level} - Security Professional
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerItem}
            className="bg-card border-2 border-border rounded-2xl p-5"
          >
            <div className="grid grid-cols-4 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl ${stat.bgColor} mb-2`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <div className="font-bold text-xl text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div
            variants={staggerItem}
            className="bg-card border-2 border-border rounded-2xl p-5"
          >
            <h3 className="font-bold text-foreground mb-4">Course Progress</h3>
            <div className="space-y-4">
              {modules.slice(0, 4).map((module) => (
                <div key={module.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Unit {module.number}
                    </span>
                    {module.locked ? (
                      <span className="text-xs text-muted-foreground">Locked</span>
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {Math.round((module.completedLessons / module.lessonsCount) * 100)}%
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    value={module.locked ? 0 : module.completedLessons}
                    max={module.lessonsCount}
                    height="sm"
                    color={
                      module.completedLessons === module.lessonsCount
                        ? 'green'
                        : 'blue'
                    }
                    animated={false}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            variants={staggerItem}
            className="bg-card border-2 border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">
                Badges ({earnedBadges.filter((b) => b.earned).length}/{earnedBadges.length})
              </h3>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <BadgeGrid badges={earnedBadges} size="md" />
          </motion.div>

          {/* Language */}
          <motion.div
            variants={staggerItem}
            className="bg-card border-2 border-border rounded-2xl p-5"
          >
            <h3 className="font-bold text-foreground mb-4">Language</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {user?.language === 'tl'
                    ? '🇵🇭'
                    : user?.language === 'zh'
                    ? '🇨🇳'
                    : '🇨🇦'}
                </span>
                <span className="text-foreground font-medium">
                  {getLanguageLabel(user?.language || 'en')}
                </span>
              </div>
              <button className="text-sm text-primary hover:underline">
                Change
              </button>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={staggerItem} className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-muted text-foreground font-semibold rounded-2xl border-2 border-border transition-colors">
              <Settings size={18} />
              Settings
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30 text-muted-foreground font-semibold rounded-2xl border-2 border-border transition-colors">
              <LogOut size={18} />
              Sign Out
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}
