'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, X, Check } from 'lucide-react'
import { searchCities, type WorldCity } from '@/lib/world-cities'
import { getCountryByCode } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

interface CityAutocompleteProps {
  value: string
  onSelect: (city: string, countryCode: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function CityAutocomplete({
  value,
  onSelect,
  placeholder,
  className,
  inputClassName
}: CityAutocompleteProps) {
  const { t } = useT()
  const [query, setQuery] = useState(value)
  const [showResults, setShowResults] = useState(false)
  const [selectedCity, setSelectedCity] = useState<WorldCity | null>(null)
  const results = useMemo(() => searchCities(query, 15), [query])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync internal query with external value if needed
  useEffect(() => {
    if (value !== query && !showResults) {
      setQuery(value)
    }
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (city: WorldCity) => {
    setSelectedCity(city)
    setQuery(city.name)
    setShowResults(false)
    onSelect(city.name, city.country)
  }

  const handleClear = () => {
    setSelectedCity(null)
    setQuery('')
    onSelect('', '')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t('onboard.searchCity') || 'Rechercher une ville...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
            if (selectedCity) {
              setSelectedCity(null)
            }
          }}
          onFocus={() => setShowResults(true)}
          className={cn(
            "w-full rounded-xl border bg-background pl-10 pr-10 py-3 text-base outline-none focus:ring-2 focus:ring-primary transition-shadow",
            inputClassName
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Selected city info small badge (optional, but nice for feedback) */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-medium text-primary"
        >
          <span>{getCountryByCode(selectedCity.country)?.flag}</span>
          <span>{selectedCity.name}, {selectedCity.countryName}</span>
          <Check className="size-3 ml-auto" />
        </motion.div>
      )}

      {/* Dropdown results */}
      <AnimatePresence>
        {showResults && query.length >= 1 && !selectedCity && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-[100] left-0 right-0 top-[calc(100%+4px)] max-h-[280px] overflow-y-auto rounded-xl border bg-popover shadow-xl border-primary/10 backdrop-blur-xl"
          >
            {results.map((city, idx) => {
              const country = getCountryByCode(city.country)
              return (
                <button
                  key={`${city.name}-${city.country}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-primary/5 transition-colors',
                    idx < results.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <span className="text-xl">{country?.flag || '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-foreground">{city.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold truncate">
                      {city.countryName}{city.region ? ` · ${city.region}` : ''}
                    </p>
                  </div>
                  {city.population >= 1000000 && (
                    <span className="text-[10px] font-black text-muted-foreground/50 bg-muted/50 rounded-full px-2 py-0.5">
                      {(city.population / 1000000).toFixed(1)}M
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && query.length >= 1 && !selectedCity && results.length === 0 && (
        <div className="absolute z-[100] left-0 right-0 top-[calc(100%+4px)] p-4 rounded-xl border bg-popover shadow-xl text-center text-sm text-muted-foreground">
          {t('onboard.noCityFound', { query }) || `Aucune ville trouvée pour "${query}"`}
        </div>
      )}
    </div>
  )
}
