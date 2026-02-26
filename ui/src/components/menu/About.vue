<template>
  <Dialog modal header="About GA Kneeboard" :visible="visible" @update:visible="emit('update:visible', $event)">
    <div class="aboutPopup">
      <div class="pageOptions mb-5">
        <OneChoice v-model="activeTopic" :choices="topics" class="mb-2" />
      </div>
      <div v-if="activeTopic.value==topicAbout.value">
        <div class="mb-2 justify"><strong>GA Kneeboard</strong> purpose is to make general aviation pilots safer by providing clear information on a media that never fails. Hence <strong>Better Kneeboards, Safer Pilots</strong>.</div>
        <div class="mb-2 justify">Stay tuned with our progress:</div>
        <div class="allButtons">
          <div v-for="guide in guides">
            <FAButton :iconclass="guide.iconclass || 'fab'" :icon="guide.icon" :label="guide.name" @click="openUrl(guide.url)" :link="true" class="oneButton" />
            <div class="buttonDesc">{{ guide.subtitle }}</div>
          </div>
        </div>
        <div class="mb-5">GA Kneeboard is proudly made in the <strong>USA 🇺🇸</strong> since 2024. Original artwork is copyrighted © 2024-{{ new Date().getFullYear() }} by <strong>Aviate Software LLC</strong></div>
        <div class="justify"><strong>Thanks</strong> to Ash, Jason, Mike, Nando, Steve, Stewart and Trenton for their repeated feedback</div>
      </div>
      <div v-else-if="activeTopic.value==topicGuide.value" class="mb-5">
        <div class="mb-2 justify"><strong>You can help</strong> in many ways : 
          <ol>
            <li>Suggest features via "Give Feedback" or <a href="mailto:support@kneeboard.ga">email</a></li>
            <li>Show off your kneeboards to fellow pilots,</li>
            <li>Make your templates public for community's benefit,</li>
            <li>Test the app and report issues,</li>
          </ol>
          And of course, purchase a <a href="/plans">subscription</a>!
        </div>
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
        <div>Always take time to confirm all data points as a good preflight</div>
      </div>
      <div v-else-if="activeTopic.value==topicVersion.value" class="version-content mb-5">
        <div class="versions-container mb-5">
          <div class="version-item">
              <div class="mb-2 font-bold text-lg">Interface</div>
              <font-awesome-icon icon="fa-solid fa-display" class="large-icon mb-2"/>
              <div class="text-3xl">v{{ versionFront }}</div>
          </div>
          <div class="version-item">
              <div class="mb-2 font-bold text-lg">Backend</div>
              <font-awesome-icon icon="fa-solid fa-cloud" class="large-icon mb-2" />
              <div class="text-3xl">v{{ versionBack }}</div>
          </div>
        </div>
        <div class="info-box mb-5">
            <div class="font-bold mb-1">Stay Current</div>
            <div>We publish updates on a regular basis. Check <a :href="UserUrl.blog" target="_blank" class="no-underline text-primary">GA Kneeboard blog</a> for the most current posts.</div>
        </div>
      </div>
      <div class="actionDialog gap-2">
        <Button label="Privacy Policy" @click="openUrl(UserUrl.privacy)" link></Button>
        <Button label="End User License Agreement" @click="openUrl(UserUrl.eula)" link></Button>
        <Button label="Accept EULA" @click="acceptEula" link></Button>
        <!-- <Button label="How Does It Work?" @click="emits('hdiw')" link></Button> -->
        <Button label="Got it" @click="emit('close')"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { UserUrl } from '@/lib/UserUrl.ts'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FAButton from "../shared/FAButton.vue";
import OneChoice from "../shared/OneChoice.vue";
import { postEula } from "../../assets/data";

const props = defineProps({
  visible: { type: Boolean, default: false },
  activeTab: { type: String, default: 'about' },
  versionFront: { type: String, default: '' },
  versionBack: { type: String, default: '' },
})

const emit = defineEmits(["close","hdiw", "update:visible"]);

const guides = [
  {name:'',icon:'pen-nib',iconclass:'fas',subtitle:'Blog & Updates', url:UserUrl.blog},
  {name:'',icon:'youtube',subtitle:'Demos', url:UserUrl.youTubeChannel},
  {name:'',icon:'newspaper',iconclass:'fas',subtitle:'Press Release', url:UserUrl.press},
]

const topicAbout = {label:'About',value:'about'}
const topicWarning = {label:'Warnings',value:'warning'}
const topicGuide = {label:'Help',value:'guide'}
const topicVersion = {label:'Version',value:'version'}
const topics = ref([topicAbout,topicGuide,topicWarning,topicVersion])
const activeTopic = ref(topicAbout)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    const target = topics.value.find(t => t.value === props.activeTab)
    if (target) activeTopic.value = target
    else activeTopic.value = topicAbout
  }
})

function openUrl(url) {
  window.open(url, '_blank')
}

async function acceptEula() {
  // console.debug('[About.acceptEula] accepted')
  await postEula()
}

</script>

<style scoped>
.aboutPopup {
  width:40rem;
}

.bigIcon {
  font-size: 2rem;
}

.bottom {
  margin-top: 1rem;
  grid-column: 1 / span 2;
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
.allButtons {
  display: flex;
  gap: 2rem;
  margin: 1rem;
  justify-content: center;
}
.oneButton {
  width: 10rem;
  height: 5rem;
  font-size: 3rem;
  border-radius: 10px;
}
.buttonDesc {
  font-size: 0.75rem;
  text-align: center;
  margin-top: 0.5rem;
}

.versions-container {
    display: flex;
    justify-content: center;
    gap: 5rem;
}

.version-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.large-icon {
    font-size: 3rem;
    color: var(--primary-color);
}

.info-box {
    background-color: var(--surface-100);
    padding: 1rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
}
</style>