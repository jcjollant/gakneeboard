<template>
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Popup v-model:visible="showPopup" @close="onClosePopup" />
    <Feedback v-model:visible="showFeedback" @close="showFeedback=false" />
    <About v-model:visible="showAbout" @close="showAbout=false" />
    <Maintenance v-model:visible="showMaintenance" @close="showMaintenance=false" />
    <Toast />
    <ConfirmDialog />
    <div class="application" @about="console.log('about')">
        <router-view ></router-view>
    </div>
    <div class="session">
      <Session v-if="route.name!=RouterNames.Print && route.name!=RouterNames.ThankYou" />
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
import { backend, getBackend, currentUser, routeToLocalTemplate, version } from '@/assets/data';
import { LocalStore } from '@/lib/LocalStore';
import { TemplateData } from '@/assets/TemplateData';
import { useRoute, useRouter } from 'vue-router';
import { getTemplateDataFromName } from '@/assets/sheetData';
// Components
import About from '@/components/menu/About.vue'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from '@/components/dialog/Feedback.vue'
import HowDoesItWork from '@/components/dialog/HowDoesItWork.vue'
import Maintenance from '@/components/menu/Maintenance.vue'
import Popup from '@/components/dialog/Popup.vue'
import MenuButton from '@/components/menu/MenuButton.vue';
import Session from '@/components/menu/Session.vue'
import Toast from 'primevue/toast'
import { RouterNames } from './router';

const route = useRoute()
const router = useRouter()
const showAbout = ref(false)
const showFeedback = ref(false)
const showHowDoesItWork = ref(true)
const showPopup = ref(false)
const showMaintenance = ref(false)
const versionText = ref('')

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount( () => {
    // activate the last known user
    currentUser.restore()

    getBackend().then(() => {
        versionText.value = version + '/' + backend.version
        LocalStore.cleanUp()
    })

    // How does it work popup check
    showHowDoesItWork.value = LocalStore.popupShow(1)
    // Next popup check, needs current user.
    if(!showHowDoesItWork.value && currentUser.loggedIn && currentUser.templates.length > 1) {
      showPopup.value = LocalStore.popupShow(2)
    }
    // console.log('[App.onBeforeMount]', showHowDoesItWork.value, showPopup.value)
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
                    routeToLocalTemplate(router, template)
                } else {
                    // template not found?
                    showToast( getToastData( 'Load Template','Code not found ' + code, toastError))
                }
            }).catch(e => {
                // Get publication failed
                showToast( getToastData( 'Load Template','Error fetching template ' + code, toastError))
            }) 
        })
    } else if( urlParams.has('d')){
      const name = urlParams.get('d');
      const template = getTemplateDataFromName( 'gak-' + name )
      if( template) {
        loadLocalTemplate( template )
      }
    }
    showMaintenance.value = false;
})

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  LocalStore.popupHide(1)
}

function onClosePopup(remember) {
  showPopup.value = false
  if(remember) {
    LocalStore.popupHide(2)
  }
}

</script>

<style scoped>
.application {
  display: flex;
  flex-flow: column;
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
  right: 10px;
  top: 3px;
}
.versionDialog {
  position: fixed;
  right: 10px;
  bottom: 0;
  font-size: 8px;
  margin:auto;
  color: darkslategrey;
}
</style>