<template>
    <div class="airport-settings">
        <!-- Display Mode Section -->
        <div class="section-title">Display Mode</div>
        <DisplayModeSelection v-model="currentMode" :modes="modesList" :expandable="true" :expanded="expanded"
            @expand="onExpand" />

        <!-- Airport Section -->
        <div class="section-title">Airport</div>
        <div class="airport-selection">
            <AirportInput :code="airportCode" :auto="true" :expanded="!runwaySelection" @valid="loadAirportData"
                @invalid="onInvalidAirport" />
            
            <div class="recent-airports" v-if="recentAirports.length > 0">
                <span class="recent-label">Recent:</span>
                <div class="recent-list">
                    <Button v-for="code in recentAirports" :key="code" :label="code" class="p-button-sm p-button-outlined"
                        @click="selectRecent(code)" />
                </div>
            </div>
        </div>

        <ProgressSpinner v-if="loading" class="spinner"></ProgressSpinner>
        
        <!-- Runway & Pattern Section -->
        <div v-else-if="validAirport && runwaySelection" class="rwyChoices">
            <div class="miniSection">Runway</div>
            <div class="rwySelector" title="Select 1 or 2 runways">
                <Button v-for="rwy in rwyList" :key="rwy.name" :label="rwy.name" class="sign"
                    :severity="selectedRwyNames.includes(rwy.name) ? 'primary' : 'secondary'"
                    @click="selectRunway(rwy.name)"></Button>
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import AirportInput from '../shared/AirportInput.vue';
import EitherOr from '../shared/EitherOr.vue';
import OneChoice from '../shared/OneChoice.vue';

import { Airport } from '../../models/Airport';
import { AirportTileConfig } from './AirportTileConfig';
import { Runway as AirportRunway } from '../../models/Airport';
import { OneChoiceValue } from '../../models/OneChoiceValue';
import { RunwayOrientation } from './RunwayOrientation';
import { DisplayModeAirport, DisplayModeChoice } from '../../models/DisplayMode';
import { LocalStoreService } from '../../services/LocalStoreService';
import { getAirport } from '../../services/AirportService';

const props = defineProps({
    config: { type: AirportTileConfig, required: true },
    expanded: { type: Boolean, default: false } // Passed from parent if needed
});

const emits = defineEmits(['update', 'change']);

// State
const currentMode = ref(DisplayModeAirport.RunwaySketch);
const airportCode = ref('');
const airport = ref<Airport>(new Airport());
const validAirport = ref(false);
const loading = ref(false);

// Runway/Pattern State
const runwaySelection = ref(false);
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

const recentAirports = ref<string[]>([]);

// Initialization
onMounted(() => {
    loadConfig(props.config);
    loadRecents();
});

watch(() => props.config, (newConfig) => {
    loadConfig(newConfig);
});

// Watch for changes to emit update candidates
watch([currentMode, airportCode, selectedRwyNames, verticalOrientation, showHeadings, patternChoice], () => {
    emitUpdate();
});

function loadRecents() {
    recentAirports.value = LocalStoreService.airportRecentsGet().slice(0, 5);
}

function selectRecent(code: string) {
    airportCode.value = code;
    // AirportInput will trigger validation
}

function loadConfig(config: AirportTileConfig) {
    if (!config) return;

    currentMode.value = config.mode;
    airportCode.value = config.code;
    selectedRwyNames.value = [...config.rwys];
    verticalOrientation.value = config.rwyOrientation === RunwayOrientation.Vertical;
    showHeadings.value = config.headings;
    
    const foundPattern = patternChoices.find(p => p.value === config.pattern);
    if (foundPattern) patternChoice.value = foundPattern;

    runwaySelection.value = config.mode === DisplayModeAirport.RunwaySketch;

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
    // Just pass up if needed, or handle locally if strictly display mode related?
    // DisplayModeSelection emits check/uncheck of "Wide"
    // Might need to bubble this up if Config stores expansion state separate from Span2?
    // TileData has span2. AirportTileConfig doesn't seem to store expanded state directly?
    // Checking AirportTile.vue: expanded is separate ref. saving config emits TileData with expanded.
    // So we should probably capture this.
    emits('change', { expanded: !val }); // DisplayModeSelection logic: notExpanded -> expanded
}

function emitUpdate() {
    // Build new config object
    const orientation = verticalOrientation.value ? RunwayOrientation.Vertical : RunwayOrientation.Magnetic;
    
    const newConfig = new AirportTileConfig(
        airportCode.value,
        selectedRwyNames.value,
        patternChoice.value.value,
        props.config.corners, // Preserve corners
        orientation,
        showHeadings.value,
        currentMode.value
    );

    emits('update', newConfig);
}

</script>

<style scoped>
.airport-settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.section-title {
    font-weight: bold;
    border-bottom: 1px solid #eee;
    margin-bottom: 5px;
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

.miniSection {
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    margin-top: 10px;
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
</style>
