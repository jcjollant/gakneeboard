<template>
  <div class="email-auth-container">
    <!-- Sign Up Form -->
    <div v-if="mode === 'signup'" class="auth-form">
      <h3>Create Account</h3>
      
      <div class="form-group">
        <label for="signup-name">Name</label>
        <input
          id="signup-name"
          v-model="signupName"
          type="text"
          placeholder="Your name"
          @keyup.enter="handleSignUp"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model="signupEmail"
          type="email"
          placeholder="your@email.com"
          @keyup.enter="handleSignUp"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="signupPassword"
          type="password"
          placeholder="Min 8 characters"
          @keyup.enter="handleSignUp"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="signup-password-confirm">Confirm Password</label>
        <input
          id="signup-password-confirm"
          v-model="signupPasswordConfirm"
          type="password"
          placeholder="Re-enter password"
          @keyup.enter="handleSignUp"
          :disabled="loading"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <Button
        label="Sign Up"
        @click="handleSignUp"
        :loading="loading"
        :disabled="!canSignUp"
        class="auth-button"
      />

      <div class="auth-switch">
        Already have an account?
        <a href="#" @click.prevent="mode = 'signin'">Sign In</a>
      </div>
    </div>

    <!-- Sign In Form -->
    <div v-else-if="mode === 'signin'" class="auth-form">
      <h3>Sign In</h3>
      
      <div class="form-group">
        <label for="signin-email">Email</label>
        <input
          id="signin-email"
          v-model="signinEmail"
          type="email"
          placeholder="your@email.com"
          @keyup.enter="handleSignIn"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="signin-password">Password</label>
        <input
          id="signin-password"
          v-model="signinPassword"
          type="password"
          placeholder="Your password"
          @keyup.enter="handleSignIn"
          :disabled="loading"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <Button
        label="Sign In"
        @click="handleSignIn"
        :loading="loading"
        :disabled="!canSignIn"
        class="auth-button"
      />

      <div class="auth-links">
        <a href="#" @click.prevent="mode = 'reset'">Forgot password?</a>
        <span class="separator">•</span>
        <a href="#" @click.prevent="mode = 'signup'">Create account</a>
      </div>
    </div>

    <!-- Password Reset Form -->
    <div v-else-if="mode === 'reset'" class="auth-form">
      <h3>Reset Password</h3>
      
      <div class="form-group">
        <label for="reset-email">Email</label>
        <input
          id="reset-email"
          v-model="resetEmail"
          type="email"
          placeholder="your@email.com"
          @keyup.enter="handlePasswordReset"
          :disabled="loading"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <Button
        label="Send Reset Link"
        @click="handlePasswordReset"
        :loading="loading"
        :disabled="!resetEmail"
        class="auth-button"
      />

      <div class="auth-switch">
        <a href="#" @click.prevent="mode = 'signin'">Back to Sign In</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { supabase, isSupabaseAvailable } from '../../services/SupabaseClient'

const emits = defineEmits(['success', 'error'])

// Form mode: 'signin' | 'signup' | 'reset'
const mode = ref<'signin' | 'signup' | 'reset'>('signin')

// Sign Up fields
const signupName = ref('')
const signupEmail = ref('')
const signupPassword = ref('')
const signupPasswordConfirm = ref('')

// Sign In fields
const signinEmail = ref('')
const signinPassword = ref('')

// Password Reset fields
const resetEmail = ref('')

// UI state
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validation
const canSignUp = computed(() => {
  return signupName.value.trim() &&
         signupEmail.value && 
         signupPassword.value.length >= 8 && 
         signupPassword.value === signupPasswordConfirm.value
})

const canSignIn = computed(() => {
  return signinEmail.value && signinPassword.value
})

// Clear messages when switching modes
function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

// Sign Up Handler
async function handleSignUp() {
  if (!isSupabaseAvailable()) {
    errorMessage.value = 'Email authentication is not configured'
    return
  }

  if (!canSignUp.value) {
    errorMessage.value = 'Please fill all fields correctly'
    return
  }

  clearMessages()
  loading.value = true

  try {
    const { data, error } = await supabase!.auth.signUp({
      email: signupEmail.value,
      password: signupPassword.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: signupName.value.trim()
        }
      }
    })

    if (error) throw error

    if (data.user) {
      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        errorMessage.value = 'This email is already registered. Please sign in instead.'
      } else if (!data.session) {
        successMessage.value = 'Account created! Please check your email to verify your account.'
        // Clear form
        signupName.value = ''
        signupEmail.value = ''
        signupPassword.value = ''
        signupPasswordConfirm.value = ''
      } else {
        // User is automatically signed in (email confirmation disabled)
        emits('success', {
          source: 'supabase',
          user: data.user,
          session: data.session
        })
      }
    }
  } catch (error: any) {
    console.error('[EmailPasswordAuth] Sign up error:', error)
    errorMessage.value = error.message || 'Failed to create account'
    emits('error', error)
  } finally {
    loading.value = false
  }
}

// Sign In Handler
async function handleSignIn() {
  if (!isSupabaseAvailable()) {
    errorMessage.value = 'Email authentication is not configured'
    return
  }

  if (!canSignIn.value) {
    errorMessage.value = 'Please enter email and password'
    return
  }

  clearMessages()
  loading.value = true

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: signinEmail.value,
      password: signinPassword.value
    })

    if (error) throw error

    if (data.session && data.user) {
      emits('success', {
        source: 'supabase',
        user: data.user,
        session: data.session
      })
    }
  } catch (error: any) {
    console.error('[EmailPasswordAuth] Sign in error:', error)
    
    if (error.message.includes('Email not confirmed')) {
      errorMessage.value = 'Please verify your email before signing in. Check your inbox for the verification link.'
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage.value = 'Invalid email or password'
    } else {
      errorMessage.value = error.message || 'Failed to sign in'
    }
    
    emits('error', error)
  } finally {
    loading.value = false
  }
}

// Password Reset Handler
async function handlePasswordReset() {
  if (!isSupabaseAvailable()) {
    errorMessage.value = 'Email authentication is not configured'
    return
  }

  if (!resetEmail.value) {
    errorMessage.value = 'Please enter your email'
    return
  }

  clearMessages()
  loading.value = true

  try {
    const { error } = await supabase!.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error

    successMessage.value = 'Password reset link sent! Check your email.'
    resetEmail.value = ''
  } catch (error: any) {
    console.error('[EmailPasswordAuth] Password reset error:', error)
    errorMessage.value = error.message || 'Failed to send reset link'
    emits('error', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.email-auth-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-form h3 {
  margin: 0 0 1rem 0;
  text-align: center;
  color: var(--text-color);
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
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input:disabled {
  background-color: var(--surface-100);
  cursor: not-allowed;
}

.auth-button {
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
}

.success-message {
  color: var(--green-700);
  background-color: var(--green-50);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.auth-switch {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.auth-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.auth-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.auth-links .separator {
  color: var(--text-color-secondary);
}
</style>
