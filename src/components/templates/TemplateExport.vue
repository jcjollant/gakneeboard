<template>
  <Dialog modal header="Export Template" :style="{width: '45rem'}">
    <div class="formatLine">
        <div>Format:</div>
        <OneChoice v-model="activeFormat" :choices="formats"></OneChoice>
    </div>
    <Fieldset legend="Description">
        <div>{{ activeFormat.description }}</div>
        <div>All checklist information will be extracted from the current template across checklist pages and checklist tiles. The resulting file will be downloaded by your browser.</div>
        <div v-if="activeFormat.source"><a :href='activeFormat.source' target="_blank">source</a></div>
        <div class="mt-5 experimental"><strong>This feature is EXPERIMENTAL</strong></div>
    </Fieldset>
    <div class="actionDialog gap-2">
      <Button label="Do Not Export" @click="emits('close')" link></Button>
      <Button label="Export Template" @click="emits('export', activeFormat.value)"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog'
import OneChoice from '../shared/OneChoice.vue';
import { UserUrl } from '../../lib/UserUrl';

import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';

const emits = defineEmits(['close','export'])

const formatAce = {
  label:'Garmin ACE',
  value:'ace', 
  description:'ACE file format allows you to import custom checklist in some Garmin(c) devices.',
  source: UserUrl.garminAce
}
const formatFmd = {
  label:'Foreflight FMD',
  value:'fmd',
  description:'FMD file format allows you to import custom checklist into Foreflight EFB.'
}
const activeFormat = ref(formatAce)
const formats = ref([formatFmd,formatAce])


const description = ref('')
</script>
<style scoped>
.experimental {
    text-align: right;
}
.formatLine {
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 10px;
}
:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}

</style>