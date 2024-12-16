<template>
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <router-link to="/">Home</router-link>
    <router-link to="/template/0">Templates</router-link>
    <router-view></router-view>
    <div class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span></div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { inject } from "@vercel/analytics"
import { backend, getBackend, newCurrentUser, version } from './assets/data';
import { LocalStore } from './lib/LocalStore';
import { TemplateData } from './assets/TemplateData';
import { useRouter } from 'vue-router';
// Components
import HowDoesItWork from './components/HowDoesItWork.vue'


const router = useRouter()
const showHowDoesItWork = ref(true)
const versionText = ref('')

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount( () => {
    // activate the last known user
    newCurrentUser.restore()

    getBackend().then(() => {
        versionText.value = version + '/' + backend.version
    })

    // How does it work popup check
    showHowDoesItWork.value = LocalStore.showHowDoesItWork()
    if( showHowDoesItWork.value ) {
        LocalStore.setHowDoesItWork(false)
    }

    LocalStore.cleanUp()
})

onMounted( () => {

    // console.log( '[App.onMounted]', JSON.stringify(window.location.search))
    // Do we have anything to load from URL?
    let urlParams = new URLSearchParams(window.location.search);
    if( urlParams.has('sheet') || urlParams.has('t')) {
        const code = urlParams.has('t') ? urlParams.get('t') : urlParams.get('sheet')
        // console.log('[App.onMounted] publication code', code)

        // Get that publication data
        new Promise( (resolve, reject) => {
            TemplateData.getPublication(code).then( template => {
                console.log('[App.onMounted] publication found ', template)
                if(template) {
                    // Copy this template in localstore
                    LocalStore.saveTemplate(template)
                    router.push('/template/0')
                } else {
                    // template not found?
                    showToast( getToastData( 'Load Template','Code not found ' + code, toastError))
                }
            }).catch(e => {
                // Get publication failed
                showToast( getToastData( 'Load Template','Error fetching template ' + code, toastError))
            }) 
        })
    }

    // Analytics
    inject();
})

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  LocalStore.stopHowDoesItWork()
}


</script>

<style scoped>
.versionDialog {
  position: fixed;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  margin:auto;
  color: darkslategrey;
}
</style>