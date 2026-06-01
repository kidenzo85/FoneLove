require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const webpush = require('web-push')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ ERREUR: Variables d'environnement manquantes dans .env.local")
  process.exit(1)
}

webpush.setVapidDetails(
  'mailto:djomacapp@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  const args = process.argv.slice(2)
  const userPhoneOrEmail = args[0] // Numéro de téléphone ou email
  
  if (!userPhoneOrEmail) {
    console.log(`
📱 Test des Notifications Push en Arrière-plan
----------------------------------------------
Utilisation: node scripts/test-push-background.cjs <numero_de_telephone_ou_email>
Exemple: node scripts/test-push-background.cjs 0612345678
    `)
    // List some recent active subscriptions
    const { data } = await supabase.from('push_subscriptions').select('user_id').eq('is_active', true).limit(5)
    if (data && data.length > 0) {
      console.log('Utilisateurs récents avec des abonnements actifs :')
      const userIds = [...new Set(data.map(d => d.user_id))]
      for (const id of userIds) {
        const { data: userRecord } = await supabase.from('User').select('phone').eq('id', id).single()
        console.log(`- ${userRecord?.phone || id}`)
      }
    }
    process.exit(1)
  }

  // Find user
  console.log(`🔍 Recherche de l'utilisateur: ${userPhoneOrEmail}`)
  let userId = null
  
  const { data: users, error: uErr } = await supabase
    .from('User')
    .select('id, phone, email')
    .or(`phone.ilike.%${userPhoneOrEmail}%,email.ilike.%${userPhoneOrEmail}%`)
    .limit(1)

  if (uErr || !users || users.length === 0) {
    console.log(`⚠️ Utilisateur non trouvé dans la table 'User', vérifiez le numéro ou l'email.`)
    console.error(uErr)
    process.exit(1)
  }
  
  userId = users[0].id
  console.log(`✅ Utilisateur trouvé ! ID: ${userId}`)

  // Find active subscriptions
  console.log(`📡 Recherche des abonnements Push actifs...`)
  const { data: subs, error: subsErr } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (subsErr || !subs || subs.length === 0) {
    console.log(`❌ L'utilisateur n'a aucun abonnement Push actif.`)
    console.log(`-> Dis-lui d'ouvrir l'application et d'accepter les notifications !`)
    process.exit(1)
  }

  console.log(`✅ ${subs.length} abonnement(s) Push trouvé(s) ! Envoi de la notification...`)

  const payload = {
    title: "🔔 Message de Test",
    body: "Si tu vois ça, c'est que les notifications marchent même quand l'app est fermée !",
    type: "message",
    url: "/chat",
    image: "/icon-192x192.png"
  }

  const notificationJson = JSON.stringify(payload)
  
  let successCount = 0
  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    }

    try {
      await webpush.sendNotification(subscription, notificationJson)
      console.log(`✅ Notification envoyée avec succès à l'appareil: ${sub.endpoint.substring(0, 50)}...`)
      successCount++
    } catch (err) {
      console.error(`❌ Échec de l'envoi à ${sub.endpoint.substring(0, 50)}...`, err.statusCode)
    }
  }

  console.log(`\n🎉 Bilan : ${successCount}/${subs.length} notifications envoyées.`)
  if (successCount > 0) {
    console.log(`Vérifie le téléphone (même si l'app est fermée) !`)
  }
  process.exit(0)
}

run()
