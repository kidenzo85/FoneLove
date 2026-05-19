'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, UserX, AlertTriangle, CreditCard, Scale, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="h-[100dvh] w-full overflow-y-auto bg-background flex flex-col relative">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Conditions d'Utilisation</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 px-5 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-2">Les règles du jeu</h2>
          <p className="text-muted-foreground text-sm">
            En utilisant Fonelove, tu acceptes ces conditions. Elles sont là pour protéger notre communauté et définir clairement nos responsabilités mutuelles.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Section 1 */}
          <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-500">1. Strictement +18 ans</h3>
                <p className="text-xs text-red-500/70">Interdit aux mineurs</p>
              </div>
            </div>
            <div className="text-sm text-foreground/80 space-y-3">
              <p>
                <strong>Détails légaux :</strong> Fonelove est une plateforme exclusive aux adultes. En créant un compte, tu certifies avoir <strong>au moins 18 ans</strong> et avoir la pleine capacité juridique. Toute usurpation d'identité ou falsification d'âge entraînera un bannissement définitif et immédiat de nos services.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">2. Comportement et Modération</h3>
                <p className="text-xs text-muted-foreground">Tolérance zéro pour les abus</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Tu es entièrement responsable des contenus (photos, descriptions, messages) que tu publies. Il est strictement interdit de :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Harceler, menacer, ou intimider d'autres utilisateurs.</li>
                <li>Publier du contenu pornographique, violent, ou incitant à la haine.</li>
                <li>Utiliser des fausses photos (Catfishing) ou usurper l'identité d'un tiers.</li>
                <li>Faire de la sollicitation commerciale, du spam, ou proposer des services tarifés (prostitution).</li>
              </ul>
              <p>
                Fonelove se réserve le droit de modérer, suspendre ou clôturer tout compte sans préavis, sans justification, et sans remboursement, si nous estimons que ces règles sont enfreintes.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">3. Paiements et Crédits</h3>
                <p className="text-xs text-muted-foreground">Achats virtuels non remboursables</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Fonelove propose l'achat de "Crédits" ou d'abonnements "Premium" pour débloquer des fonctionnalités spéciales. 
              </p>
              <p>
                <strong>Politique de non-remboursement :</strong> Sauf disposition légale contraire, tous les achats sont définitifs. Aucun remboursement ne sera accordé pour des crédits partiellement utilisés ou si ton compte est banni. Les crédits n'ont aucune valeur monétaire réelle.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">4. Limites de responsabilité</h3>
                <p className="text-xs text-muted-foreground">La sécurité avant tout</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Fonelove est un service de mise en relation virtuel. Nous ne procédons à aucune vérification des antécédents judiciaires de nos membres. 
              </p>
              <p>
                Fonelove décline toute responsabilité concernant les rencontres physiques, les litiges entre utilisateurs, ou tout dommage découlant de l'utilisation du service. Reste vigilant(e) et donne tes rendez-vous dans des lieux publics.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-8 rounded-3xl bg-primary/5 p-6 text-center border border-primary/10">
            <h3 className="font-bold mb-2">Acceptation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              En continuant d'utiliser l'application, tu acceptes l'ensemble de ces conditions générales.
            </p>
            <a href="mailto:fabricewilliam71@gmail.com" className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 active:scale-95 transition-all w-full">
              Nous contacter
            </a>
          </section>
          
          <p className="text-xs text-center text-muted-foreground/50 mt-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Action Button Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent z-50">
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-4 font-black text-lg shadow-[0_10px_40px_rgba(255,255,255,0.15)] active:scale-95 transition-all"
        >
          <CheckCircle2 className="h-6 w-6" />
          Accepter et continuer
        </button>
      </div>
    </div>
  )
}
