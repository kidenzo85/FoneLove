'use client'

import { cn } from '@/lib/utils'

interface FoneLoveIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  glow?: boolean
}

export function FoneLoveIcon({ className, glow = false, ...props }: FoneLoveIconProps) {
  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)}>
      {/* Optional external glow effect if requested by props */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse" 
          style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)' }} 
        />
      )}
      
      {/* 3D Premium Vector Coin: 4. Éclat Sunset */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
        {...props}
      >
        <defs>
          <linearGradient id="fl-sunset-bright" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          
          <linearGradient id="fl-sunset-reverse" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="fl-white" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Shadows */}
          <filter id="fl-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
          
          <filter id="fl-inner-shadow">
            <feOffset dx="0" dy="2"/>
            <feGaussianBlur stdDeviation="2" result="offset-blur"/>
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
            <feFlood floodColor="black" floodOpacity="0.3" result="color"/>
            <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
            <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
          </filter>
        </defs>

        {/* Outer Ring (Solid) */}
        <circle cx="50" cy="50" r="48" fill="url(#fl-sunset-bright)" filter="url(#fl-shadow)" />

        {/* Inner Core */}
        <circle cx="50" cy="50" r="42" fill="url(#fl-sunset-reverse)" filter="url(#fl-inner-shadow)" />

        {/* Core Details: Rays */}
        <g opacity="0.2" stroke="#fff" strokeWidth="0.5">
          {[...Array(12)].map((_, i) => (
            <line 
              key={i} 
              x1="50" 
              y1="50" 
              x2={(50 + 40 * Math.cos(i * Math.PI / 6)).toFixed(3)} 
              y2={(50 + 40 * Math.sin(i * Math.PI / 6)).toFixed(3)} 
            />
          ))}
        </g>

        {/* Glossy overlay on core */}
        <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

        {/* Central Heart */}
        <path 
          d="M50 74 C 50 74, 26 54, 26 36 C 26 25, 35 18, 44 18 C 50 18, 50 24, 50 24 C 50 24, 50 18, 56 18 C 65 18, 74 25, 74 36 C 74 54, 50 74, 50 74 Z" 
          fill="url(#fl-white)" 
          filter="url(#fl-shadow)" 
        />
        
        {/* Heart inner reflection */}
        <path d="M 32 32 Q 40 24 46 26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  )
}
