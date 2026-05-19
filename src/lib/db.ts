// This file is kept for backwards compatibility.
// All new code should use the Supabase client from '@/lib/supabase'
// import { createAdminClient } from '@/lib/supabase'

import { createAdminClient } from '@/lib/supabase'

// Export the Supabase admin client as 'db' for easy migration
// Usage: const { data, error } = await db.from('users').select('*')
export const db = createAdminClient()
