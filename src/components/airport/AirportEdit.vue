<template>
    <div class="content">
        <div class="settings">
            <AirportInput :code="airportCode" :auto="true" :expanded="!runwaySelection" @valid="loadAirportData"
                @invalid="onInvalidAirport" />
            <ProgressSpinner v-if="loading" class="spinner"></ProgressSpinner>
            <div v-else-if="validAirport && runwaySelection" class="rwyChoices">
                <div class="miniSection">Runway</div>
                <div class="rwySelector" title="Select 1 or 2 runways">
                    <Button v-for="rwy in rwyList" :label="rwy.name" class="sign"
                        :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                        @click="selectRunway(rwy.name)"></Button>
                    <!-- <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :severity="selectedRwy == 'all' ? 'primary' : 'secondary'"
                            @click="selectRunway('all')"></Button> -->
                </div>
                <div class="rwyOrientation">
                    <EitherOr v-if="validAirport" v-model="verticalOrientation" either="Vertical" or="Magnetic"
                        class="eoOrientation" />
                </div>
                <div class="miniSection">Traffic Pattern</div>
                <OneChoice v-if="validAirport" v-model="patternChoice" :choices="patternChoices" :thinpad="true"
                    class="ocTP" />
                <div class="rwyOrientation">
                    <EitherOr v-if="validAirport" v-model="showHeadings" either="Show Hdg" or="Hide Hdg"
                        class="eoHeadings" />
                </div>
            </div>
        </div>
        <ActionBar :video="UserUrl.airportTileVideo" :help="UserUrl.airportTileGuide" :canApply="canApply"
            :showCancel="showCancel" @apply="onApply" @cancel="onCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import EitherOr from '../shared/EitherOr.vue';
import OneChoice from '../shared/OneChoice.vue'

import { OneChoiceValue } from '../../models/OneChoiceValue.ts'
import { UserUrl } from '../../lib/UserUrl.ts';
import { DisplayModeAirport } from '../../models/DisplayMode';
import { Airport } from '../../models/Airport.ts';
import { Runway as AirportRunway } from '../../models/Airport.ts';
import { AirportTileConfig } from './AirportTileConfig.ts';
import { RunwayOrientation } from './RunwayOrientation.ts';

let airport = new Airport()

const airportCode = ref('')
const airportName = ref('')
const emits = defineEmits(['close', 'update'])
const patternChoices = [
    new OneChoiceValue('T+B', 0, 'Both runways with 45° entries'),
    new OneChoiceValue('T/45', 1, 'Top Runway, 45° entry'),
    new OneChoiceValue('T/M', 2, 'Top Runway, Midfield'),
    new OneChoiceValue('B/45', 3, 'Bottom Runway, 45° entry'),
    new OneChoiceValue('B/M', 4, 'Bottom Runway, Midfield'),
    new OneChoiceValue('None', 5, 'None'),
]
const loading = ref(false)
const patternChoice = ref(patternChoices[0])
const props = defineProps({
    airport: { type: Object, default: null },
    config: { type: AirportTileConfig, required: true },
})
const rwyList = ref<AirportRunway[]>([])
const showCancel = ref(false)
const canApply = ref(false)
const canCreate = ref(false)
const validAirport = ref(false)
const verticalOrientation = ref(true)
const runwaySelection = ref(false)
const selectedRwyNames = ref<string[]>([])
const showHeadings = ref(true)

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */

function loadProps(props: any) {
    // console.log('[AirportEdit.loadProps] ' + JSON.stringify(props))
    if (props.airport) {
        airport = Airport.copy(props.airport)
        showAirport()
    }
    if (props.config) {
        const config = props.config as AirportTileConfig
        // update edit field value to reflect airport code
        airportCode.value = config.code;
        // if we have an airport to start with, we can revert.
        showCancel.value = true;
        canApply.value = true;

        // select the first airport runway by default
        if (config.rwys.length == 0) {
            if( props.airport && props.airport.rwys.length > 0) {
                selectedRwyNames.value = [props.airport.rwys[0].name]
            } else {
                selectedRwyNames.value = []
            }
        } else if (props.airport) {
            selectedRwyNames.value = config.rwys
        }

        // rwyOrientation.value = orientations[(props.rwyOrientation == 'magnetic' ? 1 : 0)]
        verticalOrientation.value = config.rwyOrientation == RunwayOrientation.Vertical
        // console.log( 'AirportEdit loadProps ' + props.rwyOrientation)

        // restore show headings
        showHeadings.value = config.headings
        runwaySelection.value = config.mode == DisplayModeAirport.RunwaySketch

        // Traffic pattern
        patternChoice.value = patternChoices.find(p => p.value == config.pattern) ?? patternChoices[0];
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

watch(props, async () => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

function loadAirportData(newAirport: Airport) {
    // console.log("[AirportEdit.loadAirportData]", newAirport)
    // console.log("[AirportEdit.loadAirport] newAirport", JSON.stringify(newAirport))
    airport = newAirport
    showAirport()
    // select the first runway by default
    // console.log("[AirportEdit.loadAirport] runways", JSON.stringify(airport.rwys))
    if ('rwys' in airport && airport.rwys.length > 0) {
        selectedRwyNames.value = [airport.rwys[0]['name']]
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
    const orientation = verticalOrientation.value ? RunwayOrientation.Vertical : RunwayOrientation.Magnetic
    const newSettings = new AirportTileConfig(airport.code, selectedRwyNames.value, patternChoice.value.value, props.config.corners, orientation, showHeadings.value, props.config.mode)

    emits('update', airport, newSettings)
}

function onCancel() {
    emits('close')
}

function onInvalidAirport(code: string) {
    // console.log('[AirportEdit.onInvalidAirport]', code)
    rwyList.value = [];
    airportName.value = "Unknown"
    validAirport.value = false
    canApply.value = false
    canCreate.value = false // Airport.isValidCode(code)
}

// A runway has been selected from the list
function selectRunway(rwy:string) {
    // console.log( "[AirportEdit.selectRunway]", rwy)
    if(selectedRwyNames.value.includes(rwy)) {
        selectedRwyNames.value = selectedRwyNames.value.filter((r) => r != rwy)
    } else {
        selectedRwyNames.value.push(rwy)
    }
    // limit selection to 2 ruways
    if (selectedRwyNames.value.length > 2) {
        // remove first (oldest) element
        selectedRwyNames.value.shift()
    }
    // We can apply if there is at least one selection
    canApply.value = selectedRwyNames.value.length > 0
}

function showAirport() {
    rwyList.value = airport.rwys;
    airportName.value = airport.name
    airportCode.value = airport.code
    validAirport.value = true;
}

</script>

<style scoped>
.settings {
    display: flex;
    flex-flow: column;
    gap: 5px;
    font-size: 0.7rem;
    padding: 5px
}

.rwySelector {
    display: flex;
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
    margin-top: 5px;
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
    color: white;
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

:deep(.p-component),
:deep(.p-inputgroup-addon) {
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