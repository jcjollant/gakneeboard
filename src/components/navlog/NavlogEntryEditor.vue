<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

import { NavlogEntry } from './NavlogEntry'
import { Formatter } from '../../assets/Formatter'

import PlaceHolder from '../shared/PlaceHolder.vue'

const emits = defineEmits(['close','save'])

//---------------------
// Props management
const props = defineProps({
  entry: { type: Object, default: null},
  showLeg: { type: Boolean, default: true},
  time: { type: Number, default: 0}
})

function loadProps(newProps) {
    // console.log('[NavlogItemEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.entry) {
        const entry = NavlogEntry.copy(newProps.entry)
        editEntry.value = entry
        showLeg.value = newProps.showLeg;
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    // console.log('[NavlogItemEditor.watch]')
    loadProps(props)
})
// End of props management
//------------------------

const editEntry = ref(null)
const showLeg = ref(null)


function onSave() {
    // console.log('[NavlogEditor.onSave]', JSON.stringify(editEntry.value))
    const entry = editEntry.value

    // leg time 
    entry['lt'] = Formatter.getDecimalMinutes( entry.lt)
    // console.log('[NavlogEntryEditor.onSave]', entry.lt)

    // convert all fields to number
    const fields = ['alt','th','ld','gs','lf']
    for(let f of fields) {
        if( entry[f]) entry[f] = Number(entry[f])
    }
    // keep heading within 0-360
    if( entry.th) entry.th = entry.th % 360

    emits('save', entry)
}

</script>

<template>
    <Dialog modal header="NavLog Leg Editor" class="editorDialog">
        <div v-if="editEntry">
            <div class="editorFields">
                <FloatLabel>
                    <InputText id="name" class="editorName" v-model="editEntry.name" />
                    <label for="name">Name</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="alt" v-model="editEntry.alt" />
                    <label for="alt">Altitude</label>
                </FloatLabel>
                <FloatLabel title="True Heading" v-if="showLeg">
                    <InputText id="th" v-model="editEntry.th" />
                    <label for="th">TH</label>
                </FloatLabel>
                <FloatLabel title="Leg Distance" v-if="showLeg">
                    <InputText id="ld" v-model="editEntry.ld" />
                    <label for="ld">Dist.</label>
                </FloatLabel>
                <FloatLabel title="Ground Speed" v-if="showLeg">
                    <InputText id="gs" v-model="editEntry.gs" />
                    <label for="gs">GS</label>
                </FloatLabel>
                <FloatLabel title="Leg Time in decimal format. 3:30 should be 3.5" v-if="showLeg">
                    <InputText id="lt" v-model="editEntry.lt" />
                    <label for="lt">Time</label>
                </FloatLabel>
                <FloatLabel title="Leg Fuel" v-if="showLeg">
                    <InputText id="lf" v-model="editEntry.lf" />
                    <label for="lf">Fuel</label>
                </FloatLabel>
            </div>
            <div class="actionDialog gap-2">
                <Button label="Do Not Save" @click="emits('close')" link></Button>
                <Button label="Save" @click="onSave"></Button>
            </div>
         </div>
        <PlaceHolder v-else title="Nothing to edit" />
    </Dialog>

</template>

<style scoped>
.editorFields {
    display: grid;
    grid-template-columns: auto auto auto auto auto auto auto;
    gap: 5px;
    padding-top: 1.5rem;
    justify-content: center;
}
:deep(.p-inputtext.editorName ) {
    width: 6rem;
}

:deep(.p-inputtext) {
    width: 4rem;
}
</style>