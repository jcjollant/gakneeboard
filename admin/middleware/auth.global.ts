// Whitelist of authorized admin emails
const AUTHORIZED_ADMINS = [
    'jc@jollant.net'
]

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check for login page
    if (to.path === '/login') {
        return
    }

    // Check if running on client side
    if (process.client) {
        const supabase = useSupabaseClient()

        // Check current session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            // No session, redirect to login
            return navigateTo('/login')
        }

        // Check if user email is in the authorized list
        const userEmail = session.user?.email

        if (!userEmail || !AUTHORIZED_ADMINS.includes(userEmail)) {
            // User is authenticated but not authorized
            // Sign them out and redirect to login with error
            await supabase.auth.signOut()
            return navigateTo('/login?error=unauthorized')
        }

        // Session exists and user is authorized, allow access
        return
    }
})
