import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { TicketService } from './TicketService'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: SupabaseClient | null = null

if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    // console.log('[SupabaseService] Supabase admin client initialized')
} else {
    console.warn('[SupabaseService] Supabase credentials not configured. Email/password authentication will not be available.')
}

export class SupabaseService {
    /**
     * Verify a Supabase access token and get user information
     * @param accessToken The Supabase session access token
     * @returns User data if valid, null otherwise
     */
    public static async verifyToken(accessToken: string): Promise<any | null> {
        if (!supabaseAdmin) {
            await TicketService.create(1, "[SupabaseService.verifyToken] Supabase not configured")
            return null
        }

        try {
            const { data, error } = await supabaseAdmin.auth.getUser(accessToken)

            if (error) {
                await TicketService.create(2, "[SupabaseService.verifyToken] Token verification failed: " + error.message)
                return null
            }

            if (!data.user) {
                await TicketService.create(2, "[SupabaseService.verifyToken] No user found for token")
                return null
            }

            return data.user
        } catch (error) {
            await TicketService.create(2, "[SupabaseService.verifyToken] Error verifying token: " + error)
            return null
        }
    }

    /**
     * Check if Supabase is configured and available
     */
    public static isAvailable(): boolean {
        return supabaseAdmin !== null
    }
}
