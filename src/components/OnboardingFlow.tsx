'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Camera, Sparkles, Check, User, Phone, Heart, MapPin, Search, Globe, ChevronDown, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAppStore, type UserProfile } from '@/lib/store'
import { searchCities, type WorldCity } from '@/lib/world-cities'
import { COUNTRIES, searchCountries, getCountryByCode, formatPhoneWithCountry, type Country } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import { optimizeImage } from '@/lib/image-optimizer'
import { uploadToImgBB } from '@/lib/imgbb'
import { CityAutocomplete } from '@/components/CityAutocomplete'

const INTEREST_KEYS = [
  'interest.music', 'interest.cinema', 'interest.photo', 'interest.art', 'interest.sport',
  'interest.cooking', 'interest.travel', 'interest.reading', 'interest.gaming', 'interest.yoga',
  'interest.wine', 'interest.coffee', 'interest.nature', 'interest.dance', 'interest.guitar',
  'interest.beach', 'interest.hiking', 'interest.theater', 'interest.animals', 'interest.tech',
  'interest.concerts', 'interest.surf', 'interest.painting', 'interest.bike', 'interest.writing',
]

const PROMPTS_OPTIONS = [
  { questionKey: 'prompt.talent', answer: '' },
  { questionKey: 'prompt.cantLive', answer: '' },
  { questionKey: 'prompt.adventure', answer: '' },
  { questionKey: 'prompt.guiltyPleasure', answer: '' },
  { questionKey: 'prompt.laugh', answer: '' },
  { questionKey: 'prompt.comfort', answer: '' },
]

const LOOKING_FOR_GENDER_OPTIONS = [
  { value: 'F', labelKey: 'onboard.women', emoji: '👩' },
  { value: 'M', labelKey: 'onboard.men', emoji: '👨' },
  { value: 'all', labelKey: 'onboard.everyone', emoji: '💫' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'marriage', labelKey: 'onboard.marriage', emoji: '💍' },
  { value: 'relation', labelKey: 'onboard.serious', emoji: '❤️' },
  { value: 'casual', labelKey: 'onboard.casual', emoji: '🔥' },
  { value: 'amitié', labelKey: 'onboard.friendship', emoji: '🤝' },
  { value: 'business', labelKey: 'onboard.business', emoji: '💼' },
]

interface OnboardingFlowProps {
  onComplete: (user: UserProfile) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { t } = useT()
  const { onboardingStep, setOnboardingStep, currentUser, setFilters, filters, config } = useAppStore()
  const [step, setStep] = useState(onboardingStep || 0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    gender: '',
    birthDate: '',
    lookingForGender: '',
    lookingFor: 'relation',
    city: '',
    cityData: null as WorldCity | null,
    countryCode: 'FR',
    phoneCountryCode: '+33',
    phoneLocal: '',
    photos: [] as string[],
    bio: '',
    selectedPrompts: [] as number[],
    promptAnswers: {} as Record<number, string>,
    selectedInterests: [] as string[],
    otp: '',
  })

  // Pre-fill form with existing user data if available
  useEffect(() => {
    if (currentUser && !formData.firstName && !formData.gender) {
      const initialFormData = {
        ...formData,
        firstName: currentUser.firstName || formData.firstName,
        gender: currentUser.gender || formData.gender,
        birthDate: currentUser.birthDate || formData.birthDate,
        bio: currentUser.bio || formData.bio,
        photos: currentUser.photos?.map(p => p.url) || formData.photos,
        selectedInterests: currentUser.interests || formData.selectedInterests,
        lookingForGender: currentUser.lookingForGender || formData.lookingForGender,
        lookingFor: currentUser.lookingFor || formData.lookingFor,
        city: currentUser.city || formData.city,
      };

      setFormData(initialFormData)

      // Calcul de la première étape non complétée
      const calculateUncompletedStep = (data: typeof formData) => {
        if (!(data.firstName && data.gender)) return 0;
        if (!data.lookingForGender) return 1;
        if (!data.lookingFor) return 2;
        if (!data.city) return 3;
        if (data.photos.length < 2) return 4;
        // Step 5 est optionnel (bio & prompts)
        if (data.selectedInterests.length < 3) return 6;
        if (config.requirePhoneVerification) {
          if (data.otp !== '1234') return 7;
        } else {
          if (data.phoneLocal.replace(/\s/g, '').length < 6) return 7;
        }
        return 7; // Dernière étape
      };

      const missingStep = calculateUncompletedStep(initialFormData);
      if (missingStep > step) {
        setStep(missingStep);
        setOnboardingStep(missingStep);
      }
    }
  }, [currentUser, config.requirePhoneVerification])

  // Détection automatique du pays de l'utilisateur
  useEffect(() => {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale
      const regionMatch = locale.match(/-([A-Z]{2})$/i)
      if (regionMatch) {
        const code = regionMatch[1].toUpperCase()
        const country = getCountryByCode(code)
        if (country) {
          setFormData(prev => {
            if (prev.countryCode === 'FR' && prev.phoneCountryCode === '+33' && !prev.phoneLocal) {
              return {
                ...prev,
                countryCode: code,
                phoneCountryCode: country.dialCode
              }
            }
            return prev
          })
        }
      }
    } catch (e) {
      // Ignore si la détection échoue
    }
  }, [])
  const [direction, setDirection] = useState(1)

  const totalSteps = 8
  const progress = ((step + 1) / totalSteps) * 100

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep(step + 1)
      setOnboardingStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
      setOnboardingStep(step - 1)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter((i) => i !== interest)
        : prev.selectedInterests.length < 8
          ? [...prev.selectedInterests, interest]
          : prev.selectedInterests,
    }))
  }

  const togglePrompt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedPrompts: prev.selectedPrompts.includes(index)
        ? prev.selectedPrompts.filter((i) => i !== index)
        : prev.selectedPrompts.length < 3
          ? [...prev.selectedPrompts, index]
          : prev.selectedPrompts,
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const remainingSlots = 9 - formData.photos.length
      const filesToProcess = Array.from(files).slice(0, remainingSlots)
      
      setIsUploadingPhotos(true)
      const newPhotos: string[] = []
      
      try {
        for (const file of filesToProcess) {
          const optimizedFile = await optimizeImage(file)
          const result = await uploadToImgBB(optimizedFile, `fonelove_onboard_${Date.now()}`)
          if (result.success) {
            newPhotos.push(result.data.url)
          }
        }

        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos].slice(0, 9),
        }))
      } catch (error) {
        console.error("Erreur lors de l'upload de la photo", error)
      } finally {
        setIsUploadingPhotos(false)
      }
    }
  }

  const handleComplete = () => {
    const profileScore = Math.min(100, 20 + formData.photos.length * 10 + (formData.bio ? 10 : 0) + formData.selectedInterests.length * 5 + formData.selectedPrompts.length * 5 + (formData.city ? 5 : 0) + (formData.phoneLocal ? 5 : 0))

    const fullPhone = formatPhoneWithCountry(formData.phoneLocal, formData.phoneCountryCode)

    const user: UserProfile = {
      id: currentUser?.id || 'new-user',
      email: currentUser?.email || `${formData.firstName.toLowerCase()}@fonelove.fr`,
      phone: fullPhone || currentUser?.phone || '+33698765432',
      firstName: formData.firstName || currentUser?.firstName || t('onboard.defaultName'),
      gender: formData.gender,
      birthDate: formData.birthDate,
      bio: formData.bio,
      isVerified: true,
      isPremium: false,
      profileScore,
      streakDays: 1,
      dailyBoostUsed: false,
      lookingFor: formData.lookingFor,
      lookingForGender: formData.lookingForGender,
      city: formData.city,
      countryCode: formData.countryCode,
      mood: t('onboard.defaultMood'),
      photos: formData.photos.map((url, i) => ({
        id: `photo-${i}`,
        url,
        position: i,
        isPrimary: i === 0,
      })),
      interests: formData.selectedInterests,
      prompts: formData.selectedPrompts.map((idx) => ({
        id: `prompt-${idx}`,
        question: t(PROMPTS_OPTIONS[idx].questionKey),
        answer: formData.promptAnswers[idx] || '',
      })),
      badges: currentUser?.badges || [{ id: 'verified', type: 'verified', earnedAt: new Date().toISOString() }],
    }

    // Update filters to match onboarding choices
    setFilters({
      ...filters,
      gender: formData.lookingForGender,
      lookingFor: formData.lookingFor,
    })

    onComplete(user)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  // Validation for each step
  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 0: return !!(formData.firstName && formData.gender)
      case 1: return !!formData.lookingForGender
      case 2: return !!formData.lookingFor
      case 3: return !!formData.city
      case 4: return formData.photos.length >= 2
      case 5: return true // Bio is optional
      case 6: return formData.selectedInterests.length >= 3
      case 7: 
        if (config.requirePhoneVerification) {
          return formData.otp === '1234'
        }
        return formData.phoneLocal.replace(/\s/g, '').length >= 6
      default: return true
    }
  }

  const getSkipDefaults = () => {
    const defaults: Record<string, string> = {}
    if (!formData.firstName) defaults.firstName = t('onboard.defaultName')
    if (!formData.gender) defaults.gender = t('onboard.defaultGender')
    if (!formData.lookingForGender) defaults.lookingForGender = 'all'
    return defaults
  }

  return (
    <div className="flex h-dvh flex-col bg-background overflow-hidden relative">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-2 safe-area-top">
        <div className="flex items-center gap-3 mb-2">
          {step > 0 && (
            <button onClick={prevStep} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="size-5" />
            </button>
          )}
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground">{step + 1}/{totalSteps}</span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 pb-48">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {/* ====== STEP 0: Qui es-tu ? ====== */}
            {step === 0 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.whoAreYou')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.tellAboutYou')}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">{t('onboard.firstName')}</Label>
                    <Input
                      id="firstName"
                      placeholder={t('onboard.firstNamePlaceholder')}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1.5 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">{t('onboard.age') || 'Quel âge as-tu ?'}</Label>
                    <select
                      id="age"
                      value={formData.birthDate ? new Date().getFullYear() - new Date(formData.birthDate).getFullYear() : ''}
                      onChange={(e) => {
                        const age = parseInt(e.target.value);
                        if (!isNaN(age)) {
                          const year = new Date().getFullYear() - age;
                          setFormData({ ...formData, birthDate: `${year}-01-01` });
                        }
                      }}
                      className="mt-1.5 flex h-14 w-full items-center justify-between rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>{t('onboard.selectAge') || 'Sélectionne ton âge'}</option>
                      {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age}>{age} ans</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>{t('onboard.gender')}</Label>
                    <div className="mt-2 flex gap-2">
                      {['M', 'F', 'Autre'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={cn(
                            'flex-1 rounded-xl border-2 py-3 text-center font-medium transition-all',
                            formData.gender === g
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {g === 'M' ? t('onboard.male') : g === 'F' ? t('onboard.female') : t('onboard.other')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== STEP 1: Sex recherché ====== */}
            {step === 1 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10">
                    <Heart className="size-8 text-pink-500" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.whoYouLookingFor')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.whoYouLookingForHint')}</p>
                </div>

                <div className="space-y-3">
                  {LOOKING_FOR_GENDER_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setFormData({ ...formData, lookingForGender: opt.value })
                        setTimeout(nextStep, 400)
                      }}
                      className={cn(
                        'w-full rounded-2xl border-2 p-4 text-left transition-all flex items-center gap-4',
                        formData.lookingForGender === opt.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-all',
                        formData.lookingForGender === opt.value
                          ? 'bg-primary/10 scale-110'
                          : 'bg-muted'
                      )}>
                        {opt.emoji}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'font-semibold text-base',
                          formData.lookingForGender === opt.value ? 'text-primary' : 'text-foreground'
                        )}>
                          {t(opt.labelKey)}
                        </p>
                      </div>
                      {formData.lookingForGender === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                        >
                          <Check className="size-4" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {formData.lookingForGender && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {formData.lookingForGender === 'F' && t('onboard.hintWomen')}
                    {formData.lookingForGender === 'M' && t('onboard.hintMen')}
                    {formData.lookingForGender === 'all' && t('onboard.hintAll')}
                  </motion.p>
                )}
              </div>
            )}

            {/* ====== STEP 2: Type de relation (NEW) ====== */}
            {step === 2 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.lookingForTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.lookingForHint')}</p>
                </div>

                <div className="space-y-3">
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setFormData({ ...formData, lookingFor: opt.value })
                        setTimeout(nextStep, 400)
                      }}
                      className={cn(
                        'w-full rounded-2xl border-2 p-4 text-left transition-all flex items-center gap-4',
                        formData.lookingFor === opt.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-all',
                        formData.lookingFor === opt.value
                          ? 'bg-primary/10 scale-110'
                          : 'bg-muted'
                      )}>
                        {opt.emoji}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'font-semibold text-base',
                          formData.lookingFor === opt.value ? 'text-primary' : 'text-foreground'
                        )}>
                          {t(opt.labelKey)}
                        </p>
                      </div>
                      {formData.lookingFor === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                        >
                          <Check className="size-4" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                    <MapPin className="size-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.whereYouLive')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.whereYouLiveHint')}</p>
                </div>
                <CityAutocomplete
                  value={formData.city}
                  onSelect={(city, cc) => setFormData({ ...formData, city, countryCode: cc })}
                />
              </div>
            )}

            {/* ====== STEP 4: Photos ====== */}
            {step === 4 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.photos')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.photosHint')}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploadingPhotos}
                  />
                  {Array.from({ length: 9 }).map((_, i) => {
                    const hasPhoto = i < formData.photos.length
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (isUploadingPhotos) return
                          if (!hasPhoto) {
                            fileInputRef.current?.click()
                          } else {
                            // Option to remove photo
                            setFormData(prev => ({
                              ...prev,
                              photos: prev.photos.filter((_, idx) => idx !== i)
                            }))
                          }
                        }}
                        className={cn(
                          'aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden relative group',
                          hasPhoto ? 'border-primary' : 'border-border hover:border-primary/50',
                          isUploadingPhotos && !hasPhoto ? 'opacity-50 cursor-not-allowed' : ''
                        )}
                      >
                        {hasPhoto ? (
                          <>
                            <img src={formData.photos[i]} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <X className="size-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <Camera className="size-6 text-muted-foreground" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <p className="text-center text-xs text-muted-foreground">{t('onboard.photosHintReal') || "Appuie sur un carré pour ajouter une vraie photo"}</p>
              </div>
            )}

            {/* ====== STEP 5: Bio + Prompts ====== */}
            {step === 5 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.aboutYou')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.aboutYouHint')}</p>
                </div>
                <div>
                  <Label htmlFor="bio">{t('onboard.bio')}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t('onboard.bioPlaceholder')}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1.5 min-h-[100px] text-base"
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{formData.bio.length}/500</p>
                </div>
                <div>
                  <Label>{t('onboard.choosePrompts')}</Label>
                  <div className="mt-2 space-y-2">
                    {PROMPTS_OPTIONS.map((prompt, i) => {
                      const isSelected = formData.selectedPrompts.includes(i)
                      return (
                        <button
                          key={i}
                          onClick={() => togglePrompt(i)}
                          className={cn(
                            'w-full rounded-xl border-2 p-3 text-left transition-all',
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          )}
                        >
                          <p className="text-sm font-medium">{t(prompt.questionKey)}</p>
                          {isSelected && (
                            <input
                              placeholder={t('onboard.yourAnswer')}
                              className="mt-2 w-full rounded-lg bg-muted px-3 py-2 text-base outline-none"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  promptAnswers: { ...formData.promptAnswers, [i]: e.target.value },
                                })
                              }
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ====== STEP 6: Intérêts ====== */}
            {step === 6 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.interests')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.interestsHint')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_KEYS.map((key) => {
                    const isSelected = formData.selectedInterests.includes(key)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleInterest(key)}
                        className={cn(
                          'rounded-full border-2 px-3 py-2 text-sm transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {isSelected && <Check className="mr-1 inline size-3" />}
                        {t(key)}
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {formData.selectedInterests.length}/8 {t('onboard.selected')}
                </p>
              </div>
            )}

            {/* ====== STEP 7: Téléphone + Vérification ====== */}
            {step === 7 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{t('onboard.yourPhone')}</h2>
                  <p className="text-sm text-muted-foreground">{t('onboard.yourPhoneHint')}</p>
                </div>

                <PhoneInputStep
                  countryCode={formData.phoneCountryCode}
                  localNumber={formData.phoneLocal}
                  onCountryCodeChange={(code) => setFormData({ ...formData, phoneCountryCode: code })}
                  onLocalNumberChange={(num) => setFormData({ ...formData, phoneLocal: num })}
                />

                {/* OTP Verification - Only if required by admin */}
                {config.requirePhoneVerification && formData.phoneLocal.replace(/\s/g, '').length >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="pt-2">
                      <p className="text-sm font-medium text-center mb-3">{t('onboard.smsVerification')}</p>
                      <div className="mx-auto max-w-xs space-y-4">
                        <InputOTP maxLength={4} value={formData.otp} onChange={(v) => setFormData({ ...formData, otp: v })}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                        <p className="text-center text-xs text-muted-foreground">
                          {t('onboard.demoCode')}
                        </p>
                        {formData.otp === '1234' && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center justify-center gap-2 text-green-500"
                          >
                            <Check className="size-5" />
                            <span className="font-medium">{t('onboard.verifiedSuccess')}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Simplified message if verification is disabled */}
                {!config.requirePhoneVerification && formData.phoneLocal.replace(/\s/g, '').length >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-green-500 py-4 bg-green-500/5 rounded-2xl border border-green-500/20"
                  >
                    <CheckCircle className="size-5" />
                    <span className="font-bold">{t('onboard.phoneReady')}</span>
                  </motion.div>
                )}

                {/* Profile score preview */}
                <div className="rounded-2xl border bg-card p-3">
                  <h4 className="mb-1 text-xs font-semibold">{t('onboard.profileScore')}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-primary">
                      <span className="text-sm font-bold text-primary">
                        {Math.min(100, 20 + formData.photos.length * 10 + (formData.bio ? 10 : 0) + formData.selectedInterests.length * 5 + formData.selectedPrompts.length * 5 + (formData.city ? 5 : 0) + (formData.phoneLocal ? 5 : 0))}%
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.firstName ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('onboard.firstName')}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.lookingForGender ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('onboard.research')}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.city ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('editor.city')}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.photos.length >= 2 ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('onboard.photosMin', { n: formData.photos.length })}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.bio ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('onboard.bio')}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className={formData.selectedInterests.length >= 3 ? 'size-3 text-green-500' : 'size-3 text-muted-foreground'} /> {t('onboard.interestsMin', { n: formData.selectedInterests.length })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Upload Loading State */}
      <AnimatePresence>
        {isUploadingPhotos && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-background/95 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl border-2 border-primary/30 w-max max-w-[90vw]"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="font-bold text-foreground text-sm truncate">
              {t('onboard.uploadingPhoto') || 'Ajout de ta photo en cours...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom action - Ultra-accessible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl px-6 pt-4 pb-6 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-border/50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}>
        {step < totalSteps - 1 ? (
          <>
            <Button
              size="xl"
              className={cn(
                "w-full rounded-2xl text-white shadow-xl transition-all duration-300 relative overflow-hidden",
                isStepValid(step) 
                  ? "bg-gradient-to-r from-primary to-pink-500 hover:shadow-primary/25 hover:scale-[1.02] active:scale-95" 
                  : "bg-muted-foreground/20 text-muted-foreground opacity-70 cursor-not-allowed"
              )}
              onClick={nextStep}
              disabled={!isStepValid(step)}
            >
              <span className="text-xl font-black relative z-10 flex items-center justify-center gap-1">
                {t('onboard.continue')} <ChevronRight className="size-6" />
              </span>
            </Button>
            
            {/* Validation hints with simplified language */}
            {step === 0 && (!formData.firstName || !formData.gender) && (
              <p className="text-center text-sm font-medium text-primary animate-pulse">
                👇 {t('onboard.fillNameGender')}
              </p>
            )}

            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground font-bold"
              onClick={() => {
                const defaults = getSkipDefaults()
                setFormData((prev) => ({
                  ...prev,
                  ...defaults,
                  selectedInterests: prev.selectedInterests.length >= 3
                    ? prev.selectedInterests
                    : [...prev.selectedInterests, 'interest.tech', 'interest.cinema', 'interest.travel'],
                }))
                nextStep()
              }}
            >
              {t('onboard.skipStep')} ⏭️
            </Button>
          </>
        ) : (
          <>
            <Button
              size="xl"
              className={cn(
                "w-full rounded-2xl text-white shadow-xl transition-all duration-300",
                (config.requirePhoneVerification ? formData.otp === '1234' : formData.phoneLocal.replace(/\s/g, '').length >= 6)
                  ? "bg-gradient-to-r from-primary to-pink-500 hover:shadow-primary/25 hover:scale-[1.02] active:scale-95"
                  : "bg-muted-foreground/20 text-muted-foreground opacity-70 cursor-not-allowed"
              )}
              onClick={handleComplete}
              disabled={config.requirePhoneVerification ? formData.otp !== '1234' : formData.phoneLocal.replace(/\s/g, '').length < 6}
            >
              <Sparkles className="mr-2 size-6" /> <span className="text-xl font-black">{t('onboard.letsGo')}</span>
            </Button>
            {config.requirePhoneVerification && (
              <Button
                variant="ghost"
                className="w-full h-12 text-muted-foreground font-bold"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, otp: '1234' }))
                  setTimeout(handleComplete, 100)
                }}
              >
                {t('onboard.skipVerify')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Phone Input Component (with country code selector)
// ============================================================
function PhoneInputStep({
  countryCode,
  localNumber,
  onCountryCodeChange,
  onLocalNumberChange,
}: {
  countryCode: string
  localNumber: string
  onCountryCodeChange: (code: string) => void
  onLocalNumberChange: (num: string) => void
}) {
  const { t } = useT()
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [countryQuery, setCountryQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const currentCountry = COUNTRIES.find((c) => c.dialCode === countryCode)
  const countryResults = useMemo(() => {
    if (!countryQuery) return COUNTRIES.slice(0, 30) // Show popular first
    return searchCountries(countryQuery).slice(0, 30)
  }, [countryQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCountryPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelectCountry = (country: Country) => {
    onCountryCodeChange(country.dialCode)
    setShowCountryPicker(false)
    setCountryQuery('')
  }

  // Format display of the full phone number
  const fullNumber = formatPhoneWithCountry(localNumber, countryCode)

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Country code selector */}
      <div>
        <Label>{t('onboard.countryCode')}</Label>
        <button
          onClick={() => setShowCountryPicker(!showCountryPicker)}
          className="mt-1.5 w-full flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:border-primary/50 transition-all"
        >
          <span className="text-lg">{currentCountry?.flag || '🌍'}</span>
          <span className="flex-1 text-left">{currentCountry?.name || t('onboard.chooseCountry')}</span>
          <span className="font-mono text-primary font-semibold">{countryCode}</span>
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', showCountryPicker && 'rotate-180')} />
        </button>
      </div>

      {/* Country picker dropdown */}
      <AnimatePresence>
        {showCountryPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-popover shadow-lg max-h-[260px] overflow-hidden">
              <div className="sticky top-0 bg-popover p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('onboard.searchCountry')}
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[200px]">
                {countryResults.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelectCountry(country)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                      country.dialCode === countryCode && 'bg-primary/5'
                    )}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-left truncate">{country.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{country.dialCode}</span>
                    {country.dialCode === countryCode && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local phone number input */}
      <div>
        <Label htmlFor="phoneLocal">{t('onboard.localNumber')}</Label>
        <div className="mt-1.5 flex items-center gap-0">
          <div className="flex items-center gap-1 rounded-l-xl border border-r-0 bg-muted px-3 py-3 text-sm font-mono text-muted-foreground">
            <span>{currentCountry?.flag || '🌍'}</span>
            <span className="font-semibold text-foreground">{countryCode}</span>
          </div>
          <input
            id="phoneLocal"
            type="tel"
            placeholder="6 12 34 56 78"
            value={localNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d\s]/g, '')
              onLocalNumberChange(val)
            }}
            className="flex-1 rounded-r-xl border bg-background px-4 py-3 text-base font-mono outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
        </div>
        {localNumber && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 text-xs text-muted-foreground"
          >
            {t('onboard.fullNumber')} : <span className="font-mono text-primary">{fullNumber}</span>
          </motion.p>
        )}
      </div>
    </div>
  )
}
