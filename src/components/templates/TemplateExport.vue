<template>
  <Dialog modal header="Export Template" :style="{width: '45rem'}">
    <div class="formatLine">
        <div>Format:</div>
        <OneChoice v-model="activeFormat" :choices="formats"></OneChoice>
    </div>
    <Fieldset legend="Description">
        <div>{{ description }}</div>
        <div v-if="source"><a :href='source' target="_blank">source</a></div>
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

const formatAce = {label:'ACE',value:'ace'}
const activeFormat = ref(formatAce)
const formats = ref([formatAce])


const description = ref('ACE file format is used to import checklists in some Garmin(c) devices. This feature will extract all checklist information from the current template, including pages and tiles, and create a .ACE file which will be downloaded by your browser.')
const source = ref(UserUrl.garminAce)
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