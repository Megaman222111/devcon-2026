'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

const COLORS = [
  '#F59E0B', // amber
  '#FCD34D', // amber light
  '#FFFFFF', // white
  '#FBB924', // amber hover
  '#10B981', // green
]

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 720 - 360,
  }))
}

interface ConfettiEngineProps {
  particleCount?: number
}

export function ConfettiEngine({ particleCount = 50 }: ConfettiEngineProps) {
  const showConfetti = useAppStore((state) => state.ui.showConfetti)
  const stopConfetti = useAppStore((state) => state.stopConfetti)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (showConfetti) {
      setParticles(generateParticles(particleCount))
      const timer = setTimeout(() => {
        stopConfetti()
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setParticles([])
    }
  }, [showConfetti, particleCount, stopConfetti])

  return (
    <AnimatePresence>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation,
                opacity: 0,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
