// src/lib/supabase/admin.ts
// Service role client — RLS bypass. SADECE server actions içinde kullan.
// SUPABASE_SERVICE_ROLE_KEY client'a açılmaz; process.env ile sunucu tarafında kalır.

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[createAdminClient] NEXT_PUBLIC_SUPABASE_URL veya ' +
      'SUPABASE_SERVICE_ROLE_KEY eksik. .env.local dosyasını kontrol et.'
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  })
}
