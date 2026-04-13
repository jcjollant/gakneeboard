<template>
  <div class="supabase-auth">
    <h2>Supabase Admin Tools</h2>
    <div class="tool-section">
      <h3>Generate Auth Link</h3>
      <p class="description">Generate a sign-up, recovery, or magic link for a user. This link can be sent to the user to bypass standard email delivery.</p>
      
      <div class="form-container">
        <div class="form-group">
          <label for="email">User Email</label>
          <input 
            id="email" 
            type="email" 
            v-model="email" 
            placeholder="pilot@example.com" 
            @keyup.enter="generateLink"
          />
        </div>

        <div class="form-group">
          <label for="type">Link Type</label>
          <select id="type" v-model="linkType">
            <option value="signup">Sign-up Confirmation</option>
            <option value="recovery">Password Recovery</option>
            <option value="magiclink">Magic Link</option>
            <option value="invite">Invite</option>
          </select>
        </div>

        <button 
          @click="generateLink" 
          :disabled="!email || loading" 
          class="submit-btn"
        >
          {{ loading ? 'Generating...' : 'Generate Link' }}
        </button>
      </div>

      <div v-if="generatedLink" class="result-section">
        <label>Generated Link:</label>
        <div class="link-display">
          <input type="text" readonly :value="generatedLink" ref="linkInput" />
          <button @click="copyToClipboard" class="copy-btn">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'

const toaster = useToaster(useToast())
const email = ref('')
const linkType = ref('signup')
const loading = ref(false)
const generatedLink = ref('')
const copied = ref(false)
const linkInput = ref<HTMLInputElement | null>(null)

async function generateLink() {
  if (!email.value || loading.value) return
  
  loading.value = true
  generatedLink.value = ''
  copied.value = false
  
  try {
    const res = await api.post(UrlService.adminRoot + 'auth/generate-link', {
      email: email.value,
      type: linkType.value
    })
    
    generatedLink.value = res.data.link
    toaster.success('Success', 'Auth link generated successfully')
  } catch (err: any) {
    toaster.error('Failed to generate link', err.message || 'Unknown error')
  } finally {
    loading.value = false
  }
}

function copyToClipboard() {
  if (!generatedLink.value) return
  
  navigator.clipboard.writeText(generatedLink.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<style scoped>
.supabase-auth {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
}

.description {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.form-group input, 
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus, 
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.result-section {
  margin-top: 2rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.result-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

.link-display {
  display: flex;
  gap: 0.5rem;
}

.link-display input {
  flex: 1;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
}

.copy-btn {
  padding: 0.75rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  min-width: 80px;
}

.copy-btn:hover {
  background: #059669;
}
</style>
