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
            <Separator name="Runway(s)" :leftAligned="true" />
            <div v-if="validAirport">
                <div class="rwySelector" title="Select Runway">
                    <Button v-for="rwy in rwyList" :key="rwy.name" class="sign"
                    :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                    @click="selectRunway(rwy.name)"
                    title="Select Runway">
                    <div class="rwy-btn-content">
                        <span class="rwy-name">{{ rwy.name }}</span>
                        <span class="rwy-len">{{ Formatter.feet(rwy.length) + getRunwayPositionLabel(rwy.name) }}</span>
                    </div>
                </Button>
                </div>
                <div class="settings-grid">
                    <span class="selection-label">Orientation</span>
                    <EitherOr v-model="verticalOrientation" either="Vertical" or="Magnetic" :embedded="true" :small="true" />

                    <template v-if="rwyList.length > 1">
                        <span class="selection-label">Show</span>
                        <EitherOr v-model="isSingleSelect" either="One Runway" or="Two Runways" :embedded="true" :small="true" />
                    </template>

                    <span class="selection-label">Traffic Pattern</span>
                    <ChoiceList v-model="patternChoice" :choices="patternOptions" :small="true" />
                </div>
            </div>
            <div v-else class="centered">
                <span>Select Airport to view runways</span>
            </div>
        </div>

        <!-- Conditions Section -->
        <Separator name="Conditions" :leftAligned="true" />
        <div class="settings-grid">
            <span class="selection-label">Show</span>
            <AnyOf v-model="conditionChoices" :allowsNoSelection="true" />
        </div>

        <!-- Display Configuration -->
        <div class="settings-section display-section">
            <SeparatorChoice name="Display" choiceA="Normal" choiceB="Expanded" v-model="isNormalSize" />
            <ChoiceList v-model="currentMode" :choices="modeOptions" :small="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, inject } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import AirportInput from '../shared/AirportInput.vue';

import Separator from '../shared/Separator.vue';
import ChoiceList from '../shared/ChoiceList.vue';
import SeparatorChoice from '../shared/SeparatorChoice.vue';
import AnyOf from '../shared/AnyOf.vue';
import EitherOr from '../shared/EitherOr.vue';
import { OneChoiceValue } from '../../models/OneChoiceValue';

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
const modeOptions = AirportTileConfig.modesList;
const currentMode = ref(DisplayModeAirport.RunwaySketch);
const expanded = ref(false);
const airportCode = ref('');

const isNormalSize = computed({
    get: () => !expanded.value,
    set: (val: boolean) => expanded.value = !val
});

const airport = ref<Airport>(new Airport());
const selectedRouteCode = ref<RouteCode | undefined>(undefined);
const validAirport = ref(false);

const loading = ref(false);
const isInternalUpdate = ref(false);

// Runway/Pattern State
const isSingleSelect = ref(true);
const rwyList = ref<AirportRunway[]>([]);
const selectedRwyNames = ref<string[]>([]);
const verticalOrientation = ref(true);
const showHeadings = ref(true);
const patternChoice = ref(TrafficPatternDisplay.Downwind); // Default
const showMetar = ref(true);
const showNotams = ref(true);

const conditionChoices = ref<OneChoiceValue[]>([
    new OneChoiceValue('NOTAMs', 'notams', undefined, true),
    new OneChoiceValue('METAR', 'metar', undefined, true)
]);




const patternOptions = [TrafficPatternDisplay.None, TrafficPatternDisplay.Downwind, TrafficPatternDisplay.Entry45, TrafficPatternDisplay.Midfield].map(value => ({
    label: value === TrafficPatternDisplay.None ? 'Hide' : TrafficPatternDisplayLabels[value],
    value: value
}));

// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

watch(isSingleSelect, (newVal) => {
    if (!isInternalUpdate.value && newVal && selectedRwyNames.value.length > 1) {
        selectedRwyNames.value = [selectedRwyNames.value[0]];
    }
});

watch(conditionChoices, (newChoices: OneChoiceValue[]) => {
    const notams = newChoices.find((c: OneChoiceValue) => c.label === 'NOTAMs')?.active ?? true;
    const metar = newChoices.find((c: OneChoiceValue) => c.label === 'METAR')?.active ?? true;
    
    if (showNotams.value !== notams || showMetar.value !== metar) {
        showNotams.value = notams;
        showMetar.value = metar;
    }
}, { deep: true });

watch([currentMode, expanded, airportCode, selectedRwyNames, verticalOrientation, showHeadings, patternChoice, showMetar, showNotams, selectedRouteCode, isSingleSelect], () => {
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

    if (config.isSingleSelect !== undefined) {
        isSingleSelect.value = config.isSingleSelect;
    } else {
        if (newRwys.length > 1) {
            isSingleSelect.value = false;
        } else {
            isSingleSelect.value = true;
        }
    }

    // Check for equality to avoid infinite recursion
    const isSame = selectedRwyNames.value.length === newRwys.length && 
                   selectedRwyNames.value.every((v, i) => v === newRwys[i]);

    if (!isSame) {
        selectedRwyNames.value = newRwys;
    }
    verticalOrientation.value = config.rwyOrientation === RunwayOrientation.Vertical;
    showHeadings.value = config.headings;
    
    patternChoice.value = TrafficPatternDisplay.Downwind;
    if (config.pattern) {
        const tpd = config.pattern as TrafficPatternDisplay;
        if( tpd == TrafficPatternDisplay.None || tpd == TrafficPatternDisplay.Downwind || tpd == TrafficPatternDisplay.Entry45 || tpd == TrafficPatternDisplay.Midfield) {
            patternChoice.value = tpd;
        }
    }

    showMetar.value = config.showMetar ?? true;
    showNotams.value = config.showNotams ?? true;

    conditionChoices.value = [
        new OneChoiceValue('NOTAMs', 'notams', undefined, showNotams.value),
        new OneChoiceValue('METAR', 'metar', undefined, showMetar.value)
    ];

    if (airportCode.value) {
        // Fetch airport data to populate lists
        loading.value = true;
        getAirport(airportCode.value, true).then((a: Airport) => {
            loadAirportData(a);
            if (selectedRwyNames.value.length === 0 && a.rwys.length > 0) {
                selectedRwyNames.value = [a.rwys[0].name];
            }
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
            isSingleSelect.value = true;
        }
    } else {
        selectedRwyNames.value = [];
        isSingleSelect.value = true;
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
    if (!isSingleSelect.value) {
        if (selectedRwyNames.value.includes(name)) {
            if (selectedRwyNames.value.length > 1) {
                selectedRwyNames.value = selectedRwyNames.value.filter(n => n !== name);
            }
        } else {
            selectedRwyNames.value.push(name);
            if (selectedRwyNames.value.length > 2) {
                selectedRwyNames.value.shift();
            }
        }
    } else {
        if (selectedRwyNames.value.includes(name)) {
            // Already selected, do nothing to prevent empty selection
            return;
        } else {
            selectedRwyNames.value = [name];
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
        patternChoice.value,
        originalCorners, 
        orientation,
        showHeadings.value,
        currentMode.value,
        showMetar.value,
        showNotams.value,
        isSingleSelect.value,
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

.settings-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.display-section :deep(.choicelist) {
    justify-content: center;
}

.rwyChoices {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.settings-grid {
    display: grid;
    grid-template-columns: 110px auto;
    gap: 8px 15px;
    align-items: center;
    margin-bottom: 8px;
}



.selection-label {
    font-size: 0.8rem;
    color: var(--bg-secondary);
    font-weight: bold;
}

.rwySelector {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    margin-bottom: 10px;
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

</style>
