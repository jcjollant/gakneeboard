<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🔒 Admin Login</h1>
        <p>Enter your credentials to access the admin dashboard</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="loading">
            <i class="pi pi-spin pi-spinner"></i> Authenticating...
          </span>
          <span v-else>
            Login
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseClient } from '~/utils/supabase'

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  // Check if redirected due to unauthorized access
  if (route.query.error === 'unauthorized') {
    error.value = 'Access denied. Your account is not authorized to access this admin panel.'
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (authError) {
      error.value = authError.message
      return
    }
    
    if (data.session) {
      // Store session in localStorage
      localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
      
      // Redirect to admin dashboard
      await router.push('/')
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.875rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.login-button {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-button i {
  margin-right: 0.5rem;
}
</style>
