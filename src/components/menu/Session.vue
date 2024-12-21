<template>
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <div class="session">
        <FAButton v-if="loggedIn" :label="newCurrentUser.name" title="Sign Out" :menu="true" class="signout"
          @click="onSignOut"></FAButton>
        <FAButton v-else label="Sign In" icon="fa-user" title="Sign In to enable custom data" :menu="true"
          @click="showSignIn=true"></FAButton>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { newCurrentUser } from '../../assets/data';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import FAButton from '../shared/FAButton.vue';
import SignIn from '../signin/SignIn.vue';

const confirm = useConfirm()
const router = useRouter()
const showSignIn = ref(false)
const toaster = useToaster(useToast())
const loggedIn = ref(false)

onMounted( () => {
    // console.log('[Session.onMounted]')
    newCurrentUser.addListener(onUserUpdate)
    loggedIn.value = newCurrentUser.loggedIn
})

onUnmounted( () => {
    // console.log('[Session.onUnmounted]')
    newCurrentUser.removeListener(onUserUpdate)
})

function onAuthentication(newUser:any) {
  // console.log('[Session.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( newUser) {
    toaster.success('Clear', 'Welcome ' + newUser.name)
    // reload Home Page
    router.push({name:'Home',query:{_r:Date.now()}});
  } else {
    toaster.warning('Engine Roughness', 'Authentication failed');  
  }
}
function onSignOut() {
  confirm.require({
      message: 'You will loose access to your custom content.',
      header: 'Close Session',
      rejectLabel: 'Stay in',
      acceptLabel: 'Sign Out',
      accept: () => {
        // logout and remo
        newCurrentUser.logout()
        toaster.info('Signed Out', 'Log back in to access your templates')

        // reload Home Page
        router.push({name:'Home',query:{_r:Date.now()}});
      }
    })
}

function onUserUpdate(currentUser:any) {
  // console.log('[Session.onUserUpdate]', JSON.stringify(currentUser.loggedIn))
  loggedIn.value = newCurrentUser.loggedIn
}


</script>

<style scoped>
.session {
    background-color: lightgrey;
}
.signout {
    padding: 0px 10px;
}
</style>