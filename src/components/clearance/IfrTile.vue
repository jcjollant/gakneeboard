<template>
    <div class="tile">
        <Header :title="getTitle()" :left="!displaySelection" :hideReplace="!displaySelection"
            @click="onMenuClick" @replace="emits('replace')"></Header>
        <DisplayModeSelection v-if="displaySelection" :modes="modesList" :activeMode="displayMode"
            @selection="changeDisplayMode" />
        <div v-else-if="editMode" class="editMode">
            <AirportInput v-model="airport" :expanded="true" @valid="onAirportUpdate"/>
            <ActionBar :actions="[{action:'cancel',label:'Manual'}]" :showApply="false" @cancel="editMode=false" @action="onManual"/>
        </div>
        <ApproachContent v-else-if="displayMode==DisplayMode.Approach" @click="editMode=true" />
        <DepartureContent v-else-if="displayMode==DisplayMode.Departure" :airport="airport" @click="editMode=true" />
        <HoldingContent v-else-if="displayMode==DisplayMode.Hold" @click="editMode=true" />
        <CraftBoxedContent v-else />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport.ts';

import ActionBar from '../shared/ActionBar.vue';
import ApproachContent from './ApproachContent.vue';
import CraftBoxedContent from './CraftBoxedContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import HoldingContent from './HoldingContent.vue';
import DepartureContent from './DepartureContent.vue';
import AirportInput from '../shared/AirportInput.vue';
import { getAirport } from '../../assets/data.js';

// Enum with display modes
enum DisplayMode {
    Approach = 'apch',
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft_deprecated = 'craft',
    Hold = 'hold',
}

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update'])
const defaultMode = DisplayMode.BoxV
const displayMode=ref(defaultMode)
const editMode = ref(false)
const modesList = ref([
    {label:'CRAFT Clearance', value:DisplayMode.BoxV},
    {label:'Approach', value:DisplayMode.Approach},
    {label:'Departure', value:DisplayMode.Departure},
    {label:'Hold', value:DisplayMode.Hold},
])
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)

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
            if(props.params.mode == DisplayMode.BoxH_deprecated 
                || props.params.mode==DisplayMode.Craft_deprecated 
                || props.params.mode=="") {
                props.params.mode = defaultMode;
            } else {
                displayMode.value = props.params.mode
            }
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


function changeDisplayMode(newMode:DisplayMode) {
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
    if( displaySelection.value) return "IFR"
    let title:string;
    if( displayMode.value==DisplayMode.Approach) {
        title =  'Apch'
    } else if( displayMode.value==DisplayMode.Hold) {
        title = 'Hold @'
    } else if( displayMode.value==DisplayMode.Departure) {
        title = 'Depart @'
    } else {
        title = 'Clearance @'
    }
    if( airport.value) {
        // append for all modes except approach which is prepend
        if( displayMode.value == DisplayMode.Approach) {
            title = airport.value.code + ' ' + title
        } else {
            title += ' ' + airport.value.code
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
    displaySelection.value = !displaySelection.value
}

</script>

<style scoped>
.editMode {
    padding: 10px;
}
</style>