import type { Variants } from 'framer-motion'

export const slideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
}

export const slideUpTransition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
}

export const popIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

export const popInTransition = {
  duration: 0.35,
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07 },
  },
}

export const staggerItem: Variants = {
  initial: { y: 15, opacity: 0 },
  animate: { y: 0, opacity: 1 },
}

export const correctAnswer: Variants = {
  initial: {},
  animate: {
    scale: [1, 1.06, 1],
    backgroundColor: ['transparent', '#10B981', '#10B981'],
    transition: { duration: 0.4 },
  },
}

export const wrongAnswer: Variants = {
  initial: {},
  animate: {
    x: [0, -8, 8, -5, 5, 0],
    backgroundColor: ['transparent', '#EF4444', '#EF4444'],
    transition: { duration: 0.5 },
  },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideFromBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

export const slideFromRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
}

export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
}

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.25, ease: 'easeInOut' },
}

export const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

export const smoothTransition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
}
