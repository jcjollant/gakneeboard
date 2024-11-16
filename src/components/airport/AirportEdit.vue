<template>
    <div class="content">
        <CustomAirport v-model:visible="showCustomAirport" :airport="customAirport" :user="currentUser"
                        @close="showCustomAirport=false" @updated="onCustomUpdated" />
        <div class="settings">
            <AirportInput :code="airportCode" :auto="true"
                @valid="loadAirportData" @invalid="onInvalidAirport" />
            <ProgressSpinner v-if="loading" class="spinner" ></ProgressSpinner>
            <div v-else-if="validAirport" class="rwyChoices">
                <div class="miniHeader">Runway</div>
                <div class="rwySelector">
                    <Button :label="rwy.name" class="sign" :severity="rwy.name == selectedRwy ? 'primary' : 'secondary'"
                        v-for="rwy in rwyList" 
                        @click="selectRunway(rwy.name)"></Button>
                    <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :severity="selectedRwy == 'all' ? 'primary' : 'secondary'"
                            @click="selectRunway('all')"></Button>
                </div>
                <div class="rwyOrientation">
                    <div class="miniHeader" >Orientation</div>
                    <OneChoice v-if="validAirport" v-model="rwyOrientation" :choices="orientations" style="line-height: 9px;" />
                </div>
            </div>
        </div>
        <ActionBar :video="UserUrl.airportTileVideo"
            :canApply="canApply" :canCancel="canCancel"
            @apply="onApply" @cancel="onCancel"  />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as data from '../../assets/data.js'

import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import CustomAirport from './CustomAirport.vue';
import OneChoice from '../shared/OneChoice.vue'
import { UserUrl } from '../../lib/UserUrl.ts';

const emits = defineEmits(['close','selection'])
const orientations = [{label:'Vertical',value:'v'},{label:'Magnetic',value:'m'}]

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */
 const props = defineProps({
    airport: { type: Object, default: null},
    rwyName: { type: String, default: null},
    rwyOrientation: { type: String, default: 'vertical'},
})

function loadProps(props) {
    // console.log('[AirportEdit.loadProps] ' + JSON.stringify(props))
    if( props.airport) {
        airport = props.airport
        showAirport()
        // update edit field value to reflect airport code
        airportCode.value = airport.code;
        // if we have an airport to start with, we can revert.
        canCancel.value = true;
        canApply.value = true;
        // console.log('[AirportEdit.loadProps]', canCancel.value, canApply.value)
        // select the first runway by default
        if( props.rwyName) {
            selectedRwy.value = props.rwyName
        } else {
            // console.log( "using first runway")
            selectedRwy.value = airport.rwys[0].name
        }

        rwyOrientation.value = orientations[(props.rwyOrientation == 'magnetic' ? 1 : 0)]
        // console.log( 'AirportEdit loadProps ' + props.rwyOrientation)

        if('custom' in airport && airport.custom) {
            customAirport.value = airport;
            canEdit.value = true
        }
    }
}

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})


let airport = null
const loading = ref(false)
const rwyList = ref([])
const airportCode = ref('')
const airportName = ref('')
const canCancel = ref(false)
const canApply = ref(false)
const canCreate = ref(false)
const canEdit = ref(false)
const validAirport = ref(false)
const rwyOrientation = ref(orientations[0])
const selectedRwy = ref(null)
const showCustomAirport = ref(false)
const customAirport = ref(null)
const currentUser = ref(null)

function loadAirport( code) {
    // console.log('[AirportEdit.loadAirport]', code)
    airportCode.value = code
    airportName.value = '...'
    data.getAirport( code)
        .then( newAirport => {
            loading.value = false;
            if( newAirport && newAirport.version != -1) {
                loadAirportData(newAirport)
            } else { // airport is unknown
                onInvalidAirport(code)
            }
        })
}

function loadAirportData(newAirport) {
    // console.log("[AirportEdit.loadAirport] airport", JSON.stringify(airport))
    // console.log("[AirportEdit.loadAirport] newAirport", JSON.stringify(newAirport))
    airport = newAirport
    showAirport()
    // select the first runway by default
    // console.log("[AirportEdit.loadAirport] runways", JSON.stringify(airport.rwys))
    if('rwys' in airport && airport.rwys.length > 0) {
        selectedRwy.value = airport.rwys[0]['name']
        canApply.value = true
    } else {
        canApply.value = false
    }
    if( 'custom' in airport && airport.custom) {
        customAirport.value = newAirport
        canEdit.value = true
    } else {
        customAirport.value = null
        canEdit.value = false
    }
    canCreate.value = false
    canCancel.value = true
}

// settings are applied
function onApply() {
    // update settings with orientation
    const orientation = rwyOrientation.value.value == 'v' ? 'vertical' : 'magnetic'
    emits('selection', airport, selectedRwy.value, orientation)
}

function onCancel() {
    emits('close')
}

function onCustomUpdated(code, airportData) {
    // console.log('[AirportEdit.onCustomUpdated]', code)
    showCustomAirport.value=false
    airportCode.value = code
    
    // save in memory
    data.sessionAirports.set(code, airportData)
    loadAirport(code)
}

// function onCustomCreate() {
//     // console.log('[AirportEdit.onCustomCreate]')
//     const newAirport = new Airport( airportCode.value, "", 0)
//     newAirport.custom = true
//     // console.log('[AirportEdit.onCustomCreate] newAirport', JSON.stringify(newAirport))
//     customAirport.value = newAirport;
//     showCustomAirportDialog()
// }

// function onCustomEdit() {
//     showCustomAirportDialog();
// }

function onInvalidAirport(code) {
    // console.log('[AirportEdit.onInvalidAirport]', code)
    rwyList.value = [];
    airportName.value = "Unknown"
    validAirport.value = false
    canApply.value = false
    canCreate.value = false // Airport.isValidCode(code)
    canEdit.value = false

}

// A runway has been selected from the list
function selectRunway(rwy) {
    // console.log( "[AirportEdit.selectRunway]", rwy)
    canApply.value = true
    selectedRwy.value = rwy
}

function showAirport() {
    rwyList.value = airport.rwys;
    airportName.value = airport.name
    validAirport.value = true;
}
                            
</script>

<style scoped>
.settings{
    display: flex;
    flex-flow: column;
    gap: 5px;    
    font-size: 0.7rem;
    padding: 5px
}
.rwySelector {
    display:grid;
    grid-template-columns: auto auto auto;
    /* display: flex;
    justify-content: center; */
    gap: 2px 5px;
    overflow: auto;
    height: 4.5rem;
}

.sign {
    border-radius: 4px;
    /* border: 1px solid black; */
    padding: 2px 5px;
    font-size: 0.7rem;
}
.miniHeader {
    margin-top:5px;
    text-align: left;
}
.runway {
    background: red;
    color:white;
}
.rwyChoices {
    display: flex;
    flex-flow: column;
    gap: 5px;
}
.rwyOrientation {
    display: flex;
    justify-content: flex-start;
    gap: 5px;
}

.rwyOrientation .p-button {
    padding: 0.5rem
}
.rwyOrientationChoice {
    font-size: 0.8rem;
}
.switch {
    height: 1.5rem;
    line-height: 1.5rem;
    font-size: 0.8rem;
}
:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.4rem;
}
.spinner {
    height: 1.5rem;
}
</style>