<template>
    <div class="input-section">
        <h2>System Health Check</h2>
        <div class="health-url-info">
            Testing Server: <code>{{ healthCheckUrl }}</code>
        </div>
        <div class="input-group">
            <button @click="fetchHealthCheck" :disabled="loadingHealth">{{ loadingHealth ? 'Running...' : 'Run Health Check' }}</button>
        </div>
        
        <div v-if="Object.keys(healthData).length > 0">
            <div v-if="failedTests.length > 0" class="failures-section">
                <h3>Failed Tests</h3>
                <ul>
                    <li v-for="fail in failedTests" :key="fail.name" class="failure-item">
                        <strong>{{ fail.name }}</strong>: {{ fail.message }}
                    </li>
                </ul>
            </div>
            <div v-else class="success-message">
                <h3>No Failures</h3>
            </div>

                <h2>Health Check Results</h2>
                <pre class="json-display">{{ JSON.stringify(healthData, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'

const toaster = useToaster(useToast())
const healthData = ref({})
const loadingHealth = ref(false)

const healthCheckUrl = computed(() => {
    return UrlService.healthCheckUrl
})

const failedTests = computed(() => {
    const failures: { name: string, message: string }[] = []
    const data = healthData.value as any
    if (!data) return []

    // Check if data itself is an array (new API behavior) or has checks property (old behavior)
    const source = Array.isArray(data) ? data : (data.checks || data.entries || [])
    
    // Handle array format (checks: [...])
    if (Array.isArray(source)) {
        source.forEach((item: any) => {
            if (item && item.status === 'fail') {
                failures.push({
                    name: item.name,
                    message: item.msg || item.message || item.description || ''
                })
            }
        })
    } else {
        // Fallback for object format just in case
        Object.keys(source).forEach(key => {
            const item = source[key]
            if (item && item.status === 'fail') {
                failures.push({
                    name: key,
                    message: item.msg || item.message || item.description || ''
                })
            }
        })
    }
    
    return failures
})

function fetchHealthCheck() {
    if (loadingHealth.value) return
    loadingHealth.value = true
    healthData.value = {}
    
    api.get('/api/health-check').then(res => {
        healthData.value = res.data
        loadingHealth.value = false
    }).catch(err => {
        toaster.error('Health Check Failed', err.message)
        healthData.value = {
            error: err.message,
            details: err.response?.data
        }
        loadingHealth.value = false
    })
}
</script>

<style scoped>
.input-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-section h2 {
    margin-top: 0;
    color: #2c3e50;
}

.input-group {
    display: flex;
    gap: 1rem;
    align-items: center;
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

.json-display {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    overflow-x: auto;
    text-align: left;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    border: 1px solid #e9ecef;
    max-height: 300px;
    overflow-y: auto;
}

.failures-section {
    background-color: #fee2e2;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: left;
}

.failures-section ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.failures-section h3 {
    color: #b91c1c;
    margin-top: 0;
}

.failure-item {
    color: #b91c1c;
    margin-bottom: 0.5rem;
}

.success-message {
    background-color: #dcfce7;
    border: 1px solid #22c55e;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.success-message h3 {
    color: #15803d;
    margin: 0;
}

.health-url-info {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: #f1f5f9;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #475569;
}

.health-url-info code {
    font-weight: bold;
    color: #1e293b;
}
</style>
