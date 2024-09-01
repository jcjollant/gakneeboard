<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'

import { NavlogEntry } from './NavlogEntry'
import { Formatter } from '../../assets/Formatter'

import PlaceHolder from '../shared/PlaceHolder.vue'

const emits = defineEmits(['close','save'])
const attitudeName = ref(null)
const attitudeClass = ref(null)
const calculatedDistance = ref(null)
const calculatedFuel = ref(null)
const calculatedTime = ref(null)
const descentRate = ref(null)
const editEntry = ref(null)
const fuelFlowCruise = ref(null)
const fuelFlowDescent = ref(null)
const magVar = ref(0)
const magDev = ref(0)
const nextEntry = ref(null)
const prevHeading = ref(null)

//---------------------
// Props management
const props = defineProps({
  entry: { type: Object, default: null},
  nextEntry: { type: Object, default: null},
  prevEntry: { type: Object, default: null},
  magDev: { type: Number, default: 0},
  magVar: { type: Number, default: 0},
  time: { type: Number, default: 0}
})

function loadProps(newProps) {
    // console.log('[NavlogItemEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.entry) {
        const entry = NavlogEntry.copy(newProps.entry)
        editEntry.value = entry
        // transform leg time
        editEntry.value.lt = editEntry.value.lt ? Formatter.legTime(editEntry.value.lt) : ''
        if( editEntry.value.att == '+') {
            attitudeName.value='Climb'
            attitudeClass.value='attClimb'
        } else if(editEntry.value.att == '-') {
            attitudeName.value='Descent'
            attitudeClass.value='attDescent'
        } else {
            attitudeName.value='Cruise'
            attitudeClass.value='attCruise'
        }
    }
    if(newProps.nextEntry) nextEntry.value = newProps.nextEntry
    if(newProps.prevEntry) prevHeading.value = newProps.prevEntry.mh
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

watch(editEntry, () => {
    // console.log('[NavlogEntryEditor.watch.editEntry]')
    calculation()
})

// End of props management
//------------------------

function calculation() {
    // console.log('[navlogLegEditor.calculation]')
    if(!editEntry || !editEntry.value) return;
    const groundSpeed = Number(editEntry.value.gs)
    const climb = (editEntry.value.att=='+')
    const descent = (editEntry.value.att=='-')
    const cruise = !climb && !descent;

    // leg time
    let legTime = undefined;
    if( cruise) {
        const legDistance = Number(editEntry.value.ld)
        if( !(isNaN(groundSpeed) || isNaN(legDistance) || groundSpeed <= 0 || legDistance <= 0)) {
            legTime = legDistance / groundSpeed * 60
        }
    } else if( descent) {
        const altFrom = Number(editEntry.value.alt)
        const altTo = Number(nextEntry.value.alt)
        const descentRateValue = Number(descentRate.value)
        // altitude difference / descent rate
        if( !(isNaN(altFrom) || isNaN(altTo) || isNaN(descentRateValue) || descentRateValue <= 0)) {
            legTime = (altFrom - altTo) / descentRateValue
        }
    }
    calculatedTime.value = Formatter.legTime( legTime)

    // Fuel
    const fuelFlowValue = cruise ? Number(fuelFlowCruise.value) : (descent ? Number(fuelFlowDescent.value) : undefined)
    let legFuel = undefined
    console.log('[NavlogLegEditor,calculation]', fuelFlowValue, legTime)
    if(legTime && !(isNaN(fuelFlowValue) || fuelFlowValue <= 0)) {
        legFuel = fuelFlowValue * legTime / 60;
    }
    calculatedFuel.value = Formatter.fuel( legFuel)

    // Distance
    let legDistance = undefined
    if(descent) {
        if( !(isNaN(groundSpeed) || isNaN(legTime) || groundSpeed <= 0 || legTime <= 0)) {
            legDistance = legTime * groundSpeed / 60
        }
    } else if(cruise) {
        legDistance = eval(editEntry.value.ld)
    }
    calculatedDistance.value = Formatter.distance(legDistance)
}

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
    <Dialog modal header="Navigation Leg" class="editorDialog">
        <div v-if="editEntry">
            <div class="between mb-2" :class="attitudeClass">
                <div>{{ editEntry.name }} @ {{ editEntry.alt }}</div>
                <div class="attitudeGroup">
                    <i class="pi attIcon" :class="{'pi-arrow-up-right':editEntry.att=='+','pi-arrow-down-right':editEntry.att=='-','pi-arrow-right':(editEntry.att!='+'&&editEntry.att!='-')}"></i>
                    <div class="attitude">{{attitudeName}}</div>
                </div>
                <div v-if="nextEntry">{{ nextEntry.name }} @ {{ nextEntry.alt }}</div>
            </div>
            <div class="legParamGroup">
                <InputGroup class="legParameter" title="POH Cruise Fuel Flow (GPH)">
                    <InputGroupAddon>Cruise Fuel Flow</InputGroupAddon>
                    <InputText v-model="fuelFlowCruise" @input="calculation" />
                </InputGroup>
                <InputGroup class="legParameter" title="POH Descent Fuel Flow (GPH)">
                    <InputGroupAddon>Descent Fuel Flow</InputGroupAddon>
                    <InputText v-model="fuelFlowDescent" @input="calculation" />
                </InputGroup>
                <InputGroup class="legParameter" title="Descent Rate (FPM)">
                    <InputGroupAddon>Descent Rate</InputGroupAddon>
                    <InputText v-model="descentRate" @input="calculation" />
                </InputGroup>
            </div>
            <FieldSet legend="Log Data" class="mt-2">
                <div class="legFieldGroup">
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
                    <div title="Magnetic Heading" class="legField">
                        <div class="label">Mag Hdg</div>
                        <InputText id="mh" v-model="editEntry.mh" />
                        <div class="hint clickable" 
                            title="Previous leg heading. Click to use." 
                            @click="editEntry.mh=prevHeading">{{ prevHeading }}</div>
                    </div>
                    <div title="Leg Distance (NM). Supports calculation for cruise legs (ex: 24-15.4)" class="legField">
                        <div class="label">Distance</div>
                        <InputText id="ld" v-model="editEntry.ld" @input="calculation" />
                        <div class="hint clickable" 
                            title="Calculated Distance (For descent only). Click to use." 
                            @click="editEntry.ld=calculatedDistance">{{ calculatedDistance }}</div>
                    </div>
                    <div class="legField" title="Ground Speed (Kts)">
                        <div class="label">Gnd Speed</div>
                        <InputText id="gs" v-model="editEntry.gs" @input="calculation" />
                    </div>
                    <div class="legField" title="Leg Time (Min). Supports decimal and time format (3:30 = 3.5)">
                        <div class="label">Time</div>
                        <InputText id="lt" v-model="editEntry.lt" />
                        <div class="hint clickable" 
                            title="Calculated Leg Time [formula varies with leg type]. Click to use." 
                            @click="editEntry.lt=calculatedTime">{{ calculatedTime }}</div>
                    </div>
                    <div class="legField" title="Leg Fuel (Gal)">
                        <div class="label">Leg Fuel</div>
                        <InputText id="lf" v-model="editEntry.lf" />
                        <div class="hint clickable" 
                            title="Calculated Leg Fuel [formula varies with leg type]. Click to use." 
                            @click="editEntry.lf=calculatedFuel">{{ calculatedFuel }}</div>
                    </div>
                </div>
            </FieldSet>
            <div class="actionDialog gap-2">
                <Button label="Do Not Save" @click="emits('close')" link></Button>
                <Button label="Save" @click="onSave"></Button>
            </div>
         </div>
        <PlaceHolder v-else title="Nothing to edit" />
    </Dialog>

</template>

<style scoped>
.attitude {
    font-size: 0.7rem;
    padding: 0.2rem;
    /* text-align: center; */
}
.attitudeGroup {
    display: flex;
    flex-flow: column;
    align-items: center;
    width: 3rem;
    /* justify-content: center; */
}
.attClimb {
    background-color: rgba(255, 0, 0, 0.1);
}
.attCruise {
    background-color: rgba(0, 0, 255, 0.1);
}
.attDescent {
    background-color: rgba(0, 255, 0, 0.1);
}
.attIcon {
    padding-top: 0.3rem;
}
.between {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-evenly;
    font-size: larger;
    padding: 0.5rem 0;
}
.hint {
    text-align: right;
    padding-right: 0.4rem;
}
.label {
    text-align: right;
    font-size: 0.8rem;
    padding-right: 0.2rem;
}
.legField {
    display: flex;
    flex-flow: column;
    align-items: flex-end;
    gap: 0.2rem;
}
.legFieldGroup {
    display: flex;
    gap: 1rem;
    justify-content: center;
    /* grid-template-columns:  auto auto auto auto auto; */
}
.legParamGroup {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));;
    gap: 5px;
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
    width: 5rem;
    text-align: right;
}

:deep(.p-fieldset-content) {
    padding: 0;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}

:deep(.p-float-label) {
    left: unset;
    right: 0.5rem;
}

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    /* height: 1.5rem; */
}

</style>