'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { ChevronRight, Shield, Trophy, Zap } from 'lucide-react'

const features = [
  { icon: Shield, text: 'Official ABST curriculum' },
  { icon: Trophy, text: 'Earn badges & certificates' },
  { icon: Zap, text: 'Learn at your own pace' },
]

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center max-w-md w-full">
          {/* Shield Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          >
            <ShieldLogo size={100} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight"
          >
            TrainSecureAI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-3 text-lg text-muted-foreground"
          >
            Alberta Basic Security Guard Training
          </motion.p>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-10 w-full space-y-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <feature.icon size={20} className="text-primary" />
                </div>
                <span className="text-base font-medium text-foreground">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-10 w-full space-y-3"
          >
            <Link
              href="/onboarding"
              className="btn-duo btn-duo-primary w-full gap-2"
            >
              GET STARTED
              <ChevronRight size={20} />
            </Link>
            
            <Link
              href="/login"
              className="btn-duo btn-duo-secondary w-full"
            >
              I ALREADY HAVE AN ACCOUNT
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </footer>
    </div>
  )
}
