<script setup>
import { ref, onMounted, watch } from 'vue'
import { Airport } from '../../assets/Airport';
import * as data from '../../assets/data.js'

import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';

import AirportInput from '../shared/AirportInput.vue'
import CustomAirport from './CustomAirport.vue';

const emits = defineEmits(['close','selection'])

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */
 const props = defineProps({
    airport: { type: Object, default: null},
    rwyName: { type: String, default: null},
    rwyOrientation: { type: String, default: null},
})

function loadProps(props) {
    // console.log('AirportEdit loading props ' + JSON.stringify(props))
    if( props.airport) {
        airport = props.airport
        showAirport()
        // update edit field value to reflect airport code
        airportCode.value = airport.code;
        // if we have an airport to start with, we can revert.
        canCancel.value = true;
        canApply.value = true;
        
        // select the first runway by default
        if( props.rwyName) {
            selectedRwy.value = props.rwyName
        } else {
            // console.log( "using first runway")
            selectedRwy.value = airport.rwys[0].name
        }

        rwyOrientation.value = (props.rwyOrientation ? props.rwyOrientation : 'vertical')
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
const rwyOrientation = ref('vertical')
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
                rwyList.value = [];
                airportName.value = "Unknown"
                validAirport.value = false
                canApply.value = false
                canCreate.value = Airport.isValidCode(code)
                canEdit.value = false
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
    // canEdit.value = (customAirport.value != null)
    canCreate.value = false
    // we cannot apply until we pick a runway
}

function onAirportInputUpdating() {
    loading.value=true
}

// settings are applied
function onApply() {
    // update settings with orientation
    emits('selection', airport, selectedRwy.value, rwyOrientation.value.toLowerCase())
}
    
function onCustomUpdated(code, airportData) {
    // console.log('[AirportEdit.onCustomUpdated]', code)
    showCustomAirport.value=false
    airportCode.value = code
    
    data.refreshAirport(code, airportData)
    loadAirport(code)
}

function onCustomCreate() {
    // console.log('[AirportEdit.onCustomCreate]')
    const newAirport = new Airport( airportCode.value, "", 0)
    newAirport.custom = true
    // console.log('[AirportEdit.onCustomCreate] newAirport', JSON.stringify(newAirport))
    customAirport.value = newAirport;
    showCustomAirportDialog()
}

function onCustomEdit() {
    showCustomAirportDialog();
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
                            
function showCustomAirportDialog() {
    currentUser.value = data.getCurrentUser()
    showCustomAirport.value = true
}

</script>

<template>
    <div class="content">
        <CustomAirport v-model:visible="showCustomAirport" :airport="customAirport" :user="currentUser"
                        @close="showCustomAirport=false" @updated="onCustomUpdated" />
        <div class="settings">
            <AirportInput :code="airportCode" :auto="true"
                @valid="loadAirportData" />
            <ProgressSpinner v-if="loading" class="spinner" ></ProgressSpinner>
            <div v-else-if="validAirport">
                <div class="miniHeader">Runway</div>
                <div class="rwySelector">
                    <Button :label="rwy.name" class="sign" :severity="rwy.name == selectedRwy ? 'primary' : 'secondary'"
                        v-for="rwy in rwyList" 
                        @click="selectRunway(rwy.name)"></Button>
                    <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :severity="selectedRwy == 'all' ? 'primary' : 'secondary'"
                            @click="selectRunway('all')"></Button>
                </div>
                <div class="miniHeader" v-if="validAirport">Orientation</div>
                <div class="rwyOrientation" v-if="validAirport">
                    <Button label="Vertical" 
                        @click="rwyOrientation='vertical'" :severity="rwyOrientation == 'vertical' ? 'primary' : 'secondary'"></Button>
                    <Button label="Magnetic" 
                        @click="rwyOrientation='magnetic'" :severity="rwyOrientation == 'magnetic' ? 'primary' : 'secondary'"></Button>
                </div>
            </div>
        </div>
        <div class="actionBar">
                <Button v-if="canEdit" label="Edit" severity="secondary"
                    @click="onCustomEdit"></Button>
                <Button v-if="canCreate" label="Create" severity="secondary"
                    @click="onCustomCreate"></Button>
                <Button v-if="canCancel" label="Cancel" link @click="emits('close')"></Button>
                <Button label="Apply" 
                    @click="onApply" :disabled="!canApply" ></Button>
            </div>
    </div>
</template>

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
    height: 1.5rem;
}
.spinner {
    height: 1.5rem;
}
</style>