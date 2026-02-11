<template>
  <div class="auth-callback">
    <div class="message">
      <div v-if="loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Verifying your email...</p>
      </div>
      <div v-else-if="error">
        <p class="error">{{ error }}</p>
        <p>Redirecting to home...</p>
      </div>
      <div v-else>
        <i class="pi pi-check-circle" style="font-size: 2rem; color: green"></i>
        <p class="largeClear">Clear to take off!</p>
        <p>Email verified. Signing you in...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/SupabaseClient'
import { authenticationRequest } from '../assets/data'

const router = useRouter()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // Supabase automatically handles the callback
    // The session is set via the URL hash parameters
    
    // Get the current session
    if (supabase) {
      const { data, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        error.value = 'Verification failed. Please try again.'
        console.error('[AuthCallback] Session error:', sessionError)
      } else if (data.session && data.session.user) {
        // User is now verified and logged in to Supabase
        console.log('[AuthCallback] User verified successfully, authenticating with backend...')
        
        // Authenticate with your backend
        try {
          await authenticationRequest({
            source: 'supabase',
            token: data.session.access_token,
            user: data.session.user
          })
          
          console.log('[AuthCallback] User authenticated successfully')
        } catch (authError) {
          console.error('[AuthCallback] Authentication error:', authError)
          error.value = 'Authentication failed. Please try signing in again.'
        }
      }
    }
    
    loading.value = false
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    console.error('[AuthCallback] Error:', err)
    error.value = 'An error occurred during verification'
    loading.value = false
    
    // Still redirect after error
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.message {
  text-align: center;
  max-width: 400px;
}

.message p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

.error {
  color: var(--red-500);
  font-weight: bold;
}

.message p.largeClear {
  font-size: 3rem;
  font-weight: bold;
  margin-top: 1rem;
}
</style>
