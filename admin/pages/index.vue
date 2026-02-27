<template>
    <div class="admin-container">
        <div class="api-selector">
            <h1>
                Admin API Dashboard
                <span :class="['env-tag', isTestEnv ? 'env-test' : 'env-prod']">
                    {{ isTestEnv ? 'TEST DB' : isProdEnv ? 'PROD DB' : '???' }}
                </span>
            </h1>
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

                <div class="api-card" :class="{ active: selectedApi === 'tickets' }" @click="selectApi('tickets')">
                    <div class="api-icon">🎫</div>
                    <h3>Ticket Management</h3>
                    <p>View and manage support tickets</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'store-orders' }" @click="selectApi('store-orders')">
                    <div class="api-icon">
                        <img src="/img/apu-nahasapeemapetillon.png" alt="Store Orders" class="api-image" />
                    </div>
                    <h3>Store Orders</h3>
                    <p>View and manage print orders</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'health-check' }" @click="selectApi('health-check')">
                    <div class="api-icon">
                        <img src="/img/dr-hibbert.png" alt="Health Check" class="api-image" />
                    </div>
                    <h3>Health Check</h3>
                    <p>Run system health check</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'promote' }" @click="selectApi('promote')">
                    <div class="api-icon">🚀</div>
                    <h3>Template Promotion</h3>
                    <p>Promote user template to system global template</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'willie' }" @click="selectApi('willie')">
                    <div class="api-icon">
                        <img src="/img/groundskeeper-wllie.png" alt="Housekeeping" class="api-image" />
                    </div>
                    <h3>Housekeeping</h3>
                    <p>Summon Willie for system maintenance</p>
                </div>
                <div class="api-card" :class="{ active: selectedApi === 'low-hanging-fruits' }" @click="selectApi('low-hanging-fruits')">
                    <div class="api-icon">🍎</div>
                    <h3>Low Hanging Fruits</h3>
                    <p>Identify active simulator users</p>
                </div>
            </div>
        </div>
        
        <div v-show="selectedApi === 'profile'" class="input-section">
            <h2>User Profile Lookup</h2>
            <div class="input-group">
                <input type="text" v-model="inputValue" placeholder="Enter User ID" />
                <button type="submit" @click="handleSubmit" :disabled="!inputValue">Lookup User</button>
            </div>
        </div>
        
        <div v-show="selectedApi === 'active'" class="input-section">
            <h2>Active Users</h2>
            <div class="input-group">
                <input type="number" v-model="daysValue" placeholder="Days" min="1" @keyup.enter="fetchActiveUsers" />
                <button @click="fetchActiveUsers" :disabled="loadingActive || !daysValue">{{ loadingActive ? 'Loading...' : 'Fetch Active Users' }}</button>
            </div>
        </div>
        <div v-if="selectedApi === 'profile' && userId > 0">
            <UserProfile :user-profile="userProfileData" @refresh="handleSubmit" />
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



        <div v-if="selectedApi === 'tickets'">
            <TicketManager />
        </div>

        <div v-if="selectedApi === 'store-orders'">
            <StoreOrders />
        </div>

        <div v-if="selectedApi === 'health-check'">
            <HealthCheck />
        </div>

        <div v-if="selectedApi === 'promote'">
            <TemplatePromoter />
        </div>

        <div v-if="selectedApi === 'willie'">
            <Housekeeping />
        </div>
        
        <div v-if="selectedApi === 'low-hanging-fruits'">
            <LowHangingFruits />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster';
import { useToast } from 'primevue/usetoast'; 
import { useRoute, useRouter } from 'vue-router';

import TicketManager from '~/components/TicketManager.vue';
import UserProfile from '~/components/UserProfile.vue';
import StoreOrders from '~/components/StoreOrders.vue';
import HealthCheck from '~/components/HealthCheck.vue';
import TemplatePromoter from '~/components/TemplatePromoter.vue';
import Housekeeping from '~/components/Housekeeping.vue';
import LowHangingFruits from '~/components/LowHangingFruits.vue';

const route = useRoute()
const router = useRouter()
const inputValue = ref('')
const toaster = useToaster(useToast())
const userId = ref(0)
const userProfileData = ref({})
const rawJsonData = ref({})
const selectedApi = ref('profile')
const activeUsersRaw = ref({})
const loadingActive = ref(false)
const daysValue = ref(1)

const isTestEnv = computed(() => {
    return UrlService.isTestDB
})
const isProdEnv = computed(() => {
    return UrlService.isProdDB
})






function selectApi(api: string) {
    selectedApi.value = api
    if (api === 'profile') {
        activeUsersRaw.value = {}
    } else {
        userId.value = 0
        rawJsonData.value = {}
    }
}





function handleSubmit() {
    console.debug('[Admin.handleSubmit]', inputValue.value)
    api.get(UrlService.adminRoot + 'user/profile/' + inputValue.value).then(res => {
        const userProfile = res.data
        userId.value = userProfile.id
        userProfileData.value = userProfile
        rawJsonData.value = res.data
    }).catch(err => {
        toaster.error('Failed', err.message)
    })
}

function fetchActiveUsers() {
    if (loadingActive.value || !daysValue.value) return
    loadingActive.value = true
    console.debug('[Admin.fetchActiveUsers]', daysValue.value)
    api.get(UrlService.adminRoot + 'usage/active?days=' + daysValue.value).then(res => {
        activeUsersRaw.value = res.data
        loadingActive.value = false
    }).catch(err => {
        toaster.error('Failed to fetch active users', err.message)
        loadingActive.value = false
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
    max-width: 100%;
    margin: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.api-selector h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.env-tag {
    font-size: 0.8rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-weight: 700;
    vertical-align: middle;
}

.env-test {
    background-color: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
}

.env-prod {
    background-color: #fce7f3;
    color: #db2777;
    border: 1px solid #fbcfe8;
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
    display: flex;
    justify-content: center;
    align-items: center;
}

.api-image {
    width: 60px;
    height: 60px;
    object-fit: contain;
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

:deep(.refill-btn) {
    margin-left: 1rem;
    padding: 0.25rem 0.75rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.3s ease;
}

:deep(.refill-btn:hover) {
    background: #2ecc71;
}

:deep(.refill-btn:disabled) {
    background: #bdc3c7;
    cursor: not-allowed;
}

</style>
