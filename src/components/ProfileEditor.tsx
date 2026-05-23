import { useState, useRef } from 'react'
import { Camera, Pencil, Plus, X, Check, Trash2, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { type ProfileWithDetails, type PromptItem, type PhoneItem } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import { optimizeImage } from '@/lib/image-optimizer'
import { CityAutocomplete } from '@/components/CityAutocomplete'

const INTERESTS = [
  'interest.music', 'interest.cinema', 'interest.photo', 'interest.art', 'interest.sport',
  'interest.cooking', 'interest.travel', 'interest.reading', 'interest.gaming', 'interest.yoga',
  'interest.wine', 'interest.coffee', 'interest.nature', 'interest.dance', 'interest.guitar',
  'interest.beach', 'interest.hiking', 'interest.theater', 'interest.animals', 'interest.tech',
]

const PROMPTS_OPTIONS = [
  { questionKey: 'prompt.talent' },
  { questionKey: 'prompt.cantLive' },
  { questionKey: 'prompt.adventure' },
  { questionKey: 'prompt.guiltyPleasure' },
  { questionKey: 'prompt.laugh' },
  { questionKey: 'prompt.comfort' },
]

interface ProfileEditorProps {
  profile: ProfileWithDetails
  onSave: (updates: Partial<ProfileWithDetails>) => void
  onClose: () => void
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const { t } = useT()
  const [editing, setEditing] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    birthDate: profile.birthDate || '',
    gender: profile.gender || '',
    lookingForGender: profile.lookingForGender || '',
    lookingFor: profile.lookingFor || '',
    bio: profile.bio || '',
    city: profile.city || '',
    countryCode: profile.countryCode || '',
    jobTitle: profile.jobTitle || '',
    company: profile.company || '',
    education: profile.education || '',
    interests: profile.interests || [],
    prompts: profile.prompts || [],
    phoneType: profile.phoneType || 'both',
    otherPhones: profile.otherPhones || [],
    newPhone: '',
    newPhoneType: 'both' as const,
  })

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 8 ? [...prev.interests, interest] : prev.interests,
    }))
  }

  const handleSave = () => {
    // Calculate new profile score (similar to OnboardingFlow)
    const score = Math.min(100, 
      20 + 
      (profile.photos?.length || 0) * 10 + 
      (form.bio ? 10 : 0) + 
      (form.interests.length * 5) + 
      (form.prompts.length * 5) + 
      (form.city ? 5 : 0) + 
      5 // phone
    )

    onSave({
      firstName: form.firstName,
      birthDate: form.birthDate,
      gender: form.gender,
      lookingForGender: form.lookingForGender,
      lookingFor: form.lookingFor,
      bio: form.bio,
      city: form.city,
      countryCode: form.countryCode,
      jobTitle: form.jobTitle,
      company: form.company,
      education: form.education,
      interests: form.interests,
      prompts: form.prompts,
      phoneType: form.phoneType as any,
      otherPhones: form.otherPhones,
      profileScore: score,
    })
    setEditing(false)
  }

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const optimizedFile = await optimizeImage(file)
      
      const formData = new FormData()
      formData.append('userId', profile.id)
      formData.append('file', optimizedFile)
      formData.append('position', String(profile.photos?.length || 0))
      formData.append('isPrimary', String(!profile.photos?.length))

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const result = await res.json()
      if (result.photo) {
        onSave({ photos: [...(profile.photos || []), result.photo] })
      }
    } catch (error) {
      console.error('Photo upload error:', error)
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, userId: profile.id }),
      })

      if (res.ok) {
        onSave({ photos: profile.photos?.filter(p => p.id !== photoId) || [] })
      }
    } catch (error) {
      console.error('Delete photo error:', error)
    }
  }

  const addOtherPhone = () => {
    if (form.newPhone.trim() !== '') {
      const newItem: PhoneItem = {
        number: form.newPhone,
        type: form.newPhoneType
      }
      setForm(prev => ({ 
        ...prev, 
        otherPhones: [...prev.otherPhones, newItem], 
        newPhone: '',
        newPhoneType: 'both'
      }))
    }
  }

  const removeOtherPhone = (number: string) => {
    setForm(prev => ({ ...prev, otherPhones: prev.otherPhones.filter(p => p.number !== number) }))
  }

  const updatePrompt = (id: string, answer: string) => {
    setForm(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === id ? { ...p, answer } : p)
    }))
  }

  const PhoneTypeSelector = ({ value, onChange, disabled }: { value: string, onChange: (val: any) => void, disabled?: boolean }) => (
    <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-full">
      {[
        { id: 'direct', icon: <Phone className="size-3.5" />, label: t('phone.direct') },
        { id: 'whatsapp', icon: <MessageSquare className="size-3.5" />, label: t('phone.whatsapp') },
        { id: 'both', icon: <Sparkles className="size-3.5" />, label: 'Les 2' },
      ].map((opt) => (
        <button
          key={opt.id}
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all",
            value === opt.id 
              ? "bg-background text-primary shadow-sm ring-1 ring-black/5" 
              : "text-muted-foreground hover:bg-black/5"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )

  const Sparkles = ({ className }: { className?: string }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Phone className="size-full absolute scale-75 -translate-x-1" />
      <MessageSquare className="size-full absolute scale-75 translate-x-1" />
    </div>
  )

  return (
    <div className="space-y-6 overscroll-y-contain pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('profile.settings') || 'Modifier mon profil'}</h2>
        <Button
          onClick={() => { if (editing) { handleSave() } else { setEditing(true) } }}
          className={cn('rounded-full h-10 px-6', editing ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-foreground hover:bg-muted/80')}
        >
          {editing ? <><Check className="mr-1.5 size-4" /> {t('editor.save') || 'Enregistrer'}</> : <><Pencil className="mr-1.5 size-4" /> {t('editor.edit') || 'Modifier'}</>}
        </Button>
      </div>

      {/* Photos section */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('editor.photos') || 'Photos'}</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {profile.photos?.map((photo) => (
            <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm">
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              {editing && (
                <button 
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
          
          {((profile.photos?.length || 0) < 9) && editing && (
            <>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleAddPhoto} 
                disabled={isUploadingPhoto}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="flex aspect-[3/4] items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all bg-primary/5 hover:bg-primary/10 group"
              >
                {isUploadingPhoto ? (
                  <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus className="size-10 text-primary/40 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Infos de base */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('editor.info') || 'Infos générales'}</h3>

        {editing ? (
          <div className="space-y-4 rounded-3xl border bg-card/50 backdrop-blur-xl p-5 shadow-sm">
            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('editor.firstName') || 'Prénom'}</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="h-12 text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('onboard.age') || 'Quel âge as-tu ?'}</Label>
                <select
                  value={form.birthDate ? new Date().getFullYear() - new Date(form.birthDate).getFullYear() : ''}
                  onChange={(e) => {
                    const age = parseInt(e.target.value);
                    if (!isNaN(age)) {
                      const year = new Date().getFullYear() - age;
                      setForm({ ...form, birthDate: `${year}-01-01` });
                    }
                  }}
                  className="h-12 w-full text-base rounded-2xl bg-muted/30 border-none focus:outline-none focus:ring-2 focus-visible:ring-primary/30 px-4"
                >
                  <option value="" disabled>{t('onboard.selectAge') || 'Sélectionne ton âge'}</option>
                  {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age} ans</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('editor.city') || 'Ville'}</Label>
                <CityAutocomplete
                  value={form.city}
                  onSelect={(city, countryCode) => setForm({ ...form, city, countryCode })}
                  inputClassName="h-12 bg-muted/30 border-none focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('onboard.gender') || 'Genre'}</Label>
              <div className="flex gap-2">
                {['M', 'F', 'Autre'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={cn(
                      'flex-1 rounded-2xl border-2 py-3 text-center font-bold transition-all text-sm',
                      form.gender === g
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border-muted/50 bg-muted/20 text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    {g === 'M' ? '👨 Homme' : g === 'F' ? '👩 Femme' : '✨ Autre'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">Profession</Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="Ex: Fleuriste"
                  className="h-12 text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">Entreprise (Optionnel)</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Ex: Mon entreprise"
                  className="h-12 text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">Études</Label>
              <Input
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder="Ex: École du Paysage"
                className="h-12 text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('editor.bio') || 'Bio'}</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={500}
                className="min-h-[120px] text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30 resize-none p-4"
                placeholder="Raconte un peu qui tu es..."
              />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border bg-card/50 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('editor.firstName') || 'Prénom'}</span>
              <span className="font-bold">{profile.firstName}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('onboard.age') || 'Âge'}</span>
              <span className="font-bold">
                {profile.birthDate ? `${new Date().getFullYear() - new Date(profile.birthDate).getFullYear()} ans` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('onboard.gender') || 'Genre'}</span>
              <span className="font-bold">
                {profile.gender === 'M' ? '👨 Homme' : profile.gender === 'F' ? '👩 Femme' : profile.gender === 'Autre' ? '✨ Autre' : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('editor.city') || 'Ville'}</span>
              <span className="font-bold">{profile.city || '-'}</span>
            </div>
            {(profile.jobTitle || profile.company) && (
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground font-medium">Travail</span>
                <span className="font-bold">{profile.jobTitle} {profile.company && <span className="text-muted-foreground font-normal">@ {profile.company}</span>}</span>
              </div>
            )}
            {profile.education && (
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground font-medium">Études</span>
                <span className="font-bold">{profile.education}</span>
              </div>
            )}
            <div className="pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">{t('editor.bio') || 'Bio'}</span>
              <p className="text-sm font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl italic">"{profile.bio || '-'}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Préférences */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('onboard.lookingForTitle') || 'Recherche'}</h3>
        
        {editing ? (
          <div className="space-y-5 rounded-3xl border bg-card/50 p-5 shadow-sm">
            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-2 block">{t('onboard.whoYouLookingFor') || 'Genre recherché'}</Label>
              <div className="flex gap-2">
                {[
                  { value: 'F', label: '👩 Femmes' },
                  { value: 'M', label: '👨 Hommes' },
                  { value: 'all', label: '💫 Tout' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, lookingForGender: opt.value })}
                    className={cn(
                      'flex-1 rounded-2xl border-2 py-3 text-center font-bold transition-all text-xs',
                      form.lookingForGender === opt.value
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border-muted/50 bg-muted/20 text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-2 block">{t('onboard.lookingForTitle') || 'Type de relation'}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'marriage', label: '💍 Mariage' },
                  { value: 'relation', label: '❤️ Sérieux' },
                  { value: 'casual', label: '🔥 Sans lendemain' },
                  { value: 'amitié', label: '🤝 Amitié' },
                  { value: 'business', label: '💼 Affaires' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, lookingFor: opt.value })}
                    className={cn(
                      'rounded-2xl border-2 py-3.5 px-3 text-center font-bold transition-all text-xs',
                      form.lookingFor === opt.value
                        ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                        : 'border-muted/50 bg-muted/20 text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border bg-card/50 p-5 space-y-4 shadow-sm">
             <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('onboard.whoYouLookingFor') || 'Genre recherché'}</span>
              <span className="font-bold">
                {profile.lookingForGender === 'F' ? '👩 Femmes' : profile.lookingForGender === 'M' ? '👨 Hommes' : profile.lookingForGender === 'all' ? '💫 Tout' : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground font-medium">{t('onboard.lookingForTitle') || 'Type de relation'}</span>
              <span className="font-bold">
                {profile.lookingFor === 'marriage' ? '💍 Mariage' : profile.lookingFor === 'relation' ? '❤️ Sérieux' : profile.lookingFor === 'casual' ? '🔥 Sans lendemain' : profile.lookingFor === 'amitié' ? '🤝 Amitié' : profile.lookingFor === 'business' ? '💼 Affaires' : '-'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Numéros de téléphone */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('editor.phones') || 'Numéros de téléphone'}</h3>
        
        <div className="rounded-3xl border bg-card/50 p-5 space-y-6 shadow-sm">
          {/* Principal */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block px-1">{t('editor.primaryPhone') || 'Numéro principal'}</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-4 border border-white/5 shadow-inner">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Phone className="size-5 text-primary" />
                </div>
                <span className="font-bold text-lg">{profile.phone}</span>
                <Badge variant="outline" className="ml-auto text-[10px] uppercase font-black bg-primary/5 text-primary border-primary/20">Principal</Badge>
              </div>
              {editing && (
                <div className="px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 mb-2 block">{t('phone.type')}</Label>
                  <PhoneTypeSelector value={form.phoneType} onChange={(val) => setForm({...form, phoneType: val})} />
                </div>
              )}
            </div>
          </div>

          {/* Autres numéros */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block px-1">{t('editor.otherPhones') || 'Autres numéros'}</Label>
            
            {form.otherPhones.length > 0 ? (
              <div className="space-y-4">
                {form.otherPhones.map((phone, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white/5 p-4 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-xl">
                          {phone.type === 'whatsapp' ? <MessageSquare className="size-4 text-green-500" /> : <Phone className="size-4 text-primary" />}
                        </div>
                        <span className="font-bold">{phone.number}</span>
                      </div>
                      {editing && (
                        <button onClick={() => removeOtherPhone(phone.number)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    {editing && (
                       <div className="px-1">
                         <PhoneTypeSelector 
                           value={phone.type} 
                           onChange={(val) => {
                             const newList = [...form.otherPhones]
                             newList[idx].type = val
                             setForm({...form, otherPhones: newList})
                           }} 
                         />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            ) : !editing && (
              <p className="text-sm text-muted-foreground italic px-2">Aucun numéro supplémentaire.</p>
            )}

            {editing && (
              <div className="mt-6 space-y-3 pt-4 border-t border-dashed border-muted">
                <Label className="text-[10px] font-black text-primary uppercase tracking-widest block px-1">Ajouter un nouveau numéro</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: +33 6 12 34 56 78"
                    value={form.newPhone}
                    onChange={(e) => setForm({ ...form, newPhone: e.target.value })}
                    className="h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
                  />
                  <Button onClick={addOtherPhone} className="h-12 w-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 shrink-0">
                    <Plus className="size-6" />
                  </Button>
                </div>
                <div className="px-1">
                   <Label className="text-[10px] font-bold text-muted-foreground/60 mb-2 block">Choisir le type pour ce numéro</Label>
                   <PhoneTypeSelector value={form.newPhoneType} onChange={(val) => setForm({...form, newPhoneType: val})} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompts */}
      {profile.prompts && profile.prompts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('editor.prompts') || 'Tes réponses'}</h3>
          <div className="space-y-4">
            {form.prompts.map((prompt) => (
              <div key={prompt.id} className="rounded-3xl border bg-card/50 p-5 space-y-3 shadow-sm border-l-4 border-l-primary">
                <Label className="font-black text-xs text-primary uppercase tracking-tight leading-tight">{prompt.question}</Label>
                {editing ? (
                  <Textarea
                    value={prompt.answer}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    className="min-h-[80px] text-base rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30 resize-none"
                  />
                ) : (
                  <p className="font-bold text-lg leading-snug">"{prompt.answer}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      <div className="pb-10">
        <h3 className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('editor.interests') || "Centres d'intérêt"}</h3>
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((interest) => {
            const isSelected = form.interests.includes(interest)
            if (!editing && !isSelected) return null
            return (
              <button
                key={interest}
                onClick={() => editing && toggleInterest(interest)}
                className={cn(
                  'rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all',
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md shadow-primary/10'
                    : 'border-muted bg-muted/20 text-muted-foreground hover:border-primary/30'
                )}
              >
                {t(interest)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
