<template>
    <div class="tile">
        <Header :title="getTitle()" :left="!displaySelection" :showReplace="displaySelection" :showDisplayMode="true"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @selection="changeDisplayMode" />
        <div v-else-if="editMode" class="editMode">
            <AirportInput v-model="airport" :expanded="true" @valid="onAirportUpdate"/>
            <ActionBar :actions="[{action:'cancel',label:'Manual'}]" :showApply="false" @cancel="editMode=false" @action="onManual"/>
        </div>
        <ApproachContent v-else-if="displayMode==DisplayModeIfr.Approach" :airport="airport" class="clickable"
            @click="editMode=true" />
        <DepartureContent v-else-if="displayMode==DisplayModeIfr.Departure" :airport="airport" class="clickable"
            @click="editMode=true" />
        <HoldingContent v-else-if="displayMode==DisplayModeIfr.Hold" />
        <CraftBoxedContent v-else />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport.ts';
import { DisplayModeIfr } from '../../model/DisplayMode.ts';
import { getAirport } from '../../assets/data.js';

import ActionBar from '../shared/ActionBar.vue';
import ApproachContent from './ApproachContent.vue';
import CraftBoxedContent from './CraftBoxedContent.vue';
import Header from '../shared/Header.vue';
import HoldingContent from './HoldingContent.vue';
import DepartureContent from './DepartureContent.vue';
import AirportInput from '../shared/AirportInput.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';

// Enum with display modes

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeIfr.BoxV
const displayMode=ref(defaultMode)
const editMode = ref(false)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    {label:'CRAFT Clearance', value:DisplayModeIfr.BoxV},
    {label:'Departure', value:DisplayModeIfr.Departure},
    {label:'Hold', value:DisplayModeIfr.Hold},
    {label:'Approach', value:DisplayModeIfr.Approach},
]

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

function loadProps(props:any) {
    // console.log('[Clearance.loadProps]', JSON.stringify(props))
    displayMode.value = defaultMode
    if( props.params) {
         if( props.params.mode) {
            // for compatibility with old versions
            if(props.params.mode == DisplayModeIfr.BoxH_deprecated 
                || props.params.mode==DisplayModeIfr.Craft_deprecated 
                || props.params.mode=="") {
                props.params.mode = defaultMode;
            } else {
                displayMode.value = props.params.mode
            }
         } else {
            displaySelection.value = true
         }
         if( props.params.airport) {
            getAirport(props.params.airport).then( output => {
                if( output) {
                    airport.value = Airport.copy(output)
                }
            })
         }
    }
}


function changeDisplayMode(newMode:DisplayModeIfr) {
    displaySelection.value = false;
    displayMode.value = newMode;
    emitUpdate()
}

function emitUpdate() {
    // build parameters
    const params = {mode:displayMode.value, airport:airport.value.code}
    emits('update', params)

}

function getTitle() {
    if( displaySelection.value) return "IFR Tile Mode"
    let title:string;
    if( displayMode.value==DisplayModeIfr.Approach) {
        title =  'Apch'
    } else if( displayMode.value==DisplayModeIfr.Hold) {
        title = 'Hold @'
    } else if( displayMode.value==DisplayModeIfr.Departure) {
        title = 'Depart @'
    } else {
        title = 'Clearance @'
    }
    if( airport.value.code) {
        // append for all modes except approach which is prepend
        if( displayMode.value == DisplayModeIfr.Approach) {
            title = airport.value.code + ' ' + title
        } else {
            title += ' ' + airport.value.code
            // Departure gets an additional 'to'
             if(displayMode.value == DisplayModeIfr.Departure) title += ' to'
        }
    }
    return title
}

// This is used to switch to manual mode
function onManual() {
    editMode.value = false
    airport.value = noAirport
    emitUpdate()
}

function onAirportUpdate() {
    editMode.value = false
    emitUpdate()
}

function onMenuClick() {
    editMode.value = !editMode.value
}

</script>

<style scoped>
.editMode {
    padding: 10px;
}
</style>