<template>
    <div class="admin-container">
        <div>
            <h1>User Id</h1>
            <input type="text" v-model="inputValue" />
            <button type="submit" @click="handleSubmit">Submit</button>
        </div>
        <div v-if="userId > 0">
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { currentUser } from '../assets/data'
import { GApiUrl } from '../lib/GApiUrl'
import { useToaster } from '../assets/Toaster';
import { useToast } from 'primevue/usetoast';

const inputValue = ref('')
const toaster = useToaster(useToast())
const userEmail = ref('')
const userName = ref('')
const userId = ref(0)
const userAccountType = ref('')
const userEula = ref(0)
const usage = ref<Usage[]>([])
const rawJsonData = ref({})

class Usage {
    type: string
    count: number
    constructor(type: string, count: number) {
        this.type = type
        this.count = count
    }
}

function handleSubmit() {
    console.debug('[Admin.handleSubmit]', inputValue.value)
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
</script>

<style scoped>
.admin-container {
    border: 10px solid red;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;
}
.props {
    display: grid;
    grid-template-columns: 1fr 3fr;
}
.prop-name {
    font-weight: bold;
}
.usage {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.json-display {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    overflow-x: auto;
    text-align: left;
}
</style>
