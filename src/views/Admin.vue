<template>
    <div class="admin-container">
        <div class="api-selector">
            <h1>Admin API Dashboard</h1>
            <div class="api-cards">
                <div class="api-card" :class="{ active: selectedApi === 'profile' }" @click="selectApi('profile')">
                    <div class="api-icon">👤</div>
                    <h3>User Profile</h3>
                    <p>View individual user details and usage history</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'active' }" @click="selectApi('active')">
                    <div class="api-icon">📊</div>
                    <h3>Active Users</h3>
                    <p>Monitor currently active users and system usage</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'create-airport' }" @click="selectApi('create-airport')">
                    <div class="api-icon">🛫</div>
                    <h3>Create Airport</h3>
                    <p>Add a new airport to the database</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'health-check' }" @click="selectApi('health-check')">
                    <div class="api-icon">❤️</div>
                    <h3>Health Check</h3>
                    <p>Run system health check</p>
                </div>
            </div>
        </div>
        
        <div v-if="selectedApi === 'profile'" class="input-section">
            <h2>User Profile Lookup</h2>
            <div class="input-group">
                <input type="text" v-model="inputValue" placeholder="Enter User ID" />
                <button type="submit" @click="handleSubmit" :disabled="!inputValue">Lookup User</button>
            </div>
        </div>
        
        <div v-if="selectedApi === 'active'" class="input-section">
            <h2>Active Users</h2>
            <div class="input-group">
                <input type="number" v-model="daysValue" placeholder="Days" min="1" @keyup.enter="fetchActiveUsers" />
                <button @click="fetchActiveUsers" :disabled="loadingActive || !daysValue">{{ loadingActive ? 'Loading...' : 'Fetch Active Users' }}</button>
            </div>
        </div>
        <div v-if="selectedApi === 'profile' && userId > 0">
            <h2>Properties</h2>
            <div class="props">
                <div class="prop-name">Id</div>
                <div class="prop-value">{{ userId }}</div>
                <div class="prop-name">Email</div>
                <div class="prop-value">{{ userEmail }}</div>
                <div class="prop-name">Account Type</div>
                <div class="prop-value">{{ userAccountType }}</div>
                <div class="prop-name">Eula</div>
                <div class="prop-value">{{ userEula }}</div>
            </div>

            <h2>Usage 90</h2>
            <div class="usage">
                <div>Type</div><div>Count</div>
                <template v-for="u in usage">
                    <div class="prop-value">{{ u.type }}</div>
                    <div class="prop-value">{{ u.count }}</div>
                </template>
            </div>
            
            <h2>Raw JSON Data</h2>
            <pre class="json-display">{{ JSON.stringify(rawJsonData, null, 2) }}</pre>
        </div>
        
        <div v-if="selectedApi === 'active' && Object.keys(activeUsersRaw).length > 0">
            <h2>Active Users List</h2>
            <div class="user-id-list">
                <router-link v-for="id in activeUsersRaw" 
                    :key="id" 
                    class="user-id-chip" 
                    :to="{ query: { userId: id } }">
                    {{ id }}
                </router-link>
            </div>
            <h2>Active Users API Response</h2>
            <pre class="json-display">{{ JSON.stringify(activeUsersRaw, null, 2) }}</pre>
        </div>

        <div v-if="selectedApi === 'create-airport'">
            <AirportCreationForm />
        </div>

        <div v-if="selectedApi === 'health-check'" class="input-section">
            <h2>System Health Check</h2>
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
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { currentUser } from '../assets/data'
import { GApiUrl } from '../lib/GApiUrl'
import { useToaster } from '../assets/Toaster';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';
import AirportCreationForm from '../components/admin/AirportCreationForm.vue';

const route = useRoute()
const router = useRouter()
const inputValue = ref('')
const toaster = useToaster(useToast())
const userEmail = ref('')
const userName = ref('')
const userId = ref(0)
const userAccountType = ref('')
const userEula = ref(0)
const usage = ref<Usage[]>([])
const rawJsonData = ref({})
const selectedApi = ref('profile')
const activeUsersRaw = ref({})
const loadingActive = ref(false)
const daysValue = ref(1)
const healthData = ref({})
const loadingHealth = ref(false)

const failedTests = computed(() => {
    const failures: { name: string, message: string }[] = []
    const data = healthData.value as any
    if (!data) return []

    // Check for 'checks' array based on user provided JSON
    const source = data.checks || data.entries || []
    
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

class Usage {
    type: string
    count: number
    constructor(type: string, count: number) {
        this.type = type
        this.count = count
    }
}



function selectApi(api: string) {
    selectedApi.value = api
    if (api === 'profile') {
        // activeUsersRaw.value = {} // Commented out to preserve list if switching back and forth? 
        // Actually, existing code clears it. Let's keep it consistent with previous logic or adapt.
        // If I want to keep the list visible when I click back?
        // The original code cleared it: activeUsersRaw.value = {}
        // Let's stick to original behavior for now, but be careful.
        activeUsersRaw.value = {}
    } else {
        userId.value = 0
        rawJsonData.value = {}
        healthData.value = {}
    }
}


function handleSubmit() {
    console.debug('[Admin.handleSubmit]', inputValue.value)
    // Avoid re-fetching if already same ID? No, explicit refresh is good.
    currentUser.getUrl(GApiUrl.root + 'user/profile/' + inputValue.value).then(res => {
        const userProfile = res.data
        userId.value = userProfile.id
        userName.value = userProfile.name
        userEmail.value = userProfile.email
        userAccountType.value = userProfile.accountType
        userEula.value = userProfile.eula
        usage.value = userProfile.usage.map((u:any) => new Usage(u.usage_type, u.count))
        rawJsonData.value = res.data
    }).catch(err => {
        toaster.error('Failed', err.message)
    })
}

function fetchActiveUsers() {
    if (loadingActive.value || !daysValue.value) return
    loadingActive.value = true
    console.debug('[Admin.fetchActiveUsers]', daysValue.value)
    currentUser.getUrl(GApiUrl.root + 'usage/active?days=' + daysValue.value).then(res => {
        activeUsersRaw.value = res.data
        loadingActive.value = false
    }).catch(err => {
        toaster.error('Failed to fetch active users', err.message)
        loadingActive.value = false
    })
}

function fetchHealthCheck() {
    if (loadingHealth.value) return
    loadingHealth.value = true
    healthData.value = {}
    
    currentUser.getUrl(GApiUrl.root + 'admin/healthCheck').then(res => {
        healthData.value = res.data
        loadingHealth.value = false
    }).catch(err => {
        toaster.error('Health Check Failed', err.message)
        healthData.value = { error: err.message }
        loadingHealth.value = false
    })
}

function openUserProfile(id: any) {
    // This function is still used by the template in my previous edit.
    // I will replace the usage in template with router-link, but keep this for safety or change it.
    router.push({ query: { userId: id } })
}

const handleRouteParams = () => {
    const qUserId = route.query.userId
    if (qUserId) {
        // We set selectedApi to 'profile'
        // Note: selectApi('profile') clears activeUsersRaw. 
        // If we want to support "Back" button to see the list again, clearing it might be annoying, 
        // but 'Active Users' page requires hitting 'Fetch' again anyway in current impl.
        selectApi('profile')
        inputValue.value = String(qUserId)
        handleSubmit()
    }
}

watch(() => route.query.userId, () => {
    handleRouteParams()
})

onMounted(() => {
    handleRouteParams()
})




</script>

<style scoped>
.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.api-selector h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
}

.api-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.api-card {
    background: white;
    border: 2px solid #e1e8ed;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.api-card:hover {
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.api-card.active {
    border-color: #3498db;
    background: #f8fbff;
}

.api-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.api-card h3 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
}

.api-card p {
    color: #7f8c8d;
    margin: 0;
    font-size: 0.9rem;
}

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

.input-group input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

.input-group button, .input-section > button {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.input-group button:hover, .input-section > button:hover {
    background: #2980b9;
}

.input-group button:disabled, .input-section > button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.props {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 0.5rem;
    background: white;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
}

.prop-name {
    font-weight: bold;
    color: #2c3e50;
}

.usage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    background: white;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
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
    text-decoration: none; /* added for router-link */
    display: inline-block; /* router-link is inline by default */
}

.user-id-chip:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
</style>
