<template>
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Feedback v-model:visible="showFeedback" />
    <Toast />
    <div class="application">
        <Menu v-if="route.name!='Print'"></Menu>
        <router-view></router-view>
    </div>
    <MenuButton v-if="route.name!='Print'" icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=true" />
    <div v-if="route.name!='Print'" class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span></div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { inject } from "@vercel/analytics"
import { backend, getBackend, newCurrentUser, version } from './assets/data';
import { LocalStore } from './lib/LocalStore';
import { TemplateData } from './assets/TemplateData';
import { useRoute, useRouter } from 'vue-router';
// Components
import Feedback from './components/Feedback.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Menu from './components/menu/Menu.vue'
import MenuButton from './components/menu/MenuButton.vue';
import Toast from 'primevue/toast'

const route = useRoute()
const router = useRouter()
const showFeedback = ref(false)
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
.application {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
}
.feedbackButton {
  position: fixed;
  left: var(--menu-border-offset);;
  bottom: var(--menu-border-offset);;
}

.versionDialog {
  position: fixed;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  margin:auto;
  color: darkslategrey;
}
</style>