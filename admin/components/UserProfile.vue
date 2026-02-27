<template>
    <div class="user-profile">
        <h2>Properties</h2>
        <div class="props">
            <div class="prop-name">Id</div>
            <div class="prop-value">{{ userProfile.id }}</div>
            <div class="prop-name">Name</div>
            <div class="prop-value">{{ userProfile.name }}</div>
            <div class="prop-name">Email</div>
            <div class="prop-value">{{ userProfile.email }}</div>
            <div class="prop-name">Account Type</div>
            <div class="prop-value">{{ userProfile.accountType }}</div>
            <div class="prop-name">Eula</div>
            <div class="prop-value">{{ userProfile.eula }}</div>
            <div class="prop-name">Create Time</div>
            <div class="prop-value">{{ formatCreateTime }}</div>
            <div class="prop-name">Last Session</div>
            <div class="prop-value">{{ formatLastSession }}</div>
            <div class="prop-name">Print Credit</div>
            <div class="prop-value">
                {{ userProfile.printCredits }}
                <button class="refill-btn" @click="handleRefill" :disabled="refilling">
                    {{ refilling ? '...' : 'Refill' }}
                </button>
            </div>
        </div>

        <h2>90 Days Usage</h2>
        <div class="usage">
            <div>Type</div><div>Count</div>
            <template v-for="u in usage" :key="u.type">
                <div class="prop-value">{{ u.type }}</div>
                <div class="prop-value">{{ u.count }}</div>
            </template>
        </div>
        
        <h2>Raw JSON Data</h2>
        <pre class="json-display">{{ JSON.stringify(userProfile, null, 2) }}</pre>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '~/utils/api';
import { UrlService } from '~/utils/UrlService';
import { useToaster } from '~/utils/Toaster';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    userProfile: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['refresh'])

const refilling = ref(false)
const toaster = useToaster(useToast())

async function handleRefill() {
    if (refilling.value) return
    refilling.value = true
    try {
        const res = await api.post(UrlService.adminRoot + `user/profile/${props.userProfile.id}/refill`, {})
        const message = res.data.message || 'Account refilled'
        toaster.success('Success', message)
        emit('refresh')
    } catch (err: any) {
        toaster.error('Failed', err.message)
    } finally {
        refilling.value = false
    }
}

class Usage {
    type: string
    count: number
    constructor(type: string, count: number) {
        this.type = type
        this.count = count
    }
}

const usage = computed(() => {
    if (!props.userProfile.usage) return []
    return props.userProfile.usage.map((u: any) => new Usage(u.usage_type, u.count))
})

const formatCreateTime = computed(() => {
    if (props.userProfile.create_time) {
        return `${new Date(props.userProfile.create_time).toLocaleDateString()} (${calculateAge(props.userProfile.create_time)})`
    }
    return 'N/A'
})

const formatLastSession = computed(() => {
    if (props.userProfile.lastSession) {
        return `${new Date(props.userProfile.lastSession).toLocaleDateString()} (${calculateAge(props.userProfile.lastSession)})`
    }
    return 'N/A'
})

function calculateAge(dateStr: string | number | Date): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    return `${diffDays} days ago`
}

</script>

<style scoped>
.user-profile {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

.prop-value {
    word-break: break-all;
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
</style>
