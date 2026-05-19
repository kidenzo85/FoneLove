/**
 * ConnectPhone — Credit User Sync (DEPRECATED)
 * 
 * ⚠️ DEPRECATED: Ce module n'est plus nécessaire avec Supabase.
 * 
 * Le système de crédits utilisait auparavant Prisma/SQLite, nécessitant
 * une synchronisation entre les utilisateurs Supabase Auth et la DB locale.
 * 
 * Avec Supabase, les wallets sont créés automatiquement par le trigger
 * `on_auth_user_created` (voir consolidated_migration.sql, section 008).
 * La fonction RPC `ensure_wallet()` gère aussi la création à la volée.
 * 
 * Ce fichier est conservé temporairement pour la compatibilité ascendante
 * des API routes qui l'importent encore, mais ne fait plus rien d'utile.
 */

/**
 * @deprecated Utilisez directement les RPC Supabase. Le wallet est créé
 * automatiquement par le trigger on_auth_user_created ou ensure_wallet().
 */
export async function ensureCreditUser(params: {
  userId: string
  email?: string
  firstName?: string
  phone?: string
}): Promise<{ id: string; isNew: boolean }> {
  // Avec Supabase, le wallet est créé automatiquement par le trigger.
  // On retourne simplement l'ID de l'utilisateur.
  console.warn(
    '[DEPRECATED] ensureCreditUser() est obsolète. ' +
    'Les wallets sont créés automatiquement par le trigger Supabase.'
  )
  return { id: params.userId, isNew: false }
}
