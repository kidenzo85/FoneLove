'use client'

import { cn } from '@/lib/utils'

interface FoneLoveIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  glow?: boolean
}

export function FoneLoveIcon({ className, glow = true, ...props }: FoneLoveIconProps) {
  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)}>
      {/* Optional Glow Effect */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40 mix-blend-screen animate-pulse" 
          style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }} 
        />
      )}
      
      {/* 3D Coin base */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
        {...props}
      >
        <defs>
          <linearGradient id="fonelove-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="fonelove-border-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id="inner-glow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feFlood floodColor="#ffffff" floodOpacity="0.4" result="glowColor" />
            <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Ring (Gold/Pink shine) */}
        <circle cx="50" cy="50" r="48" fill="url(#fonelove-border-grad)" />
        
        {/* Inner Coin */}
        <circle cx="50" cy="50" r="42" fill="url(#fonelove-bg-grad)" filter="url(#inner-glow)" />
        
        {/* Shine highlight */}
        <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

        {/* Heart/Handset combined symbol from Logo */}
        <g transform="translate(18, 18) scale(0.65)" fill="white">
          <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100H80C91 100 100 91 100 80V50C100 22.4 77.6 0 50 0ZM33 28C38.5 28 43 32.5 43 38C43 43.5 38.5 48 33 48C27.5 48 23 43.5 23 38C23 32.5 27.5 28 33 28ZM70 70L50 50L30 70C25 65 20 55 20 45C20 30 30 20 45 20C55 20 65 25 70 30L60 40L70 50L80 40C85 45 90 55 90 65C90 75 80 85 70 70Z" opacity="0.9" />
          
          <path d="M78 30C72 20 62 14 50 14C38 14 28 20 22 30L16 24C24 12 36 4 50 4C64 4 76 12 84 24L78 30Z" opacity="0.7"/>
        </g>
        
        {/* Central Heart (Derived explicitly) */}
        <path d="M50 72L42 64C28 51 20 44 20 34C20 25 27 18 36 18C41 18 46 20 50 24C54 20 59 18 64 18C73 18 80 25 80 34C80 44 72 51 58 64L50 72Z" fill="white" className="drop-shadow-sm" />
      </svg>
    </div>
  )
}
