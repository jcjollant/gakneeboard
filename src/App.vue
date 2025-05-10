<template>
    <Feedback v-if="route.name!=RouterNames.Print" :open="showFeedback" @submit="feedbackSubmitted"  />
    <About v-model:visible="showAbout" @close="showAbout=false" />
    <Maintenance v-model:visible="showMaintenance" @close="showMaintenance=false" />
    <Maxed v-model:visible="showMaxed" @close="showMaxed=false" />
    <Toast />
    <ConfirmDialog />
    <div class="application">
        <router-view ></router-view>
    </div>
    <div class="session">
      <Session v-if="route.name!=RouterNames.Print && route.name!=RouterNames.ThankYou" />
    </div>
    <MenuButton v-if="route.name!='Print'" icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=!showFeedback" />
    <MenuButton v-if="route.name!='Print'" icon="circle-info" class="aboutButton" label="About GA Kneeboard"
      @click="showAbout=true" />
    <div v-if="route.name!='Print'" class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}
      <span class="maintenanceButton" v-show="true"
        @click="showMaintenance=true" @close="showMaintenance=false">&nbsp</span></div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { backend, getBackend, currentUser, routeToLocalTemplate, version } from './assets/data';
import { LocalStore } from './lib/LocalStore';
import { TemplateData } from './assets/TemplateData';
import { useRoute, useRouter } from 'vue-router';
import { RouterNames } from './router';
import { useToaster } from './assets/Toaster';
import { useToast } from 'primevue/usetoast';
import { DemoData } from './assets/DemoData';
// Components
import About from './components/menu/About.vue'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './components/dialog/Feedback.vue'
import Maintenance from './components/menu/Maintenance.vue'
import MenuButton from './components/menu/MenuButton.vue';
import Session from './components/menu/Session.vue'
import Toast from 'primevue/toast'
import Maxed from './components/menu/Maxed.vue';

const route = useRoute()
const router = useRouter()
const showAbout = ref(false)
const showFeedback = ref(false)
const showMaintenance = ref(false)
const showMaxed = ref(false)
const versionText = ref('')
const toaster = useToaster( useToast())

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount( () => {
    // activate the last known user
    currentUser.restore()

    getBackend().then(() => {
      // Build version text
      versionText.value = version + '/' + backend.version
      LocalStore.cleanUp()
      // console.log('[App.onBeforeMount]', currentUser)
      // console.log('[App.onBeforeMount] pages ', currentUser.pageCount, currentUser.maxPageCount)
      // console.log('[App.onBeforeMount] tempaltes ', currentUser.templates.length, currentUser.maxTemplateCount)
      if(currentUser.pageCount > currentUser.maxPageCount || currentUser.templates.length > currentUser.maxTemplateCount) {
        showMaxed.value = true
      }
    })
})

onMounted( () => {

    // console.log( '[App.onMounted]', JSON.stringify(window.location.search))
    // Do we have anything to load from URL?
    let urlParams = new URLSearchParams(window.location.search);
    // do we have a template
    const code = urlParams.get('t')
    if( code) {
        // console.log('[App.onMounted] publication code', code)

        // Get that publication data
        new Promise( (resolve, reject) => {
            TemplateData.getPublication(code).then( (template: any) => {
                // console.log('[App.onMounted] publication found ', template)
                if(template) {
                    routeToLocalTemplate(router, template)
                } else {
                    // template not found?
                    toaster.error('Load Template','Code not found ' + code)
                }
            }).catch((e: any) => {
                // Get publication failed
                toaster.error('Load Template','Error fetching template ' + code)
                console.log('[App.onMounted] publication fetch failed', e)
            }) 
        })
    } else if( urlParams.has('d')){
      const name = urlParams.get('d');
      const template = DemoData.fromName( 'gak-' + name )
      if( template) {
        routeToLocalTemplate(router, template)
      }
    } else if( LocalStore.popupShow(3)) {
      router.push({name: RouterNames.FTUX})
    }

    showMaintenance.value = false;
})

function feedbackSubmitted() {
  // wait before closing the feedback drawer
  setTimeout( () => {
    showFeedback.value = false
  }, 100)
}

// function onCloseHowDoesItWork() {
//   showHowDoesItWork.value =  false
//   LocalStore.popupHide(1)
// }

// function onClosePopup(remember) {
//   showPopup.value = false
//   if(remember) {
//     LocalStore.popupHide(2)
//   }
// }

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