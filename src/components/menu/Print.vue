<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import SelectButton from 'primevue/selectbutton'

const emits = defineEmits(["close","print","options"]);

const onePage = {name:'One', value:1}
const twoPages = {name:'Two', value:2}
const normalOrientation = {name:'Normal', value:false}
const flippedOrientation = {name:'Flipped', value:true}

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

function onClose() {
  // emits('options', null)
  emits('close')
}

function onPrint() {
  // console.log('[Print.onPrint] options', JSON.stringify(options.value),'pageOptions', JSON.stringify(pageOption.value))
  emits('print', getOptions())
}

function onNewOptions() {
  emits('options', getOptions())
}

</script>

<template>
  <Dialog modal header="Print">
  <div class="printPopup">
    <!-- <FieldSet legend="Layout"> -->
      <div class="pageOptions">
        <div class="pageOptionLabel">Pages per sheet</div>
        <SelectButton v-model="pagePerSheet" :options="[onePage,twoPages]" optionLabel="name" aria-labelledby="basic" @change="onNewOptions" />
        <div class="pageOptionLabel">Back Page Orientation</div>
        <SelectButton v-model="flipBackPage" :options="[normalOrientation, flippedOrientation]" optionLabel="name" aria-labelledby="basic" @change="onNewOptions" />
      </div>
    <!-- </FieldSet> -->
    <FieldSet legend="Tips">
      <p class="note">
        <li>Enable 'Background graphics' print setting for best results with Checklists</li>
        <li>Use 'Flipped' back page to read both page when clipped on top</li>
        <li>Two pages per sheet in 'Landscape' layout will fold to kneeboard size</li>
        <li>One page per sheet in 'Portrait' layout make great PDFs</li>
      </p>
      </FieldSet>
    <div class="actionDialog gap-2">
      <Button label="Do Not Print" @click="onClose" link></Button>
      <Button label="Print" @click="onPrint"></Button>
    </div>
  </div>
  </Dialog>
</template>

<style scoped>
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
  /* line-height: 2rem; */
  /* vertical-align: middle; */
  /* line-height: 1.5rem;; */
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

:deep(.p-fieldset-legend) {
  border: none;
  background: none;
}
:deep(.p-fieldset-content) {
  padding: 0;
}


</style>