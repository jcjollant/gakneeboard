<template>
    <div class="airport-settings">
        <!-- Airport Section -->
        <Separator name="Airport Code" :leftAligned="true" />
        <div class="airport-selection">
            <AirportInput v-model:routeCode="selectedRouteCode"
                :code="airportCode" :auto="true" :showRecent="true" :large="true" :route="route" :defaultToLastKnown="true"
                @valid="onUserSelectAirport"
                @invalid="onInvalidAirport" />
        </div>


        <ProgressSpinner v-if="loading" class="spinner"></ProgressSpinner>
        
        <!-- Runway & Pattern Section -->
        <div class="rwyChoices">
            <SeparatorChoice name="Runway(s)" choiceA="Vertical" choiceB="Magnetic" v-model="verticalOrientation" />
            <div v-if="validAirport">
                <div class="rwySelector" title="Select 1 or 2 runways">
                    <Button v-for="rwy in rwyList" :key="rwy.name" class="sign"
                    :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                    @click="selectRunway(rwy.name)">
                    <div class="rwy-btn-content">
                        <span class="rwy-name">{{ rwy.name }}</span>
                        <span class="rwy-len">{{ Formatter.feet(rwy.length) + getRunwayPositionLabel(rwy.name) }}</span>
                    </div>
                </Button>
                </div>
            </div>
            <div v-else class="centered">
                <span>Select Airport to view runways</span>
            </div>
        </div>

        <!-- Traffic Pattern Section -->
        <SeparatorChoice name="Traffic Pattern" choiceA="Show" choiceB="Hide" v-model="showPattern" />
        <div v-if="showPattern" class="pattern-selector">
            <Button v-for="option in patternOptions" :key="option.value" 
                :severity="patternChoice === option.value ? 'primary' : 'secondary'"
                @click="patternChoice = option.value"
                class="pattern-btn">
                {{ option.label }}
            </Button>
        </div>


        <!-- Conditions Section -->
        <SeparatorChoice name="NOTAMs" choiceA="Show" choiceB="Hide" v-model="showNotams" />
        <SeparatorChoice name="METAR" choiceA="Show" choiceB="Hide" v-model="showMetar" />



    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import AirportInput from '../shared/AirportInput.vue';

import SeparatorChoice from '../../components/shared/SeparatorChoice.vue';
import Separator from '../../components/shared/Separator.vue';

import { Airport } from '../../models/Airport';
import { Route, RouteCode } from '@gak/shared';
import { AirportTileConfig } from './AirportTileConfig';
import { Runway as AirportRunway } from '../../models/Airport';
import { Formatter } from '../../lib/Formatter';

import { TrafficPatternDisplay, TrafficPatternDisplayLabels } from '../../models/TrafficPatternDisplay';
import { RunwayOrientation } from './RunwayOrientation';
import { DisplayModeAirport } from '../../models/DisplayMode';
import { getAirport } from '../../services/AirportDataService';
import { TileData } from '../../models/TileData';
import { RouteService } from '../../services/RouteService';


const props = defineProps({
    tileData: { type: TileData, required: true },
    route: { type: Object as () => Route, default: undefined}
});

const tileData = ref<TileData>(props.tileData);

// State
const currentMode = ref(DisplayModeAirport.RunwaySketch);
const expanded = ref(false);
const airportCode = ref('');
const airport = ref<Airport>(new Airport());
const selectedRouteCode = ref<RouteCode | undefined>(undefined);
const validAirport = ref(false);

const loading = ref(false);
const isInternalUpdate = ref(false);

// Runway/Pattern State
const rwyList = ref<AirportRunway[]>([]);
const selectedRwyNames = ref<string[]>([]);
const verticalOrientation = ref(true);
const showHeadings = ref(true);
const patternChoice = ref(TrafficPatternDisplay.Downwind); // Default
const showMetar = ref(true);
const showNotams = ref(true);
const showPattern = ref(true);




const patternOptions = [TrafficPatternDisplay.Downwind, TrafficPatternDisplay.Entry45, TrafficPatternDisplay.Midfield].map(value => ({
    label: TrafficPatternDisplayLabels[value],
    value: value
}));

// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

watch([currentMode, airportCode, selectedRwyNames, verticalOrientation, showHeadings, patternChoice, showPattern, showMetar, showNotams, selectedRouteCode], () => {
    if (!isInternalUpdate.value) {
        emitUpdate();
    }
});

function loadFromTileData(tile: TileData) {
    // console.debug('[AirportTileSettings.loadFromTileData]', tile)
    if (!tile) return;
    const config = tile.data as AirportTileConfig;
    if (!config) return;

    isInternalUpdate.value = true;

    // load config.mode or default to RunwaySketch
    const newMode = config.mode || DisplayModeAirport.RunwaySketch;
    if (currentMode.value !== newMode) {
        currentMode.value = newMode;
    }
    expanded.value = tile.span2;

    const codeFromRoute = RouteService.getAirportCode(props.route, config.routeCode)
    if(codeFromRoute) {
        airportCode.value = codeFromRoute
        selectedRouteCode.value = config.routeCode
    } else {
        airportCode.value = config.code;
        selectedRouteCode.value = undefined
    }
    // if config.rwys is iterable, convert to array
    const rwyIterable = config.rwys && Symbol.iterator in Object(config.rwys);
    const newRwys = rwyIterable ? [...config.rwys] : [];

    // Check for equality to avoid infinite recursion
    const isSame = selectedRwyNames.value.length === newRwys.length && 
                   selectedRwyNames.value.every((v, i) => v === newRwys[i]);

    if (!isSame) {
        selectedRwyNames.value = newRwys;
    }
    verticalOrientation.value = config.rwyOrientation === RunwayOrientation.Vertical;
    showHeadings.value = config.headings;
    
    patternChoice.value = TrafficPatternDisplay.Downwind;
    showPattern.value = true;
    if (config.pattern) {
        const tpd = config.pattern as TrafficPatternDisplay;
        if(tpd == TrafficPatternDisplay.None) {
            showPattern.value = false;
        } else {
            showPattern.value = true;
            if( tpd == TrafficPatternDisplay.Downwind || tpd == TrafficPatternDisplay.Entry45 || tpd == TrafficPatternDisplay.Midfield) {
                patternChoice.value = tpd;
            }
        }
    }

    showMetar.value = config.showMetar ?? true;
    showNotams.value = config.showNotams ?? true;

    if (airportCode.value) {
        // Fetch airport data to populate lists
        loading.value = true;
        getAirport(airportCode.value, true).then((a: Airport) => {
            loadAirportData(a);
            loading.value = false;
        }).catch(() => {
            loading.value = false;
        });
    }
    isInternalUpdate.value = false;
}


function onUserSelectAirport(newAirport: Airport) {
    const isSameAirport = newAirport.code === airportCode.value;

    isInternalUpdate.value = true;
    loadAirportData(newAirport);
    
    // Default to first runway if there is one, but only if it's a new airport or no selection
    if (newAirport.rwys.length > 0) {
        if (!isSameAirport || selectedRwyNames.value.length === 0) {
            selectedRwyNames.value = [newAirport.rwys[0].name];
        }
    } else {
        selectedRwyNames.value = [];
    }
    
    isInternalUpdate.value = false;
    emitUpdate();
}



function loadAirportData(newAirport: Airport) {
    airport.value = newAirport;
    airportCode.value = newAirport.code;
    // selectedRwyNames.value = [];
    rwyList.value = newAirport.rwys;
    validAirport.value = true;
}

function onInvalidAirport(code: string) {
    validAirport.value = false;
    rwyList.value = [];
}

function selectRunway(name: string) {
    if (selectedRwyNames.value.includes(name)) {
        selectedRwyNames.value = selectedRwyNames.value.filter(n => n !== name);
    } else {
        selectedRwyNames.value.push(name);
        if (selectedRwyNames.value.length > 2) {
            selectedRwyNames.value.shift();
        }
    }
}


function getRunwayPositionLabel(rwyName: string): string {
    if (selectedRwyNames.value.length < 2) return '';
    if (selectedRwyNames.value[0] === rwyName) return ' (L)';
    if (selectedRwyNames.value[1] === rwyName) return ' (R)';
    return '';
}

function emitUpdate() {
    // Build new config object
    const orientation = verticalOrientation.value ? RunwayOrientation.Vertical : RunwayOrientation.Magnetic;
    
    // Check if original corners exist in data, else default
    const originalCorners = (props.tileData.data as AirportTileConfig)?.corners;

    const newConfig = new AirportTileConfig(
        airportCode.value,
        selectedRwyNames.value,
        showPattern.value ? patternChoice.value : TrafficPatternDisplay.None,
        originalCorners, 
        orientation,
        showHeadings.value,
        currentMode.value,
        showMetar.value,
        showNotams.value,
        selectedRouteCode.value
    );

    tileData.value.data = newConfig;
    tileData.value.span2 = expanded.value;

    if (tileSettingsUpdate) {
        // console.debug('[AirportTileSettings.emitUpdate] Emitting update', tileData.value)
        tileSettingsUpdate(tileData.value);
    }
}

const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;


</script>

<style scoped>
.airport-settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.airport-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rwyChoices {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rwySelector {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.sign {
    padding: 2px 8px;
    font-size: 0.8rem;
}

.rwy-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
}

.rwy-name {
    font-size: 1rem;
}

.rwy-len {
    font-size: 0.7rem;
    font-weight: normal;
}

.centered {
    text-align: center;
}

.pattern-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    margin-top: 5px;
}

.pattern-label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-right: 5px;
}

.pattern-btn {
    padding: 4px 12px;
    font-size: 0.9rem;
}
</style>
