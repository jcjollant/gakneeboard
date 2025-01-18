<template>
  <Dialog modal header="Print">
    <div class="printPopup">
      <!-- <FieldSet legend="Layout"> -->
        <div class="pageOptions">
          <div class="pageOptionLabel">Pages per sheet</div>
          <OneChoice v-model="pagePerSheet" :choices="[onePage,twoPages]" 
            @change="onNewOptions"/>
          <div class="pageOptionLabel">Back Page Orientation</div>
          <OneChoice v-model="flipBackPage" :choices="[normalOrientation, flippedOrientation]"
            @change="onNewOptions" />
        </div>
      <!-- </FieldSet> -->
      <FieldSet legend="Printing Tips">
        <p class="note">
          <li>Enable <b>Background Graphics</b> print setting for best results with Checklists</li>
          <li>One page per sheet in <b>Portrait</b> layout make great PDFs</li>
          <li>Two pages per sheet in <b>Landscape</b> layout will fold to kneeboard size</li>
          <li>Printing from <b>iPads / iPhones</b> requires a page reload to exit print mode</li>
        </p>
        </FieldSet>
      <div class="actionDialog gap-2">
        <div class="floatLeft">
            <font-awesome-icon :icon="['fas', 'question']"
                @click="onHelp" title="Perfect Prints help"></font-awesome-icon>
        </div>
        <Button label="Do Not Print" @click="emits('close')" link></Button>
        <Button label="Print" @click="onPrint"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import OneChoice from '../shared/OneChoice.vue';

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import { UserUrl } from '@/lib/UserUrl';

const emits = defineEmits(["print","options",'close']);

const onePage = {label:'One', value:1}
const twoPages = {label:'Two', value:2}
const normalOrientation = {label:'Normal', value:false}
const flippedOrientation = {label:'Flipped', value:true, title:'So you can read back page when front page is clipped'}

const pagePerSheet = ref(twoPages)
const flipBackPage = ref(normalOrientation)

//---------------------
// Props management
const props = defineProps({
  refresh: { type: Number, default: 0},
})

function loadProps( props) {
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})
//---------------------

function getOptions() {
  if(!pagePerSheet.value || !flipBackPage.value) return null;
  const printOptions = {
    pagePerSheet: pagePerSheet.value.value,
    flipBackPage: flipBackPage.value.value
  }
  return printOptions
}

function onHelp() {
  UserUrl.open( UserUrl.printGuide)
}

function onPrint() {
  // console.log('[Print.onPrint] options', JSON.stringify(options.value),'pageOptions', JSON.stringify(pageOption.value))
  emits('print', getOptions())
}

function onNewOptions() {
  emits('options', getOptions())
}

</script>

<style scoped>
.floatLeft {
    position:absolute;
    left: 2rem;
    line-height: 2.5rem;
    height: 2.5rem;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: var(--bg);
    font-size: 0.9rem;
}
.modesList {
  display: flex;
  flex-flow: wrap;
  gap: 2rem;
}

.pageOptions {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 0.5rem 1rem;
  line-height: 1rem;
}
.pageOptionLabel {
  text-align: right;
}

.printPopup {
  display: flex;
  flex-flow: column;
  gap:10px;
  width:35rem;
}
.note {
  font-size: 0.8rem;
}

p.note {
  margin: 0
}

li {
  line-height: 1.2rem;
}

:deep(.p-fieldset-legend) {
  border: none;
  background: none;
  padding: 0.5rem;
}
:deep(.p-fieldset-content) {
  padding: 0;
}


</style>