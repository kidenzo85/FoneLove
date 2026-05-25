'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search, DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export function AdminPaymentsTable() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments')
      if (res.ok) {
        const data = await res.json()
        if (data.payments) setPayments(data.payments)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/payments/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Paiement résolu",
          description: "Le paiement a été validé et l'utilisateur a été crédité avec succès.",
        })
        fetchPayments()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue.",
          variant: "destructive"
        })
      }
    } catch (e) {
      console.error(e)
      toast({
        title: "Erreur",
        description: "Une erreur réseau est survenue.",
        variant: "destructive"
      })
    } finally {
      setResolvingId(null)
    }
  }

  const filtered = payments.filter(p => {
    const s = search.toLowerCase()
    return (
      (p.appTransactionRef || '').toLowerCase().includes(s) ||
      (p.user?.email || '').toLowerCase().includes(s) ||
      (p.user?.firstName || '').toLowerCase().includes(s) ||
      (p.coolpayRef || '').toLowerCase().includes(s)
    )
  })

  return (
    <>
      <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="size-5" /> Gestion des Paiements
          </CardTitle>
          <CardDescription>Visualise l'historique des paiements et force la validation des commandes en échec ou bloquées.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher (Email, Nom, Réf...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchPayments} disabled={loading}>
              Rafraîchir
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Chargement des paiements...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Aucun paiement trouvé.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">{payment.appTransactionRef}</div>
                        {payment.coolpayRef && <div className="text-[10px] text-muted-foreground font-mono">CP: {payment.coolpayRef}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{payment.user?.firstName} {payment.user?.lastName}</div>
                        <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{payment.packType}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {payment.amountXAF} FCFA<br/>
                        <span className="text-xs text-amber-500">{payment.ccAmount} CC</span>
                      </TableCell>
                      <TableCell>
                        {payment.status === 'success' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle className="size-3 mr-1"/> Succès</Badge>
                        ) : payment.status === 'failed' ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="size-3 mr-1"/> Échoué</Badge>
                        ) : payment.status === 'cancelled' ? (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><AlertCircle className="size-3 mr-1"/> Annulé</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="size-3 mr-1"/> {payment.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status !== 'success' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setResolvingId(payment.id)}
                            className="text-xs h-8"
                          >
                            Forcer Succès
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!resolvingId} onOpenChange={(open) => !open && setResolvingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Manuelle du Paiement</DialogTitle>
            <DialogDescription>
              Es-tu sûr de vouloir forcer ce paiement en succès ?<br/><br/>
              <strong>Cette action est irréversible.</strong> Elle va créditer l'utilisateur du montant de pièces (CC ou FoneLove) correspondant au pack acheté, exactement comme si CoolPay avait validé le paiement avec succès.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setResolvingId(null)}>Annuler</Button>
            <Button variant="default" onClick={() => resolvingId && handleResolve(resolvingId)}>
              Confirmer et Créditer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
