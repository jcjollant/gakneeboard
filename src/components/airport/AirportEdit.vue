<template>
    <div class="content">
        <div class="settings">
            <AirportInput :code="airportCode" :auto="true" :expanded="!runwaySelection"
                @valid="loadAirportData" @invalid="onInvalidAirport" />
            <ProgressSpinner v-if="loading" class="spinner" ></ProgressSpinner>
            <div v-else-if="validAirport && runwaySelection" class="rwyChoices">
                <div class="miniSection">Runway</div>
                <div class="rwySelector">
                    <Button :label="rwy.name" class="sign" :severity="rwy.name == selectedRwyName ? 'primary' : 'secondary'"
                        v-for="rwy in rwyList" 
                        @click="selectRunway(rwy.name)"></Button>
                    <!-- <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :severity="selectedRwy == 'all' ? 'primary' : 'secondary'"
                            @click="selectRunway('all')"></Button> -->
                </div>
                <div class="rwyOrientation">
                    <EitherOr v-if="validAirport" v-model="verticalOrientation" either="Vertical" or="Magnetic" class="eoOrientation" />
                </div>
                <div class="miniSection">Traffic Pattern</div>
                <OneChoice v-if="validAirport" v-model="patternChoice" :choices="patternChoices" :thinpad="true" class="ocTP" />
                <div class="rwyOrientation">
                    <EitherOr v-if="validAirport" v-model="showHeadings" either="Show Hdg" or="Hide Hdg" class="eoHeadings" />
                </div>
            </div>
        </div>
        <ActionBar :video="UserUrl.airportTileVideo" :help="UserUrl.airportTileGuide"
            :canApply="canApply" :showCancel="showCancel"
            @apply="onApply" @cancel="onCancel"  />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as data from '../../assets/data.js'

import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import OneChoice from '../shared/OneChoice.vue'
import { OneChoiceValue } from '../../model/OneChoiceValue.ts'
import { UserUrl } from '../../lib/UserUrl.ts';
import EitherOr from '../shared/EitherOr.vue';
import { DisplayModeAirport } from '../../model/DisplayMode';
import { Airport } from '../../model/Airport.ts';
import { Runway as AirportRunway } from '../../model/Airport.ts';
import { AirportTileConfig } from './AirportTileConfig.ts';

let airport = new Airport()

const airportCode = ref('')
const airportName = ref('')
const emits = defineEmits(['close','selection'])
const patternChoices = [
    new OneChoiceValue('T+B',0,'Both runways with 45° entries'),
    new OneChoiceValue('T/45', 1, 'Top Runway, 45° entry'),
    new OneChoiceValue('T/M', 2, 'Top Runway, Midfield'),
    new OneChoiceValue('B/45', 3, 'Bottom Runway, 45° entry'),
    new OneChoiceValue('B/M', 4, 'Bottom Runway, Midfield'),
    new OneChoiceValue('None', 5, 'None'),
]
const loading = ref(false)
const patternChoice = ref(patternChoices[0])
const props = defineProps({
    airport: { type: Object, default: null},
    config: { type:AirportTileConfig, required: true},
})
const rwyList = ref<AirportRunway[]>([])
const showCancel = ref(false)
const canApply = ref(false)
const canCreate = ref(false)
const validAirport = ref(false)
const verticalOrientation = ref(true)
const runwaySelection = ref(false)
const selectedRwyName = ref('')
const showCustomAirport = ref(false)
const showHeadings = ref(true)

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */

function loadProps(props) {
    // console.log('[AirportEdit.loadProps] ' + JSON.stringify(props))
    if( props.airport) {
        airport = Airport.copy(props.airport)
        showAirport()
    }
    if(props.config) {
        const config = props.config as AirportTileConfig
        // update edit field value to reflect airport code
        airportCode.value = config.code;
        // if we have an airport to start with, we can revert.
        showCancel.value = true;
        canApply.value = true;

        // select the first runway by default
        if( config.rwys.length > 0) {
            selectedRwyName.value = config.rwys[0]
        } else if( props.airport) {
            // Default to first runway name
            selectedRwyName.value = props.airport.rwys[0].name
        }

        // rwyOrientation.value = orientations[(props.rwyOrientation == 'magnetic' ? 1 : 0)]
        verticalOrientation.value = (config.rwyOrientation == 'vertical')
        // console.log( 'AirportEdit loadProps ' + props.rwyOrientation)

        // restore show headings
        showHeadings.value = config.headings
        runwaySelection.value = config.mode == DisplayModeAirport.RunwaySketch

        // Traffic pattern
        patternChoice.value = patternChoices.find( p => p.value == config.pattern) ?? patternChoices[0];
    } else { // In the absence of a config
        runwaySelection.value = false;
        patternChoice.value = patternChoices[0];
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


function loadAirport( code:string) {
    // console.log('[AirportEdit.loadAirport]', code)
    airportCode.value = code
    airportName.value = '...'
    data.getAirport( code)
        .then( a => {
            const newAirport = Airport.copy(a)
            // console.log("[AirportEdit.loadAirport] newAirport", newAirport)
            loading.value = false;
            if( newAirport.isValid()) {
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
        selectedRwyName.value = airport.rwys[0]['name']
        canApply.value = true
    } else {
        canApply.value = false
    }
    canCreate.value = false
    showCancel.value = true
}

// settings are applied
function onApply() {
    // update settings with orientation
    const orientation = verticalOrientation.value ? 'vertical' : 'magnetic'
    const showHeadingsValue = showHeadings.value
    emits('selection', airport, selectedRwyName.value, orientation, patternChoice.value.value, showHeadingsValue)
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

function onInvalidAirport(code:string) {
    // console.log('[AirportEdit.onInvalidAirport]', code)
    rwyList.value = [];
    airportName.value = "Unknown"
    validAirport.value = false
    canApply.value = false
    canCreate.value = false // Airport.isValidCode(code)
}

// A runway has been selected from the list
function selectRunway(rwy) {
    // console.log( "[AirportEdit.selectRunway]", rwy)
    canApply.value = true
    selectedRwyName.value = rwy
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
    display:flex;
    gap: 2px 5px;
    flex-wrap: wrap;
    justify-content: center;
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
.miniSection {
    display: flex;
    font-weight: bold;
    padding-top: 5px;
    justify-content: center;
    border-top: 1px dotted darkgrey;
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
    justify-content: center;
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
.content {
    width: 100%;
}
</style>