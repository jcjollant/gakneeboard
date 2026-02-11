<template>
    <Dialog modal header="Sign In">
      <!-- <div class="mb-5">
        <span>Signing In will enable the following features:</span>
        <span>
          <ul class="benefits-list">
            <li>💾 Save Custom Kneeboard</li>
            <li>🖨️ Print your creations or Ready to Print Kneeboards</li>
            <li>⚠ View current Notams</li>
            <li>📝 Feedback follow up</li>
          </ul>
        </span>
      </div> -->


      <div class="mb-5">
        <div class="block mb-2">Help us help more pilots: Where did you hear about us?</div>
        <OneChoice :choices="channels" v-model="selectedChannel" :full="true" @change="onChannelChange" />
      </div>

      <div v-if="errorMessage" class="error-message mb-3">
        {{ errorMessage }}
      </div>
      <div class="pending" v-if="authenticating">Working on it...</div>
      <div class="auth-divider" v-if="!authenticating">
        <span>Use a social account</span>
      </div>
      <div class="actions" v-if="!authenticating">
        <!-- <Button label="Do not sign in" @click="emits('close')" link></Button> -->
        <AppleSignInButton @success="onAppleSuccess" @error="onLoginError" />
        <GoogleSignInButton @success="onGoogleSuccess" @error="onLoginError" />
        <!-- <FacebookSignInButton @onSuccess="onFacebookSuccess" @onFailure="onLoginError" /> -->
      </div>

      <!-- Divider -->
      <div class="auth-divider" v-if="!authenticating">
        <span>or</span>
      </div>

      <!-- Email/Password Authentication -->
      <div v-if="!authenticating">
        <EmailPasswordAuth @success="onEmailPasswordSuccess" @error="onLoginError" />
      </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authenticationRequest } from '../../assets/data'

// Components
import AppleSignInButton from "./AppleSignInButton.vue"
import Button from 'primevue/button'; 
import Dialog from 'primevue/dialog';
import EmailPasswordAuth from './EmailPasswordAuth.vue'
// import FacebookSignInButton from './FacebookSignInButton.vue'
import GoogleSignInButton from './GoogleSignInButton.vue';
import OneChoice from '../shared/OneChoice.vue';
import { OneChoiceValue } from '../../models/OneChoiceValue';
import { AttributionService } from '../../services/AttributionService';

const emits = defineEmits(["close",'authentication']);

const channels = [
  new OneChoiceValue('?', ''),
  new OneChoiceValue('Blog', 'Blog'),
  new OneChoiceValue('Brochure', 'Brochure'),
  new OneChoiceValue('Facebook', 'Facebook'),
  new OneChoiceValue('Instagram', 'Instagram'),
  new OneChoiceValue('Press', 'Press'),
  new OneChoiceValue('YouTube', 'YouTube')
]
const selectedChannel = ref<OneChoiceValue | undefined>(channels[0])

function onChannelChange() {
  if (selectedChannel.value && selectedChannel.value.value != '') {
    AttributionService.saveAttribution('source:' + selectedChannel.value.value)
  }
}
const authenticating = ref(false)
const errorMessage = ref('')

function authenticate(source:string, token:string, user:any=undefined) {
  const payload = { source: source, token: token, user: user }
  authenticating.value = true;
  errorMessage.value = ''; // Clear previous errors
  authenticationRequest( payload)
    .then( user => {
      // console.log( "[SignIn.authenticate] user ", JSON.stringify(user))
      emits('authentication', user)
      authenticating.value = false;
    })
    .catch( e => {
      console.log('[SignIn.authenticate] error', e)
      if (e.response && e.response.status === 400) {
        if (e.response.data && typeof e.response.data === 'string') {
             errorMessage.value = e.response.data
        } else {
             errorMessage.value = "Sign in with Apple is not allowed with 'Hide My Email'. Please share your real email address or use another sign in method."
        }
      } else {
        errorMessage.value = "An error occurred during sign in. Please try again."
      }
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

function onEmailPasswordSuccess( data:any) {
  // console.log('[SignIn.onEmailPasswordSuccess]', data)
  // For Supabase auth, we need to get the access token from the session
  const { session, user } = data
  if (session && session.access_token) {
    authenticate('supabase', session.access_token, user)
  }
}

</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.pending {
  text-align: center;
}

.benefits-list {
  list-style: none;
  padding-left: 0;
}

.benefits-list li {
  margin-bottom: 0.5rem;
  margin-left: 1rem;
}

.error-message {
  color: var(--red-500, #ff0000); /* Fallback to red if var not defined */
  text-align: center;
  font-weight: bold;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--surface-border);
}

.auth-divider span {
  padding: 0 1rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

</style>
  