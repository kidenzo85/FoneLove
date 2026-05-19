'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Trash2, Database, Globe, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
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
        <h1 className="text-lg font-bold">Règles de confidentialité</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 px-5 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-2">Tes données sont en sécurité</h2>
          <p className="text-muted-foreground text-sm">
            Chez Fonelove, on ne plaisante pas avec ta vie privée. Voici exactement comment nous protégeons et utilisons tes informations.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Section 1 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">1. Ce qu'on collecte</h3>
                <p className="text-xs text-muted-foreground">Les infos nécessaires au fonctionnement</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Pour t'offrir la meilleure expérience possible, nous devons collecter certaines données essentielles à ton profil :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ton adresse e-mail ou compte Google (pour te connecter en toute sécurité).</li>
                <li>Ton numéro de téléphone (uniquement partagé avec tes matchs validés).</li>
                <li>Les informations de ton profil : prénom, date de naissance, genre, photos, description, et centres d'intérêts.</li>
                <li>Tes actions dans l'application : profils likés, demandes envoyées, et historique d'achats de crédits.</li>
              </ul>
              <p>Rassure-toi, nous ne collectons absolument aucune donnée secrète en arrière-plan sans ton accord.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">2. Sécurité et Partage</h3>
                <p className="text-xs text-muted-foreground">Qui a accès à tes informations ?</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Ton numéro de téléphone est notre priorité absolue. Il n'est dévoilé <strong>qu'à un utilisateur avec qui tu as un Match mutuel</strong>. Le reste du temps, il est strictement confidentiel.
              </p>
              <p>
                Nous ne vendons <strong>jamais</strong> tes données personnelles à des courtiers en données ou des agences de publicité. Nous utilisons des partenaires techniques de confiance hautement certifiés (comme Google, Supabase) uniquement pour le stockage sécurisé de nos bases de données.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">3. Cookies et Suivi</h3>
                <p className="text-xs text-muted-foreground">Pour améliorer ton expérience</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Nous utilisons des technologies similaires aux "cookies" qui sont strictement nécessaires pour te maintenir connecté(e) et sécuriser ton compte. 
              </p>
              <p>
                Nous utilisons également des outils d'analyse anonymisés pour comprendre comment l'application est utilisée (par exemple, quelles pages sont les plus visitées) afin de corriger les bugs. Tu ne seras jamais tracé(e) à travers le web pour de la publicité ciblée.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">4. Ton droit à l'oubli</h3>
                <p className="text-xs text-muted-foreground">Tu as le contrôle total</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>Détails légaux :</strong> Conformément aux lois internationales sur la vie privée et au RGPD, tu es l'unique propriétaire de tes données. Tu peux à tout moment :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Modifier ou corriger tes informations directement depuis les paramètres de ton profil.</li>
                <li>Demander la suppression totale, immédiate et irréversible de ton compte et de toutes tes données associées en utilisant le bouton rouge "Supprimer mon compte" situé dans tes paramètres.</li>
              </ul>
              <p>À noter : par mesure de sécurité, les comptes inactifs depuis plus de 2 ans sont automatiquement effacés de nos serveurs.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-8 rounded-3xl bg-primary/5 p-6 text-center border border-primary/10">
            <h3 className="font-bold mb-2">Une question supplémentaire ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notre délégué à la protection des données est là pour te répondre.
            </p>
            <a href="mailto:fabricewilliam71@gmail.com" className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 active:scale-95 transition-all w-full">
              Contacter le support
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
          J'ai compris, retour à l'app
        </button>
      </div>
    </div>
  )
}
