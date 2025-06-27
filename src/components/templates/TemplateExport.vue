<template>
  <Dialog modal header="Export Template" :style="{width: '45rem'}">
    <div class="formatLine">
        <div>Format:</div>
        <OneChoice v-model="activeFormat" :choices="choices"></OneChoice>
    </div>
    <Fieldset legend="Description">
        <div>{{ activeFormat.value.desc }}</div>
        <div>All checklist information will be extracted from the current template across checklist pages and checklist tiles. The resulting file will be downloaded by your browser.</div>
        <div v-if="activeFormat.value.source"><a :href='activeFormat.value.source' target="_blank">source</a></div>
        <div class="mt-5 experimental"><strong>This feature is EXPERIMENTAL</strong></div>
    </Fieldset>
    <div class="actionDialog gap-2">
      <Button label="Do Not Export" @click="emits('close')" link></Button>
      <Button label="Export Template" @click="emits('export', activeFormat.value.str)"></Button>
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
import { OneChoiceValue } from '../../model/OneChoiceValue';

const emits = defineEmits(['close','export'])

const formatAce = new OneChoiceValue('Garmin ACE', {str:'ace', desc:'ACE file format allows you to import custom checklist in some Garmin(c) devices.', src:UserUrl.garminAce})

const formatFmd = new OneChoiceValue('Foreflight FMD', {str:'fmd', desc:'FMD file format allows you to import custom checklist into Foreflight EFB.', src:undefined})

const activeFormat = ref(formatAce)
const choices = ref([formatFmd,formatAce])


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