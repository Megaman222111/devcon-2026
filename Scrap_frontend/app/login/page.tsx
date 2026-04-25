'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { ShieldLogo } from '@/components/ui/shield-logo'
import { useAppStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setUser = useAppStore((state) => state.setUser)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - in real app would validate credentials
    setUser({
      id: '1',
      name: email.split('@')[0],
      email,
      language: 'en',
      translationMode: 'none',
      languagePrefs: {
        language: 'en',
        translationMode: 'none',
        rtl: false,
        awsTranslateCode: 'en',
      },
    })
    router.push('/home')
  }

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="flex justify-center mb-6">
          <ShieldLogo size={60} />
        </div>

        <h1 className="text-center font-display font-bold text-3xl text-white mb-2">
          Welcome back
        </h1>
        <p className="text-center text-navy-400 mb-8">
          Sign in to continue your training
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full px-5 py-4 bg-navy-700 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-5 py-4 bg-navy-700 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-navy-900 rounded-xl font-display font-bold text-lg transition-colors btn-glow"
          >
            SIGN IN
            <ChevronRight size={20} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/onboarding"
            className="text-amber-400 hover:text-amber-300"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
