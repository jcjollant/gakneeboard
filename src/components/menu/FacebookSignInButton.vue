<script setup>
import { onMounted } from 'vue'
import axios from 'axios'

const emits = defineEmits(['onSuccess', 'onFailure'])
const appId = '937186121782672'
const fields = 'email,first_name'
const scope = 'email,public_profile'
const version = 'v20.0'

//------
onMounted(() => {
  loadFacebookSDK(document, "script", "facebook-jssdk");
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: appId,
      cookie: true,
      xfbml: true,
      version: version,
    });
    window.FB.AppEvents.logPageView();
  };
})
//------

const loadFacebookSDK = async (d, s, id) => {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}

const login = async () => {
  try {
    // Check the current login status
    window.FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // User is already connected
            return extractInfo(response);
        } else {
            // User is not connected, trigger the login flow
            window.FB.login(function(response) {
            if (response.authResponse) {
                // User successfully logged in
                return extractInfo(response);
            } else {
                // Login failed
                return emits('onFailure');
            }
            }, {scope: scope});
        }
    });

    return false;
  } catch (error) {
    console.log('[FacebookSignInButton.login]' + error)
    return emits('onFailure')
  }
}

const extractInfo = async (loginResponse) => {
  const accessToken = loginResponse.authResponse.accessToken
  const profileResponse = await axios.get(`https://graph.facebook.com/${version}/me?fields=${fields}&access_token=${accessToken}`)
  const authInfo = profileResponse?.data
  return emits('onSuccess', {...loginResponse, authInfo})
}

</script>

<template>
    <div class="fb-button" @click="login">
      <font-awesome-icon :icon="['fab', 'facebook-f']" />
      <!-- <i class="fa-brands fa-facebook-f"></i> -->
      <div>Facebook SignIn</div>
    </div>
</template>
<style scoped>
.fb-button {
  display: flex;
  color: white;
  background-color: #1967d2;
  border-radius: 3px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
}
</style>