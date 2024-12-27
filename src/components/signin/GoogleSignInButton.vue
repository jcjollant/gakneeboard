<template>
    <div id="btnDiv"></div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onMounted, ref } from 'vue';

const emits = defineEmits(['success'])
const googleScriptLoaded = ref(false);

onBeforeMount( async () => {
    await loadGoogleScript()
})

onMounted(  () => {
})

const loadGoogleScript = () => {
return new Promise<void>((resolve, reject) => {
    if (googleScriptLoaded.value) {
    resolve()
    return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
        googleScriptLoaded.value = true
        const google = window['google'] 
        google.accounts.id.initialize({
            client_id: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com',
            callback: onSignIn
        })
        google.accounts.id.renderButton( 
            document.querySelector('#btnDiv'),
            {theme: "filled_black", size: "large"}
        )
        resolve()
    }
    script.onerror = (error) => reject(error)
    
    document.body.appendChild(script)
})
}

function onSignIn(payload) {
    // console.log('[GoogleSignInButton.onSignIn]');
    emits('success', payload)
}

</script>

<style scoped>
.btn-signin {
    display: inline-block;
    width: 150px;
}
</style>