// src/lib/supabase/server.ts
// Server-side Supabase client — cookie oturumunu okur
//
// Next.js 14 (senkron cookies API) için yazıldı.
// Next.js 15'te cookies() async olur; create-next-app@14 ile sabitlendi.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // Obje formu kullanılıyor: Next.js 14 tip tanımlarıyla
            // pozisyonel formdan daha uyumlu.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options }),
            )
          } catch {
            // Server Component içinden çağrıldığında (read-only cookies)
            // hata fırlatır ama session için zararsızdır.
          }
        },
      },
    },
  )
}
