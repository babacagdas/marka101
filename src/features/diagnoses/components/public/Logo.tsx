'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 240, height = 72 }: LogoProps) {
  return (
    <Image
      src="/deep-creative-logo.png"
      alt="Deep Creative"
      width={width}
      height={height}
      className={`object-contain h-12 md:h-14 w-auto ${className}`}
      priority
    />
  )
}

