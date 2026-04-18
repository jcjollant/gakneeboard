<template>
    <div class="template-promoter">
        <h2>Promote to System Template</h2>
        <p>Promote a user-owned item to a system-wide template. System items are visible to all users and have no owner.</p>
        
        <div class="type-selector">
            <button 
                :class="{ active: promoType === 'kneeboard' }" 
                @click="promoType = 'kneeboard'"
                :disabled="promoting"
            >
                <span>📋</span> Kneeboard
            </button>
            <button 
                :class="{ active: promoType === 'aircraft' }" 
                @click="promoType = 'aircraft'"
                :disabled="promoting"
            >
                <span>✈️</span> Aircraft
            </button>
        </div>

        <div class="input-section">
            <div class="input-group-container">
                <label for="targetId" class="input-label">
                    {{ promoType === 'kneeboard' ? 'Template ID' : 'Aircraft Numeric ID' }}
                    <span class="id-helper">(Not the tail number)</span>
                </label>
                <div class="input-group">
                    <input 
                        id="targetId"
                        type="number" 
                        v-model="targetId" 
                        :placeholder="promoType === 'kneeboard' ? 'e.g. 42' : 'e.g. 159'" 
                        @keyup.enter="handleAction"
                        :disabled="promoting"
                    />
                </div>
            </div>

            <div v-if="promoType === 'aircraft'" class="aircraft-options">
                <div class="input-group-container">
                    <label for="systemTailNumber" class="input-label">System Tail Number (Template Name)</label>
                    <div class="input-group">
                        <input 
                            id="systemTailNumber"
                            type="text" 
                            v-model="systemTailNumber" 
                            placeholder="e.g. C172S or SR22" 
                            :disabled="promoting"
                        />
                    </div>
                </div>
                <div class="checkbox-group">
                    <input 
                        type="checkbox" 
                        id="asCopy" 
                        v-model="asCopy" 
                        :disabled="promoting" 
                    />
                    <label for="asCopy">Create a copy (instead of moving source aircraft)</label>
                </div>
            </div>

            <button 
                class="promote-btn"
                @click="handleAction" 
                :disabled="promoting || !targetId || (promoType === 'aircraft' && !systemTailNumber)"
            >
                {{ promoting ? 'Processing...' : (asCopy && promoType === 'aircraft' ? 'Copy to System' : 'Promote to System') }}
            </button>
        </div>

        <div v-if="result" class="result-message" :class="result.success ? 'success' : 'error'">
            <h3>{{ result.success ? 'Success' : 'Error' }}</h3>
            <p>{{ result.message }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toaster = useToaster(useToast())
const confirm = useConfirm()
const promoType = ref<'kneeboard' | 'aircraft'>('kneeboard')
const targetId = ref<number | null>(null)
const systemTailNumber = ref('')
const asCopy = ref(false)
const promoting = ref(false)
const result = ref<{ success: boolean; message: string } | null>(null)

// Reset unique fields when switching types
watch(promoType, () => {
    targetId.value = null
    systemTailNumber.value = ''
    asCopy.value = false
    result.value = null
})

async function handleAction() {
    if (promoType.value === 'kneeboard') {
        confirm.require({
            message: `Are you sure you want to promote template #${targetId.value} to a System Template?`,
            header: 'Confirm Promotion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => promoteTemplate()
        })
    } else {
        const actionWord = asCopy.value ? 'copy' : 'promote'
        confirm.require({
            message: `Are you sure you want to ${actionWord} aircraft #${targetId.value} with system tail number "${systemTailNumber.value}"?`,
            header: `Confirm Aircraft ${actionWord.charAt(0).toUpperCase() + actionWord.slice(1)}`,
            icon: 'pi pi-exclamation-triangle',
            accept: () => promoteAircraft()
        })
    }
}

async function promoteTemplate() {
    if (!targetId.value || promoting.value) return
    
    promoting.value = true
    result.value = null
    
    try {
        const response = await api.post(UrlService.adminRoot + 'template/promote', {
            templateId: targetId.value
        })
        
        result.value = {
            success: true,
            message: response.data.message || `Template ${targetId.value} successfully promoted.`
        }
        toaster.success('Promotion Successful', result.value.message)
        targetId.value = null
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

async function promoteAircraft() {
    if (!targetId.value || !systemTailNumber.value || promoting.value) return
    
    promoting.value = true
    result.value = null
    
    try {
        const response = await api.post(UrlService.adminRoot + 'aircraft/promote', {
            aircraftId: targetId.value,
            tailNumber: systemTailNumber.value,
            copy: asCopy.value
        })
        
        result.value = {
            success: true,
            message: response.data.message || `Aircraft ${targetId.value} successfully processed.`
        }
        toaster.success('Action Successful', result.value.message)
        targetId.value = null
        systemTailNumber.value = ''
    } catch (err: any) {
        const errorMessage = err.response?.data?.statusMessage || err.message || 'Unknown error'
        result.value = {
            success: false,
            message: errorMessage
        }
        toaster.error('Action Failed', errorMessage)
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

.type-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: #f1f5f9;
    padding: 0.4rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.type-selector button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    color: #64748b;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.type-selector button.active {
    background: #3498db;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.type-selector button:not(.active):hover {
    background: #e2e8f0;
    color: #0f172a;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.input-group-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-label {
    font-weight: 700;
    color: #475569;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.id-helper {
    font-weight: 500;
    color: #ef4444;
    font-style: italic;
    font-size: 0.8rem;
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
    max-width: 400px;
    transition: border-color 0.2s;
}

.input-group input:focus {
    border-color: #3498db;
    outline: none;
}

.aircraft-options {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e1e8ed;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 0.95rem;
    color: #2c3e50;
}

.checkbox-group input {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
}

.promote-btn {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
    align-self: flex-start;
}

.promote-btn:hover {
    background: #2980b9;
}

.promote-btn:disabled {
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
