<template>
  <div class="reset-password-container">
    <div class="reset-form">
      <h3>Set New Password</h3>
      
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Verifying session...</p>
      </div>

      <template v-else>
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            placeholder="Min 8 characters"
            @keyup.enter="handleUpdatePassword"
            :disabled="updating"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            @keyup.enter="handleUpdatePassword"
            :disabled="updating"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <Button
          label="Update Password"
          @click="handleUpdatePassword"
          :loading="updating"
          :disabled="!canSubmit"
          class="submit-button"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { supabase, isSupabaseAvailable } from '../services/SupabaseClient'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(true)
const updating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const canSubmit = computed(() => {
  return password.value.length >= 8 && 
         password.value === confirmPassword.value
})

onMounted(async () => {
  if (!isSupabaseAvailable() || !supabase) {
    errorMessage.value = 'Authentication service not available.'
    loading.value = false
    return
  }

  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (loading.value) {
      console.warn('[ResetPassword] Session check timed out')
      errorMessage.value = 'Invalid or expired reset link. Please request a new one.'
      loading.value = false
      setTimeout(() => router.push('/'), 3000)
    }
  }, 5000)

  // specific check for recovery flow
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[ResetPassword] Auth State Change:', event)
    if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
      clearTimeout(timeoutId)
      loading.value = false
    }
  })

  // Initial check (in case we are already authenticated)
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (session) {
    clearTimeout(timeoutId)
    loading.value = false
  } else if (error) {
    console.error('[ResetPassword] Session error:', error)
    // Don't fail immediately, wait for onAuthStateChange
  }
})

async function handleUpdatePassword() {
  if (!canSubmit.value) {
    errorMessage.value = 'Please ensure passwords match and are at least 8 characters'
    return
  }

  if (!isSupabaseAvailable() || !supabase) {
    errorMessage.value = 'Authentication service not available.'
    return
  }

  updating.value = true
  errorMessage.value = ''
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) throw error

    successMessage.value = 'Password updated successfully! Redirecting...'
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err: any) {
    console.error('Password update error:', err)
    errorMessage.value = err.message || 'Failed to update password'
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--surface-0);
}

.reset-form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: var(--surface-card);
}

h3 {
  margin: 0;
  text-align: center;
  color: var(--text-color);
  font-size: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: var(--surface-input);
  color: var(--text-color);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-20);
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.error-message {
  color: var(--red-500);
  background-color: var(--red-50);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid var(--red-200);
}

.success-message {
  color: var(--green-700);
  background-color: var(--green-50);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid var(--green-200);
}
</style>
