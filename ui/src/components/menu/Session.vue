<template>
    <AccountDetails v-model:visible="showAccountDetails" :user="currentUser" @signout="onSignOut" @close="showAccountDetails=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <div class="session" v-if="loggedIn">
      <!-- <AccountTypeTag :type="currentUser.accountType" /> -->
      <FAButton v-if="loggedIn" :label="currentUser.name" title="Account Details" :menu="true"
          @click="onAccountDetails"></FAButton>
    </div>
    <div class="session" v-else>
        <FAButton label="Sign In" icon="fa-user" title="Sign In to enable custom data" :menu="true" class="signInButton"
          @click="showSignIn=true" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { currentUser } from '../../assets/data';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import AccountDetails from './AccountDetails.vue';
import FAButton from '../shared/FAButton.vue';
import SignIn from '../signin/SignIn.vue';

const confirm = useConfirm()
const router = useRouter()
const showAccountDetails = ref(false)
const showSignIn = ref(false)
const toaster = useToaster(useToast())
const loggedIn = ref(false)

onMounted( () => {
    // console.log('[Session.onMounted]')
    currentUser.addListener(onUserUpdate)
    loggedIn.value = currentUser.loggedIn
    onUserUpdate(currentUser)
})

onUnmounted( () => {
    // console.log('[Session.onUnmounted]')
    currentUser.removeListener(onUserUpdate)
})

function onAccountDetails() {
  showAccountDetails.value = true
}

function onAuthentication(newUser:any) {
  // console.log('[Session.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( newUser) {
    // console.log('[Session.onAuthentication] ', newUser)
    toaster.success('Clear', 'Welcome ' + newUser.name)
    // reload Home Page
    window.location.reload()
  } else {
    toaster.warning('Engine Roughness', 'Authentication failed');  
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
        // logout and remo
        currentUser.logout()
        toaster.info('Signed Out', 'Log back in to access your templates')

        // reload Home Page
        await router.push('/see-you-soon')
      }
    })
}

function onUserUpdate(currentUser:any) {
  // console.log('[Session.onUserUpdate]', JSON.stringify(currentUser.loggedIn))
  loggedIn.value = currentUser.loggedIn
}

</script>

<style scoped>
.session {
  display: flex;  
  align-items: center;
  gap: 5px;
  background-color: lightgrey;
}
.signout {
    padding: 0px 10px;
}
</style>