import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (
    supabaseUrl.includes('your-project') ||
    supabaseAnonKey.includes('your-supabase') ||
    !supabaseUrl.startsWith('https://')
  ) {
    return false
  }
  return true
}

let client: SupabaseClient | null = null

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    client = null
  }
}

export const supabase = client

export function getSupabaseConfig() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'Not configured',
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-supabase')),
  }
}
