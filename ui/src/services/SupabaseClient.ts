import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.GAK_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.GAK_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    const isTest = (import.meta as any).env.MODE === 'test' || (typeof window !== 'undefined' && (window as any).Cypress)
    if (!isTest) {
        console.warn('[SupabaseClient] Supabase credentials not configured. Email/password authentication will not be available.')
    }
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseAvailable(): boolean {
    return supabase !== null
}
