// src/features/diagnoses/components/public/Logo.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  /** Desktop genişlik px (default 160) */
  width?: number
  /** Desktop yükseklik px (default 48) */
  height?: number
  className?: string
}

export function Logo({ width = 160, height = 48, className = '' }: LogoProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <span className={`font-bold text-on-background text-base tracking-tight ${className}`}>
        Deep Creative Marka101
      </span>
    )
  }

  return (
    <Image
      src="/deep-creative-logo.png"
      alt="Deep Creative"
      width={width}
      height={height}
      className={`object-contain w-auto ${className}`}
      onError={() => setHasError(true)}
      priority
    />
  )
}
