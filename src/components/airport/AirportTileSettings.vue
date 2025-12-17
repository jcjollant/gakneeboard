<template>
    <div class="airport-settings">
        <!-- Airport Section -->
        <!-- <Separator name="Airport" /> -->
        <div class="airport-selection">
            <AirportInput :code="airportCode" :auto="true" :expanded="true" :large="true"
                @valid="onUserSelectAirport"
                @invalid="onInvalidAirport" />
        </div>

        <ProgressSpinner v-if="loading" class="spinner"></ProgressSpinner>
        
        <!-- Runway & Pattern Section -->
        <div v-else class="rwyChoices">
            <Separator name="Runway(s)" />
            <div v-if="validAirport">
                <div class="rwySelector" title="Select 1 or 2 runways">
                    <Button v-for="rwy in rwyList" :key="rwy.name" class="sign"
                        :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                        @click="selectRunway(rwy.name)">
                        <div class="rwy-btn-content">
                            <span class="rwy-name">{{ rwy.name }}</span>
                            <span class="rwy-len">{{ Formatter.feet(rwy.length) }}</span>
                        </div>
                    </Button>
                <div class="rwyOrientation">
                    <EitherOr v-if="validAirport" v-model="verticalOrientation" either="Vertical" or="Magnetic"
                        class="eoOrientation" />
                </div>
                </div>
            </div>
            <div v-else class="centered">
                <span>Select Airport to view runways</span>
            </div>
            
            
            <Separator name="Traffic Pattern" />
            <div class="pattern-selector">
                <Button v-for="option in patternOptions" :key="option.value" 
                    :severity="patternChoice === option.value ? 'primary' : 'secondary'"
                    @click="patternChoice = option.value"
                    class="pattern-btn">
                    {{ option.label }}
                </Button>
            </div>
        </div>
        <!-- Display Mode Section -->
        <Separator name="Display" class="separator" />
        <DisplayModeSelection v-model="currentMode" :modes="modesList" :expandable="true" :expanded="expanded"
            @expand="onExpand" />

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, inject } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import AirportInput from '../shared/AirportInput.vue';
import EitherOr from '../shared/EitherOr.vue';

import Separator from '../../components/shared/Separator.vue';

import { Airport } from '../../models/Airport';
import { AirportTileConfig } from './AirportTileConfig';
import { Runway as AirportRunway } from '../../models/Airport';
import { Formatter } from '../../lib/Formatter';

import { TrafficPatternDisplay, TrafficPatternDisplayLabels } from '../../models/TrafficPatternDisplay';
import { RunwayOrientation } from './RunwayOrientation';
import { DisplayModeAirport, DisplayModeChoice } from '../../models/DisplayMode';
import { getAirport } from '../../services/AirportService';
import { TileData } from '../../models/TileData';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

const emits = defineEmits(['update']);

const tileData = ref<TileData>(props.tileData);

// State
const currentMode = ref(DisplayModeAirport.RunwaySketch);
const expanded = ref(false);
const airportCode = ref('');
const airport = ref<Airport>(new Airport());
const validAirport = ref(false);

const loading = ref(false);
const isInternalUpdate = ref(false);

// Runway/Pattern State
const rwyList = ref<AirportRunway[]>([]);
const selectedRwyNames = ref<string[]>([]);
const verticalOrientation = ref(true);
const showHeadings = ref(true);
const patternChoice = ref<TrafficPatternDisplay>(TrafficPatternDisplay.Entry45); // Default

// Lists
const modesList = ref([
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.RunwaySketch, true, "Simplified vue of runway(s) with airport data"),
    new DisplayModeChoice('Airport Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data"),
]);

const patternOptions = Object.values(TrafficPatternDisplay).map(value => ({
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

// Watch for changes to emit update candidates
watch([currentMode, airportCode, selectedRwyNames, verticalOrientation, showHeadings, patternChoice], () => {
    if (!isInternalUpdate.value) {
        emitUpdate();
    }
});

function loadFromTileData(tile: TileData) {
    if (!tile) return;
    const config = tile.data as AirportTileConfig;
    if (!config) return;

    // load config.mode or default to RunwaySketch
    const newMode = config.mode || DisplayModeAirport.RunwaySketch;
    if (currentMode.value !== newMode) {
        currentMode.value = newMode;
    }
    expanded.value = tile.span2;

    airportCode.value = config.code;
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
    
    const validValues: string[] = Object.values(TrafficPatternDisplay);
    if (config.pattern && validValues.includes(config.pattern)) {
        patternChoice.value = config.pattern as TrafficPatternDisplay;
    } else {
        patternChoice.value = TrafficPatternDisplay.Entry45;
    }

    if (config.code) {
        // Fetch airport data to populate lists
        loading.value = true;
        getAirport(config.code, true).then((a: Airport) => {
            loadAirportData(a);
            loading.value = false;
        }).catch(() => {
            loading.value = false;
        });
    }
}


function onUserSelectAirport(newAirport: Airport) {
    isInternalUpdate.value = true;
    loadAirportData(newAirport);
    
    // Default to first runway if there is one
    if (newAirport.rwys.length > 0) {
        selectedRwyNames.value = [newAirport.rwys[0].name];
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

function onExpand(val: boolean) {
    expanded.value = val;
    emitUpdate(); 
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
    );

    tileData.value.data = newConfig;
    tileData.value.span2 = expanded.value;

    if (tileSettingsUpdate) {
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

.recent-airports {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.recent-label {
    font-size: 0.8rem;
    color: #666;
}

.recent-list {
    display: flex;
    gap: 5px;
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
    justify-content: center;
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

.rwyOrientation {
    display: flex;
    justify-content: center;
}

.centered {
    text-align: center;
}

.pattern-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
}

.pattern-btn {
    padding: 4px 12px;
    font-size: 0.9rem;
}
</style>
