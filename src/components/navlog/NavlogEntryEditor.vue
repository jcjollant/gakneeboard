<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
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
  magDev: { type: Number, default: 0},
  magVar: { type: Number, default: 0},
  showLeg: { type: Boolean, default: true},
  time: { type: Number, default: 0}
})

function loadProps(newProps) {
    // console.log('[NavlogItemEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.entry) {
        const entry = NavlogEntry.copy(newProps.entry)
        editEntry.value = entry
    }
    showLeg.value = newProps.showLeg;
    magVar.value = newProps.magVar;
    magDev.value = newProps.magDev;
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
const magVar = ref(0)
const magDev = ref(0)


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
    if( entry.th) {
        entry.th = entry.th % 360
        // compute course heading from other headings
        entry.ch = entry.th + magVar.value + magDev.value
    }

    emits('save', entry)
}

</script>

<template>
    <Dialog modal header="NavLog Entry Editor" class="editorDialog">
        <div v-if="editEntry">
            <FieldSet legend="Checkpoint">
                <div class="checkpointFields">
                    <FloatLabel>
                        <InputText id="name" class="editorName" v-model="editEntry.name" />
                        <label for="name">Name</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText id="alt" v-model="editEntry.alt" />
                        <label for="alt">Altitude</label>
                    </FloatLabel>
                </div>
            </FieldSet>
            <div v-if="showLeg" class="mt-2">
                <FieldSet legend="Following Leg">
                    <div class="legFields">
                        <!-- <FloatLabel title="True Course">
                            <InputText id="tc" v-model="editEntry.tc" />
                            <label for="tc">True Course</label>
                        </FloatLabel>
                        <FloatLabel title="Wind Speed">
                            <InputText id="ws" v-model="editEntry.ws" />
                            <label for="ws">W. Spd.</label>
                        </FloatLabel>
                        <FloatLabel title="Wind Direction">
                            <InputText id="wd" v-model="editEntry.wd" />
                            <label for="wd">W. Dir.</label>
                        </FloatLabel>
                        <FloatLabel title="True Heading">
                            <InputText id="th" v-model="editEntry.th" />
                            <label for="th">TH</label>
                        </FloatLabel> -->
                        <FloatLabel title="Magnetic Heading">
                            <InputText id="mh" v-model="editEntry.mh" />
                            <label for="mh">Mag Hdg</label>
                        </FloatLabel>
                        <FloatLabel title="Leg Distance">
                            <InputText id="ld" v-model="editEntry.ld" />
                            <label for="ld">Distance</label>
                        </FloatLabel>
                        <FloatLabel title="Ground Speed">
                            <InputText id="gs" v-model="editEntry.gs" />
                            <label for="gs">Gnd Speed</label>
                        </FloatLabel>
                        <FloatLabel title="Leg Time in Minutes. Supports decimal and time format (3:30 = 3.5)">
                            <InputText id="lt" v-model="editEntry.lt" />
                            <label for="lt">Time</label>
                        </FloatLabel>
                        <FloatLabel title="Leg Fuel">
                            <InputText id="lf" v-model="editEntry.lf" />
                            <label for="lf">Fuel</label>
                        </FloatLabel>
                    </div>
                </FieldSet>
            </div>
            <div v-if="showLeg" class="others">
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
.checkpointFields {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.2rem;
    justify-content: left;
}
.legFields {
    display: grid;
    grid-template-columns:  auto auto auto auto auto;
    /* grid-template-rows: 4rem 4rem; */
    gap: 1.5rem 0.2rem;
    font-size: small;
}
.others {
    display: flex;
    gap: 0.3rem;
}
:deep(.p-inputtext.editorName ) {
    width: 10rem;
    text-align: left;
}

:deep(.p-inputtext) {
    width: 4.5rem;
    text-align: right;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}


</style>