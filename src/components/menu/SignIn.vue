<script setup>
import Dialog from 'primevue/dialog';
import { GoogleSignInButton, decodeCredential } from "vue3-google-signin"
import Button from 'primevue/button'; 
import { authenticate } from '../../assets/data'

const emits = defineEmits(["close",'authentication']);

function handleLoginError() {
  console.log("Login failed")
}

async function handleLoginSuccess( response) {
  const { credential } = response;
  // console.log( "[SignIn.handleLoginSuccess] Access Token", credential)
  // console.log( "[SignIn.handleLoginSuccess] User", decodeCredential(credential))
  const user = await authenticate( 'google', credential)
  // .then( user => {
  //   console.log( "[SignIn.handleLoginSuccess] user ", JSON.stringify(user))
  // })
  emits('authentication', user)

}

</script>
<template>
    <Dialog modal header="Sign In">
      <div class="mb-5">
        <span>Sign In is necessary to enable the following features:</span>
        <span>
          <ul>
            <li>Custom Airports Data</li>
            <li>Feedback follow up</li>
          </ul>
        </span>
      </div>

      <div class="actions">
        <Button label="Do not sign in" @click="emits('close')" link></Button>
        <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError"></GoogleSignInButton>
      </div>
    </Dialog>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
</style>
  