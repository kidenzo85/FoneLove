'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Coins, Gift, Plus, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export function PacksConfigTable() {
  const [packs, setPacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<any>(null)
  
  // Form state
  const [formCurrency, setFormCurrency] = useState<'CC' | 'FL'>('CC')
  const [formPackKey, setFormPackKey] = useState('')
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState(0)
  const [formBonusAmount, setFormBonusAmount] = useState(0)
  const [formPriceEur, setFormPriceEur] = useState(0)
  const [formPriceXaf, setFormPriceXaf] = useState(0)

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/admin/packs')
      if (res.ok) {
        const data = await res.json()
        if (data.packs) setPacks(data.packs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/packs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current })
      })
      fetchPacks()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce pack ?')) return
    try {
      await fetch(`/api/admin/packs?id=${id}`, { method: 'DELETE' })
      fetchPacks()
    } catch (e) {
      console.error(e)
    }
  }

  const openAddDialog = (currency: 'CC' | 'FL') => {
    setEditingPack(null)
    setFormCurrency(currency)
    setFormPackKey('')
    setFormName('')
    setFormAmount(0)
    setFormBonusAmount(0)
    setFormPriceEur(0)
    setFormPriceXaf(0)
    setIsDialogOpen(true)
  }

  const openEditDialog = (pack: any) => {
    setEditingPack(pack)
    setFormCurrency(pack.currency)
    setFormPackKey(pack.packKey)
    setFormName(pack.name)
    setFormAmount(pack.amount)
    setFormBonusAmount(pack.bonusAmount)
    setFormPriceEur(pack.priceEur || 0)
    setFormPriceXaf(pack.priceXaf || 0)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      currency: formCurrency,
      packKey: formPackKey,
      name: formName,
      amount: formAmount,
      bonusAmount: formBonusAmount,
      priceEur: formPriceEur,
      priceXaf: formPriceXaf,
    }

    try {
      if (editingPack) {
        await fetch('/api/admin/packs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPack.id, ...payload })
        })
      } else {
        await fetch('/api/admin/packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      setIsDialogOpen(false)
      fetchPacks()
    } catch (e) {
      console.error(e)
    }
  }

  const ccPacks = packs.filter(p => p.currency === 'CC')
  const flPacks = packs.filter(p => p.currency === 'FL')

  return (
    <>
      <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="size-5" /> Tarifs et Packs (ConnectCoins & FoneLove)
          </CardTitle>
          <CardDescription>Configure les prix des pièces (CC) et FoneLove pour tes utilisateurs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Packs CC */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Coins className="size-4 text-purple-500" /> Packs ConnectCoins (CC)</h3>
              <Button variant="outline" size="sm" onClick={() => openAddDialog('CC')}><Plus className="size-4 mr-2" /> Ajouter</Button>
            </div>
            <div className="space-y-4">
              {ccPacks.map(pack => (
                <div key={pack.id} className="border p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-base">{pack.name} ({pack.packKey})</h4>
                      <p className="text-sm text-muted-foreground">{pack.amount} CC {pack.bonusAmount > 0 && `+ ${pack.bonusAmount} offerts`}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{pack.priceEur} €</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={pack.isActive} onCheckedChange={() => handleToggle(pack.id, pack.isActive)} />
                      <span className={pack.isActive ? 'text-green-600' : 'text-muted-foreground'}>{pack.isActive ? 'Visible' : 'Caché'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(pack)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(pack.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {ccPacks.length === 0 && !loading && <div className="text-center p-4 border border-dashed text-muted-foreground">Aucun pack CC trouvé.</div>}
            </div>
          </div>

          <Separator />

          {/* Packs FoneLove */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Gift className="size-4 text-pink-500" /> Packs FoneLove</h3>
              <Button variant="outline" size="sm" onClick={() => openAddDialog('FL')}><Plus className="size-4 mr-2" /> Ajouter</Button>
            </div>
            <div className="space-y-4">
              {flPacks.map(pack => (
                <div key={pack.id} className="border p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-base">{pack.name} ({pack.packKey})</h4>
                      <p className="text-sm text-muted-foreground">{pack.amount} FoneLove</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-pink-600">{pack.priceXaf} FCFA</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={pack.isActive} onCheckedChange={() => handleToggle(pack.id, pack.isActive)} />
                      <span className={pack.isActive ? 'text-green-600' : 'text-muted-foreground'}>{pack.isActive ? 'Visible' : 'Caché'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(pack)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(pack.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {flPacks.length === 0 && !loading && <div className="text-center p-4 border border-dashed text-muted-foreground">Aucun pack FoneLove trouvé.</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPack ? 'Modifier le pack' : 'Ajouter un pack'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du pack (ex: Découverte, 5 FoneLove)</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nom du pack" />
            </div>
            <div className="space-y-2">
              <Label>Identifiant (ex: decouverte, fonelove_5)</Label>
              <Input value={formPackKey} onChange={e => setFormPackKey(e.target.value)} placeholder="Identifiant unique" disabled={!!editingPack} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant de base</Label>
                <Input type="number" value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} />
              </div>
              {formCurrency === 'CC' && (
                <div className="space-y-2">
                  <Label>Bonus offert</Label>
                  <Input type="number" value={formBonusAmount} onChange={e => setFormBonusAmount(Number(e.target.value))} />
                </div>
              )}
            </div>
            {formCurrency === 'CC' ? (
              <div className="space-y-2">
                <Label>Prix en EUR (€)</Label>
                <Input type="number" step="0.01" value={formPriceEur} onChange={e => setFormPriceEur(Number(e.target.value))} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Prix en FCFA (XAF)</Label>
                <Input type="number" value={formPriceXaf} onChange={e => setFormPriceXaf(Number(e.target.value))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
