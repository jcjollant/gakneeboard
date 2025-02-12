<template>
    <Dialog modal header="Account Details" v-model:visible="showAccount" class="accountDialog">
      <div>
        <div class="account">
            <div class="key">Templates</div><div class="value templatesCount">{{currentUser.templates.length}} / {{ currentUser.maxTemplateCount }}</div>
            <div class="key">Pages</div><div class="value pagesCount">{{pagesCount}}</div>
            <div class="key">Account Type</div><div class="value accountType">Beta</div>
        </div>
        <div class="actions">
          <Button link label="Sign Out" class="btnSignOut" @click="onSignOut"></Button>
          <Button label="Stay In Pattern" @click="showAccount=false"></Button>
        </div>
      </div>
    </Dialog>
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <div class="session" v-if="loggedIn">
      <AccountTypeTag :type="currentUser.accountType" />
      <FAButton v-if="loggedIn" :label="currentUser.name" title="Account Details" :menu="true" class="signout"
          @click="onAccountDetails"></FAButton>
    </div>
    <div class="session" v-else>
        <FAButton label="Sign In" icon="fa-user" title="Sign In to enable custom data" :menu="true"
          @click="showSignIn=true"></FAButton>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { currentUser } from '../../assets/data';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/useToast';
import { useToaster } from '../../assets/Toaster';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FAButton from '../shared/FAButton.vue';
import SignIn from '../signin/SignIn.vue';
import AccountTypeTag from './AccountTypeTag.vue';

const confirm = useConfirm()
const pagesCount = ref(0)
const router = useRouter()
const showAccount = ref(false)
const showSignIn = ref(false)
const toaster = useToaster(useToast())
const loggedIn = ref(false)

onMounted( () => {
    // console.log('[Session.onMounted]')
    currentUser.addListener(onUserUpdate)
    loggedIn.value = currentUser.loggedIn
})

onUnmounted( () => {
    // console.log('[Session.onUnmounted]')
    currentUser.removeListener(onUserUpdate)
})

function onAccountDetails() {
  // refresh total values
  const total = currentUser.templates.reduce( (previous, template:any) => {
    previous.pages += template.pages
    previous.versions += template.ver
    return previous
  }, {pages:0,versions:0})
  // console.log('[Session.onAccountDetails] ', total)
  pagesCount.value = total.pages
  showAccount.value = true
}

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
  showAccount.value = false
  confirm.require({
      message: 'You will loose access to your custom content.',
      header: 'Close Session',
      rejectLabel: 'Stay in',
      acceptLabel: 'Sign Out',
      accept: () => {
        // logout and remo
        currentUser.logout()
        toaster.info('Signed Out', 'Log back in to access your templates')

        // reload Home Page
        router.push({name:'Home',query:{_r:Date.now()}});
      }
    })
}

function onUserUpdate(currentUser:any) {
  // console.log('[Session.onUserUpdate]', JSON.stringify(currentUser.loggedIn))
  loggedIn.value = currentUser.loggedIn
}


</script>

<style scoped>
.account {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
  width: 20rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}
.key {
  font-weight: bold;
  text-align: right;
}
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