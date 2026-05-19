'use client'

import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { type FilterState } from '@/lib/store'
import { RotateCcw, Lock, Sparkles } from 'lucide-react'
import { useT } from '@/lib/i18n/context'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function FilterSheet({ open, onOpenChange, filters, onFiltersChange }: FilterSheetProps) {
  const { t } = useT()
  const { currentUser } = useAppStore()
  const { hasActiveFeature, fetchActiveFeatures } = usePremiumFeatures()
  const { spendCredits, setShowInsufficientBalance, fetchBalance, balance } = useConnectCoinStore()
  const canUseAdvancedFilters = hasActiveFeature('filters_plus')

  const resetFilters = () => {
    onFiltersChange({
      ageMin: 18,
      ageMax: 45,
      distanceMax: 50,
      lookingFor: 'all',
      gender: 'all',
      withPhotosOnly: false,
      verifiedOnly: false,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh] safe-area-bottom">
        <SheetHeader>
          <SheetTitle>{t('filter.title')}</SheetTitle>
          <SheetDescription>{t('filter.subtitle')}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-4 overflow-y-auto overscroll-y-contain min-h-0 pb-8">
          {/* Age range */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{t('filter.age')}</Label>
              <span className="text-sm text-muted-foreground">
                {filters.ageMin} - {filters.ageMax} {t('filter.years')}
              </span>
            </div>
            <Slider
              min={18}
              max={65}
              step={1}
              value={[filters.ageMin, filters.ageMax]}
              onValueChange={([min, max]) =>
                onFiltersChange({ ...filters, ageMin: min, ageMax: max })
              }
            />
          </div>

          {/* Distance */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{t('filter.maxDistance')}</Label>
              <span className="text-sm text-muted-foreground">{filters.distanceMax} {t('filter.km')}</span>
            </div>
            <Slider
              min={1}
              max={100}
              step={5}
              value={[filters.distanceMax]}
              onValueChange={([v]) => onFiltersChange({ ...filters, distanceMax: v })}
            />
          </div>

          {/* Gender */}
          <div>
            <Label className="mb-2 block">{t('filter.lookingFor')}</Label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: t('filter.all') },
                { value: 'F', label: t('filter.women') },
                { value: 'M', label: t('filter.men') },
              ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFiltersChange({ ...filters, gender: opt.value })}
                className={`flex-1 rounded-xl border-2 h-[60px] text-center text-lg font-bold transition-all ${
                  filters.gender === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
            </div>
          </div>

          {/* Looking for */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">{t('filter.relationType')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: t('filter.everything') },
                { value: 'marriage', label: t('filter.marriage') },
                { value: 'relation', label: t('filter.relationship') },
                { value: 'casual', label: t('filter.casual') },
                { value: 'amitié', label: t('filter.friendship') },
                { value: 'business', label: t('filter.business') },
              ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFiltersChange({ ...filters, lookingFor: opt.value })}
                className={`flex-1 rounded-xl border-2 h-[60px] text-center text-xs font-bold transition-all px-1 ${
                  filters.lookingFor === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
            </div>
          </div>

          {/* Advanced Filters (filters_plus) */}
          <div className="pt-2 border-t relative">
            <Label className="mb-3 flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="size-4" /> Filtres Avancés
            </Label>
            
            <div className={cn("space-y-4", !canUseAdvancedFilters && "opacity-50 pointer-events-none filter blur-[1px]")}>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Avec photos uniquement</Label>
                <Switch 
                  checked={filters.withPhotosOnly} 
                  onCheckedChange={(v) => onFiltersChange({ ...filters, withPhotosOnly: v })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Profils vérifiés uniquement</Label>
                <Switch 
                  checked={filters.verifiedOnly} 
                  onCheckedChange={(v) => onFiltersChange({ ...filters, verifiedOnly: v })} 
                />
              </div>
            </div>

            {!canUseAdvancedFilters && (
              <div className="absolute inset-0 flex items-center justify-center z-10 top-8">
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-primary/20 text-center max-w-[220px] shadow-2xl">
                  <Lock className="size-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-[11px] text-white/90 font-bold mb-3 leading-tight">
                    Débloque les filtres avancés pour trouver plus précisément
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold h-8 text-[10px]"
                    onClick={async () => {
                      if (!currentUser) return
                      const cost = 2 // filters_plus cost
                      if (balance < cost) {
                        setShowInsufficientBalance({ action: 'filters_plus', cost })
                        return
                      }
                      const success = await spendCredits(currentUser.id, 'filters_plus')
                      if (success) {
                        await fetchBalance(currentUser.id)
                        await fetchActiveFeatures(currentUser.id)
                      }
                    }}
                  >
                    Débloquer (2 CC)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            size="xl"
            className="w-full rounded-xl border-2"
            onClick={resetFilters}
          >
            <RotateCcw className="mr-2 size-5" /> {t('filter.reset')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
