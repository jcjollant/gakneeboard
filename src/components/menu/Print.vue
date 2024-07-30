<script setup>
import { ref } from 'vue'

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import Checkbox from 'primevue/checkbox'

const emits = defineEmits(["close","print"]);

const options = ref([])

function onPrint() {
  // console.log('[Print.onPrint]', JSON.stringify(options.value))
  emits('print', options.value)
}

</script>

<template>
  <Dialog modal header="Print Active Sheet">
  <div class="printPopup">
    <FieldSet legend="Options">
      <div class="modesList">
        <span title="So you can read back page while front page is clipped">
          <Checkbox v-model="options" inputId="flipRightPage" name="options" value="flip"/>
          <label for="flipRightPage" class="ml-2">Flip right page </label>
        </span>
        <span title="That's the little thing in the bottom right corner">
          <Checkbox v-model="options" inputId="versionNumber" name="options" value="version" />
          <label for="versionNumber" class="ml-2">Hide version number </label>
        </span>
        </div>
    </FieldSet>
    <div class="note">Note : Enable 'Background graphics' in your system print settings for best results.</div>
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

</style>