<template>
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Feedback v-model:visible="showFeedback" @close="showFeedback=false" />
    <About v-model:visible="showAbout" @close="showAbout=false" />
    <Maintenance v-model:visible="showMaintenance" @close="showMaintenance=false" />
    <Toast />
    <ConfirmDialog />
    <div class="application" @about="console.log('about')">
        <router-view ></router-view>
    </div>
    <div class="session">
      <Session v-if="route.name!='Print'" />
    </div>
    <MenuButton v-if="route.name!='Print'" icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=true" />
    <MenuButton v-if="route.name!='Print'" icon="circle-info" class="aboutButton" label="About GA Kneeboard"
      @click="showAbout=true" />
    <div v-if="route.name!='Print'" class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}
      <span class="maintenanceButton" v-show="true"
        @click="showMaintenance=true" @close="showMaintenance=false">&nbsp</span></div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { inject } from "@vercel/analytics"
import { backend, getBackend, newCurrentUser, version } from './assets/data';
import { LocalStore } from './lib/LocalStore';
import { TemplateData } from './assets/TemplateData';
import { useRoute, useRouter } from 'vue-router';
// Components
import About from './components/menu/About.vue'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './components/Feedback.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Maintenance from './components/menu/Maintenance.vue'
import MenuButton from './components/menu/MenuButton.vue';
import Session from './components/menu/Session.vue'
import Toast from 'primevue/toast'

const route = useRoute()
const router = useRouter()
const showAbout = ref(false)
const showFeedback = ref(false)
const showHowDoesItWork = ref(true)
const showMaintenance = ref(false)
const versionText = ref('')

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount( () => {
    // activate the last known user
    newCurrentUser.restore()

    getBackend().then(() => {
        versionText.value = version + '/' + backend.version
        LocalStore.cleanUp()
    })

    // How does it work popup check
    showHowDoesItWork.value = LocalStore.showHowDoesItWork()
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
    showMaintenance.value = false;

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
.aboutButton {
  position: fixed;
  right: var(--menu-border-offset);;
  bottom: var(--menu-border-offset);;
}
.session {
  position: fixed;
  right: 5px;
  top: 3px;
  min-width: 100px;
}
.versionDialog {
  position: absolute;
  right: 10px;
  bottom: 0;
  font-size: 8px;
  margin:auto;
  color: darkslategrey;
}
</style>