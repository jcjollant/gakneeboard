<template>
    <AccountDetails v-model:visible="showAccountDetails" :user="currentUser" @signout="onSignOut" @close="showAccountDetails=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" @authentication="onAuthentication" />
    <div class="menu" >
        <div>
            <div class="left">
                <Logo :hasTemplate="!!name" @click="router.push('/')" />
                <font-awesome-icon v-if="name" class="icon" icon="fa-chevron-right" />
                <div v-if="name" title="Active Template Name" class="templateName">{{name}}</div>
                <div v-if="test" class="test">Test Backend</div>
            </div>
            <div v-if="showSession" class="right">
                <div v-if="!currentUser.loggedIn">
                     <div class="session-item store-btn" @click="router.push('/store')">
                         <font-awesome-icon icon="store" class="mr-2" /> Store
                    </div>
                    <div class="session-item" @click="showSignIn=true">
                        Sign In
                    </div>
                </div>
                <div v-else class="session-info">
                    <div class="session-item store-btn" @click="router.push('/store')">
                         <font-awesome-icon icon="store" class="mr-2" /> Store
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
import { AccountType } from '@gak/shared';

const emits = defineEmits(['about'])
const props = defineProps({
    name: { type: String, default: null },
    showSession: { type: Boolean, default: true }
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
.test {
    border-radius: 5px;;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 2px 5px;
    color: white;
    background-color: red;
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
</style>
