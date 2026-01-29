<template>
    <div class="active-users-manager">
        <h2>Active Users</h2>
        <div class="input-group">
            <input type="number" v-model="daysValue" placeholder="Days" min="1" @keyup.enter="fetchActiveUsers" />
            <button @click="fetchActiveUsers" :disabled="loadingActive || !daysValue">{{ loadingActive ? 'Loading...' : 'Fetch Active Users' }}</button>
        </div>
        
        <div v-if="Object.keys(activeUsersRaw).length > 0">
            <h3>Active Users List</h3>
            <div class="user-id-list">
                <router-link v-for="id in activeUsersRaw" 
                    :key="id" 
                    class="user-id-chip" 
                    :to="{ query: { userId: id } }">
                    {{ id }}
                </router-link>
            </div>
            <h3>Active Users API Response</h3>
            <pre class="json-display">{{ JSON.stringify(activeUsersRaw, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { currentUser } from '../../assets/data'
import { UrlService } from '../../services/UrlService'
import { useToaster } from '../../assets/Toaster'
import { useToast } from 'primevue/usetoast'

const toaster = useToaster(useToast())
const activeUsersRaw = ref({})
const loadingActive = ref(false)
const daysValue = ref(1)

function fetchActiveUsers() {
    if (loadingActive.value || !daysValue.value) return
    loadingActive.value = true
    console.debug('[ActiveUsers.fetchActiveUsers]', daysValue.value)
    currentUser.getUrl(UrlService.root + 'usage/active?days=' + daysValue.value).then(res => {
        activeUsersRaw.value = res.data
        loadingActive.value = false
    }).catch(err => {
        toaster.error('Failed to fetch active users', err.message)
        loadingActive.value = false
    })
}
</script>

<style scoped>
.active-users-manager {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.active-users-manager h2 {
    margin-top: 0;
    color: #2c3e50;
}

.active-users-manager h3 {
    margin-top: 1.5rem;
    color: #2c3e50;
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

.user-id-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.user-id-chip {
    padding: 0.5rem 1rem;
    background: #e1e8ed;
    border-radius: 20px;
    font-weight: 500;
    color: #2c3e50;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
}

.user-id-chip:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>
