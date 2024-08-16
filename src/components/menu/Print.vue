<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'

const emits = defineEmits(["close","print","options"]);

const frontOption = {name:'Front Page',front:true,back:false,flipped:false}
const bothOption = {name:'Both',front:true,back:true,flipped:false}
const flippedOption = {name:'Flipped',front:true,back:true,flipped:true}
const backOption = {name:'Back Page',front:false,back:true,flipped:false}

const pageOption = ref(bothOption)

//---------------------
// Props management
const props = defineProps({
  refresh: { type: Number, default: 0},
})

function loadProps( props) {
  pageOption.value = bothOption
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})
//---------------------

function getOptions() {
  const printOptions = {
    flipped:pageOption.value.flipped,
    showFront:pageOption.value.front,
    showBack:pageOption.value.back,
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
    <FieldSet legend="What are we printing?">
      <div class="pageOptions">
        <SelectButton v-model="pageOption" :options="[frontOption, bothOption, flippedOption, backOption]" optionLabel="name" aria-labelledby="basic" class="mb-2" @change="onNewOptions" />
      </div>
    </FieldSet>
    <FieldSet legend="Tips">
      <p class="note">
        <div>Use Flipped print to read back page while front is clipped </div>
        <div>'Letter' paper size and 'Landscape' layout will fold between pages to kneeboard size</div>
        <div>Enable 'Background graphics' in your print settings for best results for Checklists</div>
        <div>Single pages in 'Portrait' layout make great PDFs</div>
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
  display: flex;
  justify-content: center;
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