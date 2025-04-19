<template>
  <Dialog modal header="About GA Kneeboard">
    <div class="aboutPopup">
      <div class="pageOptions mb-5">
        <OneChoice v-model="activeTopic" :choices="topics" class="mb-2" />
      </div>
      <div v-if="activeTopic.value==topicAbout.value">
        <div class="mb-2 justify"><strong>GA Kneeboard</strong> was created to save our bacon when the iPad fails. Its sheer convenience made it a primary source of flight information.</div>
        <div class="mb-2 justify"><strong>You can help</strong> in many ways : 
          <ol>
            <li>Suggest features you value as a pilot,</li>
            <li>Show off your kneeboards to fellow pilots,</li>
            <li>Make your templates public for community's benefit,</li>
            <li>Test the app and report issues,</li>
          </ol>
        </div>
        <div class="justify"><strong>Special Thanks</strong> to Ash, Jason, Steve and Stewart whom have contributed invaluable feedback and suggestions since Day 1</div>
      </div>
      <div v-else-if="activeTopic.value==topicGuide.value" class="mb-5">
        <div class="mb-5 justify"><a :href="UserUrl.blog" target="_blank">GA Kneeboard Blog</a> is the best source for updates and user guides. For example:</div>
        <div class="mb-5 guides">
          <Button v-for="guide in guides" :label="guide.name" @click="openUrl(guide.url)" severity="help"></Button>
        </div>
        <div class="mb-5 justify">GA Kneeboard public <a :href="UserUrl.facebookProfile" target="_blank">Facebook Profile</a> is a good source for updates.</div>
      </div>
      <div v-else-if="activeTopic.value==topicWarning.value" class="warning-content mb-5">
        <div class="topWarning">
          <i class='pi pi-exclamation-triangle bigIcon'></i>
          <span>This is NOT an official source of flight information</span>
          <i class='pi pi-exclamation-triangle bigIcon'></i>
        </div>
        <div class="topWarning">
        <div class="topSub">Always take time to confirm all data points as a good preflight</div>
        </div>        
        <div class="warning-item mr-3">Information Currency</div>
        <div>FAA refreshes data every 28 days. The app may not be current.</div>
        <div class="warning-item mr-3">Pattern Altitudes</div>
        <div>Airport may have several TPA we are only showing one.</div>
        <div class="warning-item mr-3">Traffic Pattern Entry</div>
        <div>Are calculated theoretical values. They are not procedures.</div>
        <div class="warning-item mr-3">Weather Frequency</div>
        <div>Does not account for complex frequency allocation.</div>
        <div class="warning-item mr-3">Runway Frequency</div>
        <div>May not be displayed for airport that have a complex frequency allocation.</div>
        <div class="warning-item mr-3">Radio Flow Frequencies</div>
        <div>Are user defined (by you) and are not updated with data refresh.</div>
        <div class="warning-item mr-3">Magnetic Headings</div>
        <div>Are calculated with FAA variation data which can be quite old at some locations</div>
      </div>    
      <div class="actionDialog gap-2">
        <Button label="Privacy" @click="openUrl(UserUrl.privacy)" link></Button>
        <Button label="License" @click="openUrl(UserUrl.eula)" link></Button>
        <!-- <Button label="How Does It Work?" @click="emits('hdiw')" link></Button> -->
        <Button label="Got it" @click="emits('close')"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import OneChoice from "../shared/OneChoice.vue";
import { UserUrl } from '@/lib/UserUrl.ts'

const emits = defineEmits(["close","hdiw"]);

const guides = [
  {name:'Airport Tile', url:UserUrl.airportTileGuide},
  {name:'ATIS Tile', url:UserUrl.atisTileGuide},
  {name:"Checklist Syntax",url:UserUrl.checklistGuide},
  {name:'Fuel Bug Tile', url:UserUrl.fuelBugTileGuide},
  {name:"Radio Flow Tile", url:UserUrl.radioFlowTileGuide},
  {name:"Sun Light Tile", url:UserUrl.sunlightTileGuide},
]

const topicAbout = {label:'About',value:'about'}
const topicWarning = {label:'Warnings',value:'warning'}
const topicGuide = {label:'Help',value:'guide'}
const topics = ref([topicAbout,topicGuide,topicWarning])
const activeTopic = ref(topicAbout)

function openUrl(url) {
  window.open(url, '_blank')
}

</script>

<style scoped>
.aboutPopup {
  width:40rem;
}

.bigIcon {
  font-size: 2rem;
}
.guides {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  gap: 0.5rem;
}
ol {
  margin-block-start:0.25rem; 
}
.pageOptions {
  display: flex;
  justify-content: center;
}

.topWarning {
  grid-column: 1 / span 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: larger;
  font-weight: bold;
  color: darkorange;
  margin: auto;
}
.topSub {
  font-size: 1rem;
  font-weight: normal;
  color: black;
  margin: auto;
  margin-bottom: 2rem;
}
.warning-content {
  display: grid;
  grid-template-columns: auto auto;
}
.warning-item {
  font-weight: 700;
  text-align: right;
  margin-bottom: 0.5rem;
}
</style>