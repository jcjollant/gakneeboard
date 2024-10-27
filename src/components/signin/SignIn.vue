<template>
    <Dialog modal header="Sign In">
      <div class="mb-5">
        <span>Signing In will enable the following features:</span>
        <span>
          <ul>
            <li>Multiple Templates</li>
            <li>Use and create community templates</li>
            <li>Custom Airports Data</li>
            <li>Feedback follow up</li>
          </ul>
        </span>
      </div>

      <div class="pending" v-if="authenticating">Working on it...</div>
      <div class="actions" v-else>
        <Button label="Do not sign in" @click="emits('close')" link></Button>
        <AppleSignInButton @success="onAppleSuccess" @error="onLoginError" />
        <GoogleSignInButton @success="onGoogleSuccess" @error="onLoginError" />
        <!-- <FacebookSignInButton @onSuccess="onFacebookSuccess" @onFailure="onLoginError" /> -->
      </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog';
import AppleSignInButton from "./AppleSignInButton.vue"
import { GoogleSignInButton } from "vue3-google-signin"
import Button from 'primevue/button'; 
import { authenticationRequest } from '../../assets/data'
// import FacebookSignInButton from './FacebookSignInButton.vue'

const emits = defineEmits(["close",'authentication']);
const authenticating = ref(false)

function authenticate(source:string, token:string, user:any=undefined) {
  const payload = { source: source, token: token, user: user }
  authenticating.value = true;
  authenticationRequest( payload)
    .then( user => {
      // console.log( "[SignIn.authenticate] user ", JSON.stringify(user))
      emits('authentication', user)
      authenticating.value = false;
    })
    .catch( e => {
      console.log('[SignIn.authenticate]' + e)
      authenticating.value = false;
    })
}

function onLoginError() {
  console.log("Login failed")
}

function onAppleSuccess( data:any) {
  // console.log('[SingIn.onAppleSuccess]')
  authenticate('apple', data.token, data.user)
}

function onGoogleSuccess( response:any) {
  const { credential } = response
  // console.log( "[SignIn.onGoogleSuccess] Access Token", credential)
  authenticate('google', credential)
}

</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.pending {
  text-align: center;
}
</style>
  