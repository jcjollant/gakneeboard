<template>
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <ConfirmDialog />
    <div class="session">
        <FAButton v-if="user.loggedIn" :label="user.name" title="Sign Out" :menu="true" class="signout"
          @click="onSignOut"></FAButton>
        <FAButton v-else label="Sign In" icon="fa-user" title="Sign In to enable custom data" :menu="true"
          @click="showSignIn=true"></FAButton>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { newCurrentUser } from '../../assets/data';
import { Toaster } from '../../assets/toaster';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import FAButton from '../shared/FAButton.vue';
import SignIn from '../signin/SignIn.vue';

const confirm = useConfirm()
const showSignIn = ref(false)
const toaster = new Toaster(useToast())
const user = ref(newCurrentUser)

onMounted( () => {
    newCurrentUser.addListener(onUserUpdate)
})

function onAuthentication(newUser) {
  // console.log('[Menu.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( newUser) {
    toaster.info('Clear', 'Welcome ' + newUser.name)
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

        // reload the page
        location.reload()
      }
    })
}

function onUserUpdate(currentUser) {
  // console.log('[TemplateMenu.onUserUpdate]', JSON.stringify(currentUser))
  user.value = currentUser
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