<template>
    <AccountDetails v-model:visible="showAccountDetails" :user="currentUser" @signout="onSignOut" @close="showAccountDetails=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" @authentication="onAuthentication" />
    <div class="menu" >
        <div>
            <div class="left">
                <Logo :hasTemplate="!!name" @click="router.push('/')" />
                <font-awesome-icon v-if="name" class="icon" icon="fa-chevron-right" />
                <div v-if="name" title="Active Template Name" class="templateName">{{name}}</div>
                <div v-if="isModified" class="unsaved-badge">unsaved</div>
                <div v-if="test" class="env-tag env-test">TEST DB</div>
            </div>
            <div v-if="showSession" class="right">
                <div v-if="!currentUser.loggedIn">
                     <div class="session-item store-btn" @click="router.push('/plans')">
                         <font-awesome-icon icon="tags" class="mr-2" /> Pricing
                    </div>
                    <div class="session-item" @click="showSignIn=true">
                        Sign In
                    </div>
                </div>
                <div v-else class="session-info">
                    <div v-if="currentUser.accountType === 'sim'" class="session-item store-btn" @click="router.push('/plans')">
                         <font-awesome-icon icon="plane-departure" class="mr-2" /> Upgrades
                    </div>
                    <div v-else class="session-item store-btn" @click="router.push('/store')">
                         <font-awesome-icon icon="store" class="mr-2" /> Store
                         <div class="nudge-badge">New</div>
                    </div>
                    <div class="user-name" @click="showAccountDetails=true" title="Account Details">
                        <span class="pilot-icon">👨‍✈️</span>
                        {{ currentUser.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import { UrlService } from '../../services/UrlService';
import { currentUser } from '../../assets/data';
import AccountDetails from './AccountDetails.vue';
import Logo from './Logo.vue';
import SignIn from '../signin/SignIn.vue';

const emits = defineEmits(['about'])
const props = defineProps({
    name: { type: String, default: null },
    showSession: { type: Boolean, default: true },
    isModified: { type: Boolean, default: false }
})
const confirm = useConfirm()
const router = useRouter()
const showAccountDetails = ref(false)
const showSignIn = ref(false)
const test = ref(false)
const toaster = useToaster(useToast())

onMounted(() => {
    test.value = UrlService.isTest()
})

const openSignIn = () => {
    showSignIn.value = true
}

defineExpose({ openSignIn })

function onAuthentication(newUser:any) {
    showSignIn.value = false
    if(newUser) {
        toaster.success('Clear', 'Welcome ' + newUser.name)
        router.push({name:'Home',query:{_r:Date.now()}})
    } else {
        toaster.warning('Engine Roughness', 'Authentication failed')
    }
}

function onSignOut() {
    showAccountDetails.value = false
    confirm.require({
        message: 'You will loose access to your custom content.',
        header: 'Close Session',
        rejectLabel: 'Stay in',
        acceptLabel: 'Sign Out',
        accept: async () => {
            currentUser.logout()
            toaster.info('Signed Out', 'Log back in to access your templates')
            await router.push('/see-you-soon')
        }
    })
}

</script>

<style scoped>
.actions {
    display: flex;
    gap: 10px;
}
.icon {
    color: black;
}
.left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--logo-font-size);
    font-weight: bold;
    color: #1e3a8a;
}
.menu {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
}

.menu > div {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.templateName {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
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
.unsaved-badge {
    background-color: rgba(255, 240, 138, 0.5);
    color: #854d0e;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    text-transform: lowercase;
    border: 1px solid #facc15;
}
.right {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.session-info {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.session-item {
    cursor: pointer;
    background: var(--bg);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    transition: background 0.3s;
    text-decoration: none;
    display: inline-block;
    position: relative;
}

.session-item:hover {
    background: var(--bg-hover);
}

.store-btn {
    background-color: white !important;
    color: var(--bg-store) !important;
    border: 2px solid var(--bg-store) !important;
}
.store-btn:hover {
    background-color: var(--bg-store) !important;
    color: white !important;
}

.user-name {
    cursor: pointer;
    color: #64748b;
    font-weight: 500;
    transition: color 0.3s;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-name:hover {
    color: #1e3a8a;
}

.pilot-icon {
    font-size: 1rem;
}

/* Adjust template name display on narrow screens */
@media (max-width: 768px) {
    .templateName {
        max-width: 200px;
    }
    
    .session-info {
        gap: 10px;
    }
    
    .user-name {
        max-width: 100px;
    }
}

.right > div {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.nudge-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #f97316;
    color: white;
    font-size: 0.65rem;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 9999px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    text-transform: uppercase;
    line-height: 1;
}
</style>
