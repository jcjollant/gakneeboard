<script setup>
import { ref } from 'vue'

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'

const emits = defineEmits(["close","print"]);

const frontOption = {name:'Front Page',front:true,back:false}
const bothOption = {name:'Both Pages',front:true,back:true}
const backOption = {name:'Back Page',front:false,back:true}

const options = ref([])
const pageOption = ref(bothOption)

function onPrint() {
  console.log('[Print.onPrint] options', JSON.stringify(options.value),'pageOptions', JSON.stringify(pageOption.value))
  const printOptions = {
    flipBack:options.value.includes('flip'),
    showVersion:!options.value.includes('version'),
    showFront:pageOption.value.front,
    showBack:pageOption.value.back,
  }

  emits('print', printOptions)
}

</script>

<template>
  <Dialog modal header="Print">
  <div class="printPopup">
    <FieldSet legend="What are we printing?">
      <div class="pageOptions">
      <SelectButton v-model="pageOption" :options="[frontOption, bothOption, backOption]" optionLabel="name" aria-labelledby="basic" class="mb-2" />
      </div>
    </FieldSet>
    <FieldSet legend="Options">
      <div class="modesList mb-2">
        <span title="So you can read back page while front page is clipped">
          <Checkbox v-model="options" inputId="flipRightPage" name="options" value="flip"/>
          <label for="flipRightPage" class="ml-2">Flip Back Page </label>
        </span>
        <span title="That's the little thing in the bottom right corner">
          <Checkbox v-model="options" inputId="versionNumber" name="options" value="version" />
          <label for="versionNumber" class="ml-2">Hide version number </label>
        </span>
      </div>
    </FieldSet>
    <FieldSet legend="Tips">
      <p class="note">
        <div>'Letter' paper size and 'Landscape' layout will fold between pages to kneeboard size.</div>
        <div>Enable 'Background graphics' in your print settings for best results (Checklists, Fuel Bug).</div>
        <div>Single pages in 'Portait' layout make great PDFs</div>
      </p>
      </FieldSet>
    <div class="actionDialog gap-2">
      <Button label="Do Not Print" @click="emits('close')" link></Button>
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

.pageList {
  display: flex;
}
:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}

.active {
  background: white;
  color: black;
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

.pageOptions {
  display: flex;
  justify-content: center;
}

</style>