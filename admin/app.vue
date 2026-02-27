<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <!-- Auth Header (only show when logged in and not on login page) -->
    <div v-if="isAuthenticated && $route.path !== '/login'" class="auth-header">
      <div class="auth-info">
        <span class="user-email">{{ userEmail }}</span>
        <button @click="handleLogout" class="logout-button">
          <i class="pi pi-sign-out"></i> Logout
        </button>
      </div>
    </div>
    
    <NuxtPage />
    <Toast />
    
    <div class="server-badge">
      {{ serverUrl }}
    </div>
    <div class="version-badge">
      v{{ version }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseClient } from '~/utils/supabase'
import { useRuntimeConfig } from '#app'
import { UrlService } from '~/utils/UrlService'
import Toast from 'primevue/toast'

const config = useRuntimeConfig()
const version = config.public.APP_VERSION
const serverUrl = UrlService.root

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

const isAuthenticated = ref(false)
const userEmail = ref('')

onMounted(async () => {
  // Check initial auth state
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    isAuthenticated.value = true
    userEmail.value = session.user?.email || ''
  }
  
  // Listen to auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    isAuthenticated.value = !!session
    userEmail.value = session?.user?.email || ''
    
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('supabase.auth.token')
  isAuthenticated.value = false
  userEmail.value = ''
  router.push('/login')
}
</script>

<style>
.auth-header {
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 0.75rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.auth-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.user-email {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-button:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.logout-button i {
  font-size: 0.9rem;
}

.version-badge {
  position: fixed;
  bottom: 10px;
  right: 10px;
  font-size: 1rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
}

.server-badge {
  position: fixed;
  bottom: 10px;
  left: 10px;
  font-size: 1rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
}
</style>
