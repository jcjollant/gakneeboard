<template>
    <div class="template-promoter">
        <h2>Promote User Template to System</h2>
        <p>Enter a template ID to promote it. This will remove the owner association (set user_id to NULL), making it a System Template.</p>
        
        <div class="input-section">
            <div class="input-group">
                <input 
                    type="number" 
                    v-model="templateId" 
                    placeholder="Enter Template ID" 
                    @keyup.enter="promoteTemplate"
                    :disabled="promoting"
                />
                <button 
                    @click="promoteTemplate" 
                    :disabled="promoting || !templateId"
                >
                    {{ promoting ? 'Promoting...' : 'Promote to System' }}
                </button>
            </div>
        </div>

        <div v-if="result" class="result-message" :class="result.success ? 'success' : 'error'">
            <h3>{{ result.success ? 'Success' : 'Error' }}</h3>
            <p>{{ result.message }}</p>
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
const templateId = ref<number | null>(null)
const promoting = ref(false)
const result = ref<{ success: boolean; message: string } | null>(null)

async function promoteTemplate() {
    if (!templateId.value || promoting.value) return
    
    if (!confirm(`Are you sure you want to promote template #${templateId.value} to a System Template?`)) {
        return
    }

    promoting.value = true
    result.value = null
    
    try {
        const response = await api.post(UrlService.adminRoot + 'template/promote', {
            templateId: templateId.value
        })
        
        result.value = {
            success: true,
            message: response.data.message || `Template ${templateId.value} successfully promoted.`
        }
        toaster.success('Promotion Successful', result.value.message)
        templateId.value = null
    } catch (err: any) {
        const errorMessage = err.response?.data?.statusMessage || err.message || 'Unknown error'
        result.value = {
            success: false,
            message: errorMessage
        }
        toaster.error('Promotion Failed', errorMessage)
    } finally {
        promoting.value = false
    }
}
</script>

<style scoped>
.template-promoter {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.template-promoter h2 {
    margin-top: 0;
    color: #2c3e50;
}

.template-promoter p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
}

.input-section {
    margin-bottom: 1.5rem;
}

.input-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.input-group input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    max-width: 300px;
}

.input-group button {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.input-group button:hover {
    background: #2980b9;
}

.input-group button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.result-message {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid transparent;
}

.result-message.success {
    background-color: #dcfce7;
    border-color: #22c55e;
}

.result-message.success h3 {
    color: #15803d;
    margin: 0 0 0.5rem 0;
}

.result-message.error {
    background-color: #fee2e2;
    border-color: #ef4444;
}

.result-message.error h3 {
    color: #b91c1c;
    margin: 0 0 0.5rem 0;
}

.result-message p {
    margin: 0;
    color: #2c3e50;
}
</style>
