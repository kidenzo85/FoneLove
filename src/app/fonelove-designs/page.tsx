'use client'

import React from 'react'

const heartPath = "M50 74 C 50 74, 26 54, 26 36 C 26 25, 35 18, 44 18 C 50 18, 50 24, 50 24 C 50 24, 50 18, 56 18 C 65 18, 74 25, 74 36 C 74 54, 50 74, 50 74 Z"
const smallHeartPath = "M50 64 C 50 64, 32 48, 32 34 C 32 26, 38 22, 44 22 C 48 22, 50 26, 50 26 C 50 26, 52 22, 56 22 C 62 22, 68 26, 68 34 C 68 48, 50 64, 50 64 Z"

const CommonDefs = () => (
  <defs>
    {/* Exact Match of the Button Gradient (Pink to Orange/Amber) */}
    <linearGradient id="g-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ec4899" />   {/* Pink 500 */}
      <stop offset="50%" stopColor="#f43f5e" />  {/* Rose 500 */}
      <stop offset="100%" stopColor="#f97316" /> {/* Orange 500 */}
    </linearGradient>

    <linearGradient id="g-sunset-reverse" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stopColor="#db2777" />   {/* Pink 600 */}
      <stop offset="100%" stopColor="#f59e0b" /> {/* Amber 500 */}
    </linearGradient>

    <linearGradient id="g-sunset-bright" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#f472b6" />   {/* Pink 400 */}
      <stop offset="50%" stopColor="#fb7185" />  {/* Rose 400 */}
      <stop offset="100%" stopColor="#fbbf24" /> {/* Amber 400 */}
    </linearGradient>

    <linearGradient id="g-gold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#b45309" />
      <stop offset="50%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#fef3c7" />
    </linearGradient>

    <linearGradient id="g-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="100%" stopColor="#0f172a" />
    </linearGradient>

    <linearGradient id="g-white" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#e2e8f0" />
    </linearGradient>

    {/* Shadows & Glows */}
    <filter id="shadow-md" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
    </filter>
    
    <filter id="shadow-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.7" />
    </filter>
    
    <filter id="inner-shadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood floodColor="black" floodOpacity="0.3" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>
)

type CoinProps = {
  name: string
  ring: string
  core: string
  heart: string
  ringType: 'solid' | 'dashed' | 'double' | 'thick'
  coreDetail: 'none' | 'rays' | 'rings' | 'small-heart'
  glossy: boolean
  glow: boolean
}

const PremiumCoin = ({ config }: { config: CoinProps }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-28 h-28 drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300">
      <CommonDefs />
      
      {/* Outer Ring */}
      {config.ringType === 'solid' && (
        <circle cx="50" cy="50" r="48" fill={config.ring} filter="url(#shadow-md)" />
      )}
      {config.ringType === 'thick' && (
        <>
          <circle cx="50" cy="50" r="48" fill={config.ring} filter="url(#shadow-md)" />
          <circle cx="50" cy="50" r="40" fill="#000" opacity="0.1" />
        </>
      )}
      {config.ringType === 'dashed' && (
        <>
          <circle cx="50" cy="50" r="48" fill={config.ring} filter="url(#shadow-md)" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        </>
      )}
      {config.ringType === 'double' && (
        <>
          <circle cx="50" cy="50" r="48" fill={config.ring} filter="url(#shadow-md)" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
        </>
      )}

      {/* Inner Core */}
      <circle cx="50" cy="50" r={config.ringType === 'thick' ? 38 : 42} fill={config.core} filter="url(#inner-shadow)" />

      {/* Core Details */}
      {config.coreDetail === 'rays' && (
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
      )}
      {config.coreDetail === 'rings' && (
        <>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
        </>
      )}
      {config.coreDetail === 'small-heart' && (
        <path d={smallHeartPath} fill="none" stroke={config.heart} strokeWidth="1.5" opacity="0.6" />
      )}

      {/* Glossy overlay on core */}
      {config.glossy && (
        <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      )}

      {/* Central Heart */}
      <path 
        d={heartPath} 
        fill={config.heart} 
        filter={config.glow ? 'url(#shadow-glow)' : 'url(#shadow-md)'} 
      />
      
      {/* Heart inner reflection */}
      <path d="M 32 32 Q 40 24 46 26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity={config.glossy ? 0.7 : 0.3} />
    </svg>
  )
}

const configurations: CoinProps[] = [
  { name: '1. L\'Original Sunset', ring: 'url(#g-sunset)', core: 'url(#g-sunset)', heart: 'url(#g-white)', ringType: 'double', coreDetail: 'none', glossy: true, glow: false },
  { name: '2. Cœur Sunset', ring: 'url(#g-white)', core: 'url(#g-white)', heart: 'url(#g-sunset)', ringType: 'thick', coreDetail: 'rings', glossy: true, glow: true },
  { name: '3. Sunset & Or', ring: 'url(#g-gold)', core: 'url(#g-sunset)', heart: 'url(#g-gold)', ringType: 'dashed', coreDetail: 'none', glossy: true, glow: false },
  { name: '4. Éclat Sunset', ring: 'url(#g-sunset-bright)', core: 'url(#g-sunset-reverse)', heart: 'url(#g-white)', ringType: 'solid', coreDetail: 'rays', glossy: true, glow: false },
  { name: '5. Sunset Nuit', ring: 'url(#g-dark)', core: 'url(#g-dark)', heart: 'url(#g-sunset-bright)', ringType: 'double', coreDetail: 'small-heart', glossy: true, glow: true },
  { name: '6. Halo Sunset', ring: 'url(#g-sunset)', core: 'url(#g-white)', heart: 'url(#g-sunset)', ringType: 'thick', coreDetail: 'none', glossy: false, glow: false },
  { name: '7. Sunset Inverse', ring: 'url(#g-sunset)', core: 'url(#g-dark)', heart: 'url(#g-sunset)', ringType: 'solid', coreDetail: 'rays', glossy: true, glow: true },
  { name: '8. Sunset Diamant', ring: 'url(#g-white)', core: 'url(#g-sunset-reverse)', heart: 'url(#g-white)', ringType: 'double', coreDetail: 'rings', glossy: true, glow: false },
  { name: '9. Obsidienne Sunset', ring: 'url(#g-sunset)', core: 'url(#g-dark)', heart: 'url(#g-white)', ringType: 'dashed', coreDetail: 'none', glossy: true, glow: false },
  { name: '10. L\'Étoile Sunset', ring: 'url(#g-sunset-bright)', core: 'url(#g-sunset-bright)', heart: 'url(#g-white)', ringType: 'thick', coreDetail: 'rays', glossy: true, glow: true },
]

export default function SunsetDesignsPreview() {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 9999, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: '#0f172a' 
      }}
      className="p-4 sm:p-8"
    >
      <div className="max-w-5xl mx-auto pb-40">
        
        <div className="mb-14 text-center mt-8">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            Collection <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500">Sunset FoneLove</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            10 déclinaisons exclusives de la pièce de monnaie reprenant <strong>exactement</strong> le dégradé "Rose-vers-Orange" (Sunset) de ton bouton d'action FoneLove.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {configurations.map((config, i) => (
            <div 
              key={config.name} 
              className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-slate-700/50 flex flex-col items-center justify-center gap-6 hover:shadow-2xl hover:border-rose-500/50 hover:-translate-y-2 transition-all cursor-pointer group"
            >
              <PremiumCoin config={config} />
              <p className="text-sm font-bold text-center text-slate-200 group-hover:text-rose-400 transition-colors">
                {config.name}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
