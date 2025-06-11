<template>
    <div id='appleid-signin' class="signin-button" data-color="black" data-border="true" data-type="sign-in"></div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

const emits = defineEmits(['error','success'])

onBeforeUnmount( () => {
    document.removeEventListener('AppleIDSignInOnSuccess', onSuccess)
    document.removeEventListener('AppleIDSignInOnFailure', onFailure)
})

onMounted( () => {
    if(!(window as any).AppleID) {
        console.log('Apple Id auth script must be included')
        return
    }
    // extract the return url from the current page, removing additional path
    const origin:String = window.location.origin + '/';
    // console.log( '[AppleSignInButton.onMounted]', origin);
    
    (window as any).AppleID.auth.init({
        clientId : 'ga.kneeboard',
        scope : 'name email',
        redirectURI : origin,
        // state : 'testState',
        // nonce : 'testNonce',
        usePopup : true
    });

    document.addEventListener("AppleIDSignInOnSuccess", onSuccess);
    document.addEventListener("AppleIDSignInOnFailure", onFailure);
})

//

function onFailure(error:any) {
    console.log('[AppleSignInButton.onFailure]', error.detail.error);
    emits('error')
}

/*
Sample data
{
    "authorization": {
        "code": "c5eec38d4ca194c9fb51a32ab44d8c2b1.0.mrzuw.opAX5u8UqW9-71c4uEIzJA",
        "id_token": "eyJraWQiOiJGZnRPTlR4b0VnIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiZ2Eua25lZWJvYXJkIiwiZXhwIjoxNzMwMDgyNTg5LCJpYXQiOjE3Mjk5OTYxODksInN1YiI6IjAwMTk0Ni42MDFhZGI3Y2QwMmM0Y2VjYTUxNWFiN2QxZTE3OGIwNi4xOTM1IiwiY19oYXNoIjoiVkV1OVBMa2xqaVJlU3lRb0hZY3pKQSIsImVtYWlsIjoiamNAam9sbGFudC5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXV0aF90aW1lIjoxNzI5OTk2MTg5LCJub25jZV9zdXBwb3J0ZWQiOnRydWV9.lyRWCB4GGUPvCvK4HvpiH-ExJfj0I2X7ypqirAI10YqZ_pYKqquLcJx2FX2wk-nwj59jrQB6KOpfoUp-Fr-1vyCjfvfflJJaT4YexRnLBgbQicxFxPJnzfvnrQ7jMbAnKdBXA-ByaezcyuzLrLdbHrPdTjX2PV55sWq322DBhNlFCm4Bl8MyXBI-t4iCed21Zc7RvfjvOLnJB4i1TKQRn0aC9wUA4F2F_1FpyCJb5K76GA8g27NR9VwtW46J3IRQDJZz1cyvpHqnxmSTzPAoDrc7IHZPZOsy7TDOs2HLsHPvkUTIm-7tRZiKlSCIySOZe0Gbp56Tel7W24GWG2Ga4g"
    },
    "user": {
        "name": {
            "firstName": "JC",
            "lastName": "Jollant"
        },
        "email": "jc@jollant.net"
    }
}    
*/
function onSuccess(data:any) {
    // console.log('[AppleSignInButton.onSuccess]', data.detail);
    emits('success', {token:data.detail.authorization.id_token,user:data.detail.user})
}

</script>

<style scoped>
.signin-button {
    width: 210px;
    height: 40px;
    cursor: pointer;
}
</style>