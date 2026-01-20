<template>
    <Feedback v-if="route.name!=RouterNames.Print" :open="showFeedback" @submit="feedbackSubmitted"  />
    <About v-model:visible="showAbout" @close="showAbout=false" />
    <Maintenance v-model:visible="showMaintenance" @close="showMaintenance=false" />

    <Eula v-model:visible="showEula" @close="showEula=false" />
    <Version v-model:visible="showVersion" @close="showVersion=false" :front="versionFront" :back="backend.version" />
    <Toast />
    <ConfirmDialog />
    <div class="application">
        <router-view ></router-view>
    </div>
    <!-- Session component disabled - functionality moved to Menu.vue
    <div class="session">
      <Session v-if="route.name!=RouterNames.Print && route.name!=RouterNames.ThankYou" />
    </div>
    -->
    <MenuButton v-if="route.name!='Print'" icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=!showFeedback" />
    <MenuButton v-if="route.name!='Print'" icon="circle-info" class="aboutButton" label="About GA Kneeboard"
      @click="showAbout=true" />
    <div v-if="route.name!='Print'" class="versionDialog" title="Version Number. Click for details." @click="showVersion=true">v{{ versionFront }}
      <span class="maintenanceButton" v-show="true"
        @click="showMaintenance=true" @close="showMaintenance=false">&nbsp</span></div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { backend, getBackend, currentUser, routeToLocalTemplate, version } from './assets/data';
import { LocalStoreService } from './services/LocalStoreService';
import { TemplateService } from './services/TemplateService';
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
// import Session from './components/menu/Session.vue' // Disabled - functionality moved to Menu.vue
import Toast from 'primevue/toast'

import Eula from './components/menu/Eula.vue';
import Version from './components/menu/Version.vue';

const route = useRoute()
const router = useRouter()
const showAbout = ref(false)
const showEula = ref(false)
const showFeedback = ref(false)
const showMaintenance = ref(false)

const showVersion = ref(false)
const versionFront = ref('')
const toaster = useToaster( useToast())

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount( () => {
    // activate the last known user
    currentUser.restore()

    getBackend().then(() => {
      // Build version text
      versionFront.value = version
      LocalStoreService.cleanUp()
      // console.log('[App.onBeforeMount]', currentUser)
      // console.log('[App.onBeforeMount] pages ', currentUser.pageCount, currentUser.maxPageCount)
      // console.log('[App.onBeforeMount] tempaltes ', currentUser.templates.length, currentUser.maxTemplateCount)
      if(currentUser.loggedIn && !currentUser.eulaCurrent) {
        showEula.value = true
      }
    })
})

onMounted( () => {

    // console.debug( '[App.onMounted]', JSON.stringify(window.location.search), router.currentRoute.value)

    // test current route name
    if(window.location.pathname == '/') {
      // Do we have anything to load from URL?
      let urlParams = new URLSearchParams(window.location.search);
  
      // do we have a template
      const templateCode = urlParams.get('t')
      const demoCode = urlParams.get('d')
      const testCode = urlParams.get('test')
      if( templateCode) {
          // console.log('[App.onMounted] publication code', code)

          // Get that publication data
          new Promise( (resolve, reject) => {
              TemplateService.getPublication(templateCode).then( (template: any) => {
                  // console.log('[App.onMounted] publication found ', template)
                  if(template) {
                      routeToLocalTemplate(router, template)
                  } else {
                      // template not found?
                      toaster.error('Load Template','Code not found ' + templateCode)
                  }
              }).catch((e: any) => {
                  // Get publication failed
                  toaster.error('Load Template','Error fetching template ' + templateCode)
                  console.log('[App.onMounted] publication fetch failed', e)
              }) 
          })
      } else if( demoCode){ // this is a demo
        const template = DemoData.fromName( 'gak-' + demoCode )
        if( template) {
          routeToLocalTemplate(router, template)
        }
      } else if( testCode) { // this is a test
        router.push({path: 'test/' + testCode})
      }
      if( templateCode) {
          // console.log('[App.onMounted] publication code', code)

          // Get that publication data
          new Promise( (resolve, reject) => {
              TemplateService.getPublication(templateCode).then( (template: any) => {
                  // console.log('[App.onMounted] publication found ', template)
                  if(template) {
                      routeToLocalTemplate(router, template)
                  } else {
                      // template not found?
                      toaster.error('Load Template','Code not found ' + templateCode)
                  }
              }).catch((e: any) => {
                  // Get publication failed
                  toaster.error('Load Template','Error fetching template ' + templateCode)
                  console.log('[App.onMounted] publication fetch failed', e)
              }) 
          })
      } else if( demoCode){ // this is a demo
        const template = DemoData.fromName( 'gak-' + demoCode )
        if( template) {
          routeToLocalTemplate(router, template)
        }
      } else if( testCode) { // this is a test
        router.push({path: 'test/' + testCode})
      } else if( LocalStoreService.popupShow(3)) {
        // change route to FTUX but preserve url parameters
        router.push({name: RouterNames.FTUX})
      }
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
//   LocalStoreService.popupHide(1)
// }

// function onClosePopup(remember) {
//   showPopup.value = false
//   if(remember) {
//     LocalStoreService.popupHide(2)
//   }
// }

</script>

<style scoped>
.application {
  display: flex;
  flex-flow: column;
  background-repeat: no-repeat;
  background-position: right bottom;
  /* background-image: url('/assets/halloween.png'); */
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
  cursor: pointer;
}
</style>