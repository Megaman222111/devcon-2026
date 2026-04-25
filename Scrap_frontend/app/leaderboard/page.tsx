'use client'

import { motion } from 'framer-motion'
import { Flame, Zap, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/lib/store'
import { leaderboardData } from '@/lib/mock-data'
import { staggerContainer, staggerItem } from '@/lib/motion-presets'

export default function LeaderboardPage() {
  const user = useAppStore((state) => state.user)
  const progress = useAppStore((state) => state.progress)

  // Insert current user at rank 2 for demo
  const currentUserEntry = {
    rank: 2,
    name: user?.name ? `${user.name.charAt(0).toUpperCase()}${user.name.slice(1)}` : 'You',
    xp: progress.xp || 680,
    streak: progress.streak || 7,
    isCurrentUser: true,
  }

  const allEntries = [
    leaderboardData[0],
    currentUserEntry,
    ...leaderboardData.slice(2).map((entry, i) => ({ ...entry, rank: i + 3 })),
  ]

  const top3 = allEntries.slice(0, 3)
  const rest = allEntries.slice(3)

  return (
    <AppShell showStats={false}>
      <div className="max-w-xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl text-foreground">
            Leaderboard
          </h1>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-muted rounded-xl text-sm font-medium text-foreground border-2 border-border transition-colors">
            This Week <ChevronDown size={14} />
          </button>
        </div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-center gap-3 mb-8 pt-8"
        >
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 border-4',
                top3[1].isCurrentUser
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-foreground border-border'
              )}
            >
              {top3[1].name.charAt(0)}
            </div>
            <div className="text-sm font-semibold text-foreground truncate max-w-20">
              {top3[1].isCurrentUser ? 'You' : top3[1].name}
            </div>
            <div className="flex items-center gap-1 text-[#FFC800] text-sm font-bold">
              <Zap size={12} className="fill-[#FFC800]" />
              {top3[1].xp}
            </div>
            <div className="mt-2 w-20 h-20 bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl font-black text-gray-500 dark:text-gray-300">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8">
            <div className="relative mb-2">
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ring-4 ring-[#FFC800]',
                  top3[0].isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                )}
              >
                {top3[0].name.charAt(0)}
              </div>
              <div className="absolute -top-3 -right-1 text-2xl">👑</div>
            </div>
            <div className="text-base font-bold text-foreground truncate max-w-24">
              {top3[0].isCurrentUser ? 'You' : top3[0].name}
            </div>
            <div className="flex items-center gap-1 text-[#FFC800] font-bold">
              <Zap size={14} className="fill-[#FFC800]" />
              {top3[0].xp}
            </div>
            <div className="mt-2 w-24 h-28 bg-gradient-to-t from-[#FFC800] to-[#FFD94D] rounded-t-xl flex items-center justify-center">
              <span className="text-3xl font-black text-[#996F00]">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 border-4',
                top3[2].isCurrentUser
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-foreground border-border'
              )}
            >
              {top3[2].name.charAt(0)}
            </div>
            <div className="text-sm font-semibold text-foreground truncate max-w-20">
              {top3[2].isCurrentUser ? 'You' : top3[2].name}
            </div>
            <div className="flex items-center gap-1 text-[#FFC800] text-sm font-bold">
              <Zap size={12} className="fill-[#FFC800]" />
              {top3[2].xp}
            </div>
            <div className="mt-2 w-20 h-16 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl font-black text-orange-800">3</span>
            </div>
          </div>
        </motion.div>

        {/* Your Rank Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-2xl bg-primary/10 border-2 border-primary/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Your Rank</span>
            <span className="font-bold text-xl text-primary">
              #{currentUserEntry.rank} of {allEntries.length}
            </span>
          </div>
        </motion.div>

        {/* Rest of the List */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {rest.map((entry) => (
            <motion.div
              key={entry.rank}
              variants={staggerItem}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors',
                entry.isCurrentUser
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-card border-border hover:bg-secondary'
              )}
            >
              <span
                className={cn(
                  'w-8 text-center font-bold',
                  entry.isCurrentUser ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {entry.rank}.
              </span>
              <div
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center font-bold',
                  entry.isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                )}
              >
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div
                  className={cn(
                    'font-semibold',
                    entry.isCurrentUser ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {entry.isCurrentUser ? 'You' : entry.name}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {entry.streak > 0 && (
                  <div className="flex items-center gap-1 text-sm text-[#FF9600] font-medium">
                    <Flame
                      size={14}
                      className="fill-[#FF9600] text-[#FF9600]"
                    />
                    {entry.streak}
                  </div>
                )}
                <div className="flex items-center gap-1 text-[#FFC800] font-bold">
                  <Zap size={14} className="fill-[#FFC800]" />
                  {entry.xp}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppShell>
  )
}
