<template>
    <div class="input-section">
        <h2>Housekeeping (Willie)</h2>
        <div class="info-text">
            Manual invocation of Willie's tasks. This will NOT send an email notification.
        </div>
        <div class="input-group">
            <button @click="runWillie" :disabled="loadingWillie" class="run-btn">{{ loadingWillie ? 'Summoning Willie...' : 'Run Housekeeping' }}</button>
            <button @click="fetchHistory" :disabled="loadingHistory" class="fetch-btn">{{ loadingHistory ? 'Fetching History...' : 'Fetch History' }}</button>
        </div>
        
        <div v-if="housekeepingHistory.length > 0" class="history-section">
            <h3>Recent History</h3>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Skipped</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in housekeepingHistory.slice(0, 5)" :key="entry.id">
                        <td>{{ formatDate(entry.create_time) }}</td>
                        <td class="status-pass">{{ entry.passed }}</td>
                        <td class="status-fail">{{ entry.failed }}</td>
                        <td class="status-skip">{{ entry.skipped }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="willieResults.length > 0">
            <h3>Last Run Results</h3>
            <div class="task-summary">
                <div v-for="task in willieResults" :key="task.name" class="task-item" :class="task.status">
                    <span class="task-icon">{{ getStatusIcon(task.status) }}</span>
                    <strong>{{ task.name }}</strong>: {{ task.status }} - {{ task.message }} 
                    <span class="duration">({{ task.duration }}ms)</span>
                </div>
            </div>
        </div>

        <div v-if="housekeepingHistory.length > 0">
            <h2>Raw History Output</h2>
            <pre class="json-display">{{ JSON.stringify(housekeepingHistory, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'

interface WillieTask {
    name: string
    status: string
    message: string
    duration: number
}

const toaster = useToaster(useToast())
const willieResults = ref<WillieTask[]>([])
const housekeepingHistory = ref<any[]>([])
const loadingWillie = ref(false)
const loadingHistory = ref(false)

function fetchHistory() {
    loadingHistory.value = true
    api.get(UrlService.adminRoot + 'housekeeping').then(res => {
        housekeepingHistory.value = res.data
        loadingHistory.value = false
    }).catch(err => {
        toaster.error('Failed to fetch history', err.message)
        loadingHistory.value = false
    })
}

function runWillie() {
    if (loadingWillie.value) return
    loadingWillie.value = true
    willieResults.value = []
    
    api.get(UrlService.adminRoot + 'maintenance/willie').then(res => {
        // Willie returns a string currently, but we want JSON. 
        // For now, let's just refresh history
        fetchHistory()
        loadingWillie.value = false
        toaster.success('Willie Finished', 'Housekeeping completed successfully')
    }).catch(err => {
        toaster.error('Willie Failed', err.message)
        loadingWillie.value = false
    })
}

import { onMounted } from 'vue'
// History is now fetched on demand via button
onMounted(() => {
    // fetchHistory()
})

function formatDate(date: string) {
    return new Date(date).toLocaleString()
}

function getStatusIcon(status: string | number) {
    if (typeof status === 'number') {
        return status > 0 ? '❌' : '✅'
    }
    switch (status) {
        case 'finished': return '✅'
        case 'skipped': return '⏭️'
        case 'failed': return '❌'
        case 'started': return '⏳'
        default: return '❓'
    }
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

.info-text {
    margin-bottom: 1.5rem;
    color: #7f8c8d;
    font-style: italic;
}

.input-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
}

.input-group button.run-btn {
    padding: 0.75rem 1.5rem;
    background: #e67e22;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.input-group button.run-btn:hover {
    background: #d35400;
}

.input-group button.fetch-btn {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.input-group button.fetch-btn:hover {
    background: #2980b9;
}

.input-group button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.task-summary {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.task-item {
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #ddd;
    background: #fdfdfd;
}

.task-item.finished { border-left-color: #2ecc71; background: #f0fff4; }
.task-item.skipped { border-left-color: #f1c40f; background: #fffdf0; }
.task-item.failed { border-left-color: #e74c3c; background: #fff5f5; }

.task-icon {
    margin-right: 0.5rem;
}

.duration {
    color: #95a5a6;
    font-size: 0.85rem;
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
    max-height: 400px;
    overflow-y: auto;
}

.history-section {
    margin-bottom: 2rem;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.history-table th, .history-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.history-table th {
    background-color: #f8f9fa;
    color: #64748b;
    font-weight: 600;
}

.status-pass { color: #2ecc71; font-weight: bold; }
.status-fail { color: #e74c3c; font-weight: bold; }
.status-skip { color: #f1c40f; font-weight: bold; }

</style>
