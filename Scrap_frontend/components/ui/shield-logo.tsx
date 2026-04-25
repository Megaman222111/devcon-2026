'use client'

import { cn } from '@/lib/utils'

interface ShieldLogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function ShieldLogo({ size = 40, className, animated = false }: ShieldLogoProps) {
  return (
    <svg
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 1.125}
      className={cn(
        animated && 'animate-bounce',
        className
      )}
    >
      {/* Shield body - Duolingo green */}
      <path
        d="M40 4L6 18V44C6 63 21 79 40 86C59 79 74 63 74 44V18L40 4Z"
        fill="#58CC02"
        stroke="#46A302"
        strokeWidth="2"
      />
      {/* Shield highlight */}
      <path
        d="M40 8L12 20V44C12 60 25 74 40 80C55 74 68 60 68 44V20L40 8Z"
        fill="#58CC02"
      />
      {/* Lock body */}
      <rect x="28" y="42" width="24" height="20" rx="4" fill="#FFFFFF" />
      {/* Lock shackle */}
      <path
        d="M32 42V36C32 30 48 30 48 36V42"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Lock keyhole */}
      <circle cx="40" cy="52" r="4" fill="#58CC02" />
      <rect x="38" y="52" width="4" height="6" rx="1" fill="#58CC02" />
    </svg>
  )
}
