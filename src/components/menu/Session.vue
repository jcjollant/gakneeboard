<template>
    <Dialog modal header="Account Details" v-model:visible="showAccount">
      <div class="accountDialog">
        <div class="account mb-5">
            <div class="key">Name</div><div class="value accountName">{{currentUser.name}}</div>
            <div class="key">Account Type</div>
            <div class="value accountType">
              <div>{{Formatter.accountType(currentUser.accountType)}}</div>
              <UpdateButton @click="onUpdateAccount" :manage="manage"/>
            </div>
            <div class="key">Templates</div><div class="value templatesCount">{{currentUser.templates.length}} / {{ currentUser.maxTemplateCount }}</div>
            <div class="key">Pages</div><div class="value pagesCount">{{pagesCount}} / {{ currentUser.maxPageCount }}</div>
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
import { Formatter } from '../../lib/Formatter';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FAButton from '../shared/FAButton.vue';
import SignIn from '../signin/SignIn.vue';
import UpdateButton from './UpdateButton.vue';
import { Checkout } from '../../assets/Checkout';
import { AccountType } from '../../model/AccounType';


const confirm = useConfirm()
const pagesCount = ref(0)
const router = useRouter()
const showAccount = ref(false)
const showSignIn = ref(false)
const toaster = useToaster(useToast())
const loggedIn = ref(false)
const manage = ref(false)

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

function onUpdateAccount() {
  showAccount.value = false
  if(manage.value) {
    toaster.info('Calling Tower', 'Stand By...')
    Checkout.manage(currentUser).then( (url:string) => {
      // console.log('[PricingPlans.onPlan]',url)
      window.location.href = url
    }).catch( (err:any) => {
      console.error(err)
    })
  } else {
    router.push('/plans')
  }
}

function onUserUpdate(currentUser:any) {
  // console.log('[Session.onUserUpdate]', JSON.stringify(currentUser.loggedIn))
  loggedIn.value = currentUser.loggedIn
  manage.value = currentUser.accountType != AccountType.simmer
}


</script>

<style scoped>
.account {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
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
.accountDialog {
  width: 400px;
}
.accountType {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>