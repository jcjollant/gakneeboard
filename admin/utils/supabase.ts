import { createClient } from '@supabase/supabase-js'

export const useSupabaseClient = () => {
    const config = useRuntimeConfig()

    const supabaseUrl = config.public.SUPABASE_URL as string
    const supabaseKey = config.public.SUPABASE_ANON_KEY as string

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseKey)
}
