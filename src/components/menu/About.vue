<script setup>
import { ref } from "vue";

import { urlBlog, urlFacebookGroup, urlGuideAirport, urlGuideAtis, urlGuideChecklist, urlGuideFuelBug, urlGuideRadioFlow, urlGuideSunlight } from '../../assets/data'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import SelectButton from 'primevue/selectbutton'

const emits = defineEmits(["close"]);

const guides = [
  {name:'Airport Tile', url:urlGuideAirport},
  {name:'ATIS Tile', url:urlGuideAtis},
  {name:"Checklist Syntax",url:urlGuideChecklist},
  {name:'Fuel Bug Tile', url:urlGuideFuelBug},
  {name:"Radio Flow Tile", url:urlGuideRadioFlow},
  {name:"Sun Light Tile", url:urlGuideSunlight},
]

const topicAbout = {name:'About',value:'about'}
const topicWarning = {name:'Warnings',value:'warning'}
const topicGuide = {name:'Help',value:'guide'}
const topics = ref([topicAbout,topicGuide,topicWarning])
const activeTopic = ref(topicAbout)

function openUrl(url) {
  window.open(url, '_blank')
}

</script>

<template>
  <Dialog modal header="About GA Kneeboard">
    <div class="aboutPopup">
      <div class="pageOptions mb-5">
        <SelectButton v-model="activeTopic" :options="topics" optionLabel="name" aria-labelledby="basic" class="mb-2" />
      </div>
      <div v-if="activeTopic.value==topicAbout.value">
        <div class="mb-5 justify"><strong>GA Kneeboard</strong> started as a personal project but users feedback made it the useful utility it is today. It is meant to mitigate high information loads, associated to flying, with easily accessible essential information. Originally intended as a supplement to pilot's EFB, the kneeboard printout has become a primary source of information due to its sheer convenience.<br>GA Kneeboard is free to use. If you find it useful, please consider spreading the word and sending your suggestions.</div>
        <div class="justify"><strong>Special Thanks</strong> to Ash, Jason, Steve and Stewart whom have contributed invaluable feedback and suggestions since Day 1</div>
      </div>
      <div v-else-if="activeTopic.value==topicGuide.value" class="mb-5">
        <div class="mb-5 justify"><a :href="urlBlog" target="_blank">GA Kneeboard Blog</a> is the best source updates and user guides. For example:</div>
        <div class="mb-5 guides">
          <Button v-for="guide in guides" :label="guide.name" @click="openUrl(guide.url)" severity="help"></Button>
        </div>
        <div class="mb-5 justify">last, GA Kneeboard public <a :href="urlFacebookGroup" target="_blank">Facebook Group</a> is a good place to interract.</div>
      </div>
      <div v-else-if="activeTopic.value==topicWarning.value" class="warning-content mb-5">
        <div class="warning-item mr-3">Airport information</div>
        <div>May not be current. Cross check with an official source before you fly.</div>
        <div class="warning-item mr-3">Traffic Pattern Altitude</div>
        <div>Is calculated by adding 1000ft to field elevation. This may not be true for your situation.</div>
        <div class="warning-item mr-3">Traffic Pattern Entry</div>
        <div>Are calculated theoretical values which may not apply for your situation.</div>
        <div class="warning-item mr-3">Weather Frequency</div>
        <div>Does not account for aircraft direction. Check chart supplements.</div>
        <div class="warning-item mr-3">Runway Frequency</div>
        <div>May not be displayed for airport that have a complex frequency allocation.</div>
        <div class="warning-item mr-3">Magnetic Headings</div>
        <div>Are calculated with FAA variation data which can be quite old at some locations</div>
      </div>    
      <div class="actionDialog gap-2"><Button label="Got it" @click="emits('close')"></Button></div>
    </div>
  </Dialog>
</template>

<style scoped>
.aboutPopup {
  width:45rem;

}
.guides {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  gap: 0.5rem;
}

.pageOptions {
  display: flex;
  justify-content: center;
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