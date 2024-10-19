<template>
    <Dialog modal header="Sign In">
      <div class="mb-5">
        <span>Signing In will enable the following features:</span>
        <span>
          <ul>
            <li>Custom Template Saving & Sharing</li>
            <li>Custom Airports Data</li>
            <li>Feedback follow up</li>
          </ul>
        </span>
      </div>

      <div class="actions">
        <Button label="Do not sign in" @click="emits('close')" link></Button>
        <!-- <AppleSignInButton @success="onAppleSuccess" @error="onLoginError" /> -->
        <GoogleSignInButton @success="onGoogleSuccess" @error="onLoginError" />
        <!-- <FacebookSignInButton
          @onSuccess="onFacebookSuccess" 
          @onFailure="onLoginError" /> -->
      </div>
    </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
// import { AppleSignInButton } from "./AppleSignInButton.vue"
import { GoogleSignInButton } from "vue3-google-signin"
import Button from 'primevue/button'; 
import { authenticate } from '../../assets/data'
// import FacebookSignInButton from './FacebookSignInButton.vue'

const emits = defineEmits(["close",'authentication']);

function onLoginError() {
  console.log("Login failed")
}

function onAppleSuccess() {
  console.log('[SingIn.onAppleSuccess]')
}

async function onGoogleSuccess( response) {
  const { credential } = response;
  // console.log( "[SignIn.handleLoginSuccess] Access Token", credential)
  // console.log( "[SignIn.handleLoginSuccess] User", decodeCredential(credential))
  authenticate( 'google', credential)
    .then( user => {
      // console.log( "[SignIn.handleLoginSuccess] user ", JSON.stringify(user))
      emits('authentication', user)
    })
}

// function onFacebookSuccess( response) {
//   // console.log('[SignIn.onFacebookSuccess]', typeof response, response)
//   authenticate( 'facebook', response)
//     .then( user => {
//       emits('authentication', user)
//     })
// }

</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

</style>
  