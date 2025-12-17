<template>
    <div class="airport-settings">
        <!-- Airport Section -->
        <Separator name="Airport" />
        <div class="airport-selection">
            <AirportInput :code="airportCode" :auto="true" :expanded="true"
                @valid="loadAirportData"
                @invalid="onInvalidAirport" />
        </div>

        <ProgressSpinner v-if="loading" class="spinner"></ProgressSpinner>
        
        <!-- Runway & Pattern Section -->
        <div v-else class="rwyChoices">
            <Separator name="Runway(s)" />
            <div v-if="validAirport">
                <div class="rwySelector" title="Select 1 or 2 runways">
                    <Button v-for="rwy in rwyList" :key="rwy.name" :label="rwy.name" class="sign"
                        :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                        @click="selectRunway(rwy.name)"></Button>
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
            <OneChoice v-if="validAirport" v-model="patternChoice" :choices="patternChoices" :thinpad="true"
                class="ocTP" />
            
            <div class="rwyOrientation">
                <EitherOr v-if="validAirport" v-model="showHeadings" either="Show Hdg" or="Hide Hdg"
                    class="eoHeadings" />
            </div>
        </div>
        <!-- Display Mode Section -->
        <Separator name="Display Mode" class="separator" />
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
import OneChoice from '../shared/OneChoice.vue';
import Separator from '../../components/shared/Separator.vue';

import { Airport } from '../../models/Airport';
import { AirportTileConfig } from './AirportTileConfig';
import { Runway as AirportRunway } from '../../models/Airport';
import { OneChoiceValue } from '../../models/OneChoiceValue';
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

// Runway/Pattern State
const rwyList = ref<AirportRunway[]>([]);
const selectedRwyNames = ref<string[]>([]);
const verticalOrientation = ref(true);
const showHeadings = ref(true);
const patternChoice = ref<OneChoiceValue>(new OneChoiceValue('T+B', 0, 'Both runways with 45° entries')); // Default

// Lists
const modesList = ref([
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.RunwaySketch, true, "Simplified vue of runway(s) with airport data"),
    new DisplayModeChoice('Airport Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data"),
]);

const patternChoices = [
    new OneChoiceValue('T+B', 0, 'Both runways with 45° entries'),
    new OneChoiceValue('T/45', 1, 'Top Runway, 45° entry'),
    new OneChoiceValue('T/M', 2, 'Top Runway, Midfield'),
    new OneChoiceValue('B/45', 3, 'Bottom Runway, 45° entry'),
    new OneChoiceValue('B/M', 4, 'Bottom Runway, Midfield'),
    new OneChoiceValue('None', 5, 'None'),
];

// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

// Watch for changes to emit update candidates
watch([currentMode, airportCode, selectedRwyNames, verticalOrientation, showHeadings, patternChoice], () => {
    emitUpdate();
});

function loadFromTileData(tile: TileData) {
    if (!tile) return;
    const config = tile.data as AirportTileConfig;
    if (!config) return;

    // load config.mode or default to RunwaySketch
    currentMode.value = config.mode || DisplayModeAirport.RunwaySketch;
    expanded.value = tile.span2;

    airportCode.value = config.code;
    // if config.rwys is iterable, convert to array
    const rwyIterable = config.rwys && Symbol.iterator in Object(config.rwys);
    selectedRwyNames.value = rwyIterable ? [...config.rwys] : [];
    verticalOrientation.value = config.rwyOrientation === RunwayOrientation.Vertical;
    showHeadings.value = config.headings;
    
    const foundPattern = patternChoices.find(p => p.value === config.pattern);
    if (foundPattern) patternChoice.value = foundPattern;

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

function loadAirportData(newAirport: Airport) {
    airport.value = newAirport;
    airportCode.value = newAirport.code;
    rwyList.value = newAirport.rwys;
    validAirport.value = true;
    
    // If no runways selected yet (and new airport), default to first
    if (selectedRwyNames.value.length === 0 && newAirport.rwys.length > 0) {
        selectedRwyNames.value = [newAirport.rwys[0].name];
    }
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
        patternChoice.value.value,
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

.rwyOrientation {
    display: flex;
    justify-content: center;
}

.centered {
    text-align: center;
}
</style>
