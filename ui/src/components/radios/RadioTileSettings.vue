<template>
    <div class="radio-settings">

        <div>
            <!-- Frequency List -->
            <SeparatorChoice name="Selected Frequencies" 
                             choiceA="Cards" choiceB="Text" v-model="isCardsMode" />
            <div class="list-editor">
                <div v-if="isCardsMode" class="freq-cards edit-cards">
                    <div v-for="(freq, index) in manualFrequencies" :key="'disp-' + index" 
                         class="freq-card-wrapper" 
                         title="Click to remove" 
                         @click="removeFrequency(index)">
                        <FrequencyBox :freq="freq" size="small" :colorScheme="colorScheme" />
                        <div class="remove-indicator">
                            <font-awesome-icon icon="minus" />
                        </div>
                    </div>
                    <div v-if="manualFrequencies.length === 0" class="empty-list">No selection. Choose from the list below.</div>
                </div>

                <Textarea v-else class='list' rows="8" cols="24" v-model="textData"
                            placeholder="Format: Value,Name,Type&#10;Ex: 123.45, KABC Twr, Tower"></Textarea>
            </div>
            

            <!-- Frequency Lookup -->
            <SeparatorChoice name="Frequency Lookup" choiceA="Airport" choiceB="Route" v-model="isAirportLookup" />
            <div class="lookup-section" v-if="isAirportLookup">
                <AirportInput label="Airport" :large="true" :page="true" :showRecent="true" :route="route" :defaultToLastKnown="true" @valid="onAirportValid" />
            </div>

            <div class="lookup-results">
                <div class="freq-cards" v-if="filteredLookupFrequencies.length">
                    <div v-for="freq in filteredLookupFrequencies" :key="freq.name + freq.value" 
                         @click="addFrequency(freq)" class="freq-card-wrapper lookup-card" title="Click to add">
                        <FrequencyBox :freq="freq" size="small" :colorScheme="colorScheme" />
                        <div class="add-indicator">
                            <font-awesome-icon icon="plus" />
                        </div>
                    </div>
                </div>
                <div v-else class="lookup-placeholder">
                    {{ isAirportLookup ? 'Select an airport to view frequencies.' : 'No route frequencies found.' }}
                </div>
            </div>
            <div v-if="isAirportLookup" class="separator">
                <div class="label">Show</div>
                <AnyOf v-model="localFreqChoices" />
            </div>

            <Separator name="Color Scheme" :leftAligned="true" style="margin-top: 15px;" />
             <div class="colorSchemeSelector">
                <div class="schemeOption" :class="{selected: colorScheme === 'light'}" @click="colorScheme = 'light'">
                    <FrequencyBox :freq="freqLight" size="small" colorScheme="light" />
                </div>
                <div class="schemeOption" :class="{selected: colorScheme === 'shade'}" @click="colorScheme = 'shade'">
                    <FrequencyBox :freq="freqShade" size="small" colorScheme="shade" />
                </div>
                <div class="schemeOption" :class="{selected: colorScheme === 'dark'}" @click="colorScheme = 'dark'">
                    <FrequencyBox :freq="freqDark" size="small" colorScheme="dark" />
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { ref, onMounted, watch, computed, inject } from 'vue';
import { useToaster } from '../../assets/Toaster';
import { TileData } from '../../models/TileData';
import { DisplayModeRadios } from '../../models/DisplayMode';
import { Frequency, FrequencyType } from '../../models/Frequency';
import { RouteService } from '../../services/RouteService';
import { Route } from '@gak/shared';
import { Airport } from '../../models/Airport';
import { AirportService } from '../../services/AirportService';

import AnyOf from '../../components/shared/AnyOf.vue';
import Separator from '../../components/shared/Separator.vue';
import SeparatorChoice from '../../components/shared/SeparatorChoice.vue';
import Textarea from 'primevue/textarea';
import FrequencyBox from '../shared/FrequencyBox.vue';
import AirportInput from '../shared/AirportInput.vue';

const props = defineProps({
    tileData: { type: TileData, required: true },
    route: { type: Object as () => Route, default: undefined },
});

const emits = defineEmits(['update']);

const tileData = ref<TileData>(props.tileData);
const currentMode = ref(DisplayModeRadios.FreqList);
const expanded = ref(false);
const textData = ref('');
const manualFrequencies = ref<Frequency[]>([]);
const lookupFrequencies = ref<Frequency[]>([]);
const colorScheme = ref('light');
const routeFrequencies = ref<Frequency[]>([]);
const listMode = ref<'cards'|'text'>('cards');
const showAirport = ref(true);
const showTracon = ref(false);
const showNavaids = ref(false);

const localFreqChoices = computed({
    get: () => [
        { label: 'Airport', active: showAirport.value },
        { label: 'TRACon', active: showTracon.value },
        { label: 'Navaids', active: showNavaids.value }
    ],
    set: (val) => {
        showAirport.value = val[0].active;
        showTracon.value = val[1].active;
        showNavaids.value = val[2].active;
    }
});

const isCardsMode = computed({
    get: () => listMode.value === 'cards',
    set: (val: boolean) => listMode.value = val ? 'cards' : 'text'
});

const lookupMode = ref<'airport'|'route'>('airport');
const isAirportLookup = computed({
    get: () => lookupMode.value === 'airport',
    set: (val: boolean) => lookupMode.value = val ? 'airport' : 'route'
});

const toaster = useToaster(useToast());
const isInternalUpdate = ref(false);

const filteredLookupFrequencies = computed(() => {
    return lookupFrequencies.value.filter(f => {
        // Hide if already selected
        if (manualFrequencies.value.some(m => m.value === f.value && m.name === f.name)) return false;

        if (f.type === FrequencyType.navaid) return showNavaids.value;
        if (f.type === FrequencyType.tracon) return showTracon.value;
        return showAirport.value; // Show others (CTAF, Weather, etc.) by default
    });
});

const freqLight = new Frequency('Light', '123.45', FrequencyType.ctaf)
const freqShade = new Frequency('Shade', '123.45', FrequencyType.ctaf)
const freqDark = new Frequency('Dark', '123.45', FrequencyType.ctaf)


const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    if (isInternalUpdate.value) {
        isInternalUpdate.value = false;
        return;
    }
    loadFromTileData(newTileData);
}, { deep: true });

watch([currentMode, textData, colorScheme, listMode], () => {
    emitUpdate();
});

watch(lookupMode, (newMode) => {
    if (newMode === 'route') {
        fetchRouteLookupFrequencies();
    } else {
        lookupFrequencies.value = [];
    }
});

function loadFromTileData(tile: TileData) {
    if (!tile) return;
    const data = tile.data;
    
    // Mode
    if(data && 'mode' in data) {
        currentMode.value = data.mode;
    } else {
        currentMode.value = DisplayModeRadios.FreqList;
    }
    
    // Expanded
    expanded.value = tile.span2;
    
    // List Mode
    if(data && 'listMode' in data) {
        listMode.value = data.listMode;
    } else {
        listMode.value = 'cards';
    }

    // List
    if( data && (Array.isArray(data) || 'list' in data)) {
        let list:Frequency[] = []
        let listData = Array.isArray(data) ? data : data.list;

        listData.forEach( (freq:any) => {
            if(freq instanceof Frequency) {
                list.push( freq)
            } else if( 'target' in freq) { // old format
                 list.push( new Frequency( freq.target, freq.name))
            } else { // import format used in tile data
                list.push( Frequency.copy(freq))
            }
        })
        manualFrequencies.value = list;
        syncTextDataFromManual();
        
        // Color Scheme
        if('colorScheme' in data) colorScheme.value = data.colorScheme
    }
    
    if (currentMode.value === DisplayModeRadios.RouteFrequencies) {
        populateRouteFrequenciesText();
    }
}

function syncTextDataFromManual() {
    textData.value = manualFrequencies.value.map( (f:Frequency) => f.value + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n');
}

async function populateRouteFrequenciesText() {
    const route = props.route;
    const freqs = await RouteService.fetchRouteFrequencies(route);
    routeFrequencies.value = freqs;
    textData.value = freqs.map( (f:Frequency) => f.value + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n');
}

async function fetchRouteLookupFrequencies() {
    const freqs = await RouteService.fetchRouteFrequencies(props.route);
    lookupFrequencies.value = freqs;
}

function loadListFromText() {
    const list:Frequency[] = []
    textData.value.split('\n').forEach( (row) => {
        const [value,name,type] = row.split(',')
        if( value && name) {
            const freq = new Frequency(value, name, Frequency.typeFromString(type))
            list.push(freq)
        }
    })
    return list;
}

function onAirportValid(airport: Airport) {
    lookupFrequencies.value = [];
    if (airport) {
        lookupFrequencies.value = AirportService.getAllFrequencies(airport);
    }
}

function addFrequency(freq:Frequency) {
    manualFrequencies.value.push(freq);
    syncTextDataFromManual();
    emitUpdate();
}

function removeFrequency(index: number) {
    manualFrequencies.value.splice(index, 1);
    syncTextDataFromManual();
    emitUpdate();
}

function emitUpdate() {
     if (listMode.value === 'text') {
         manualFrequencies.value = loadListFromText();
     }
     
     const data = {'mode':currentMode.value, 'list':manualFrequencies.value, 'colorScheme':colorScheme.value, 'listMode':listMode.value};
     
     isInternalUpdate.value = true;
     tileData.value.data = data;
     tileData.value.span2 = expanded.value;
     
     if (tileSettingsUpdate) {
        tileSettingsUpdate(tileData.value);
    }
}

</script>

<style scoped>
.radio-settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 0 10px;
    overflow-x: hidden;
}
.lookup-section {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
}
.lookup-toggles {
    display: flex;
    gap: 5px;
}
.toggle-btn {
    background: #e0e0e0;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
}
.toggle-btn.active {
    background: var(--primary-color, #007bff);
    color: white;
    border-color: var(--primary-color, #007bff);
    font-weight: bold;
}
.toggle-btn:hover {
    background: #d0d0d0;
}
.toggle-btn.active:hover {
    filter: brightness(1.1);
}
.lookup-results {
    margin-bottom: 5px;
    min-height: 85px;
    display: flex;
    flex-direction: column;
}
.lookup-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: gray;
    font-style: italic;
    font-size: 0.9em;
    border: 1px dashed #ccc;
    border-radius: 6px;
}
.freq-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
}
.freq-card-wrapper {
    cursor: pointer;
    transition: transform 0.1s;
}
.freq-card-wrapper:hover {
    transform: scale(1.05);
}
.lookup-card:hover {
    box-shadow: 0 0 5px var(--primary-color, #007bff);
    border-radius: 5px;
}
.lookup-card {
    position: relative;
}
.add-indicator {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--primary-color, #007bff);
    color: white;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    border: 1px solid white;
    opacity: 0;
    transition: opacity 0.2s, transform 0.1s;
}
.lookup-card:hover .add-indicator {
    opacity: 1;
    transform: scale(1.1);
}
.remove-indicator {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #f44336;
    color: white;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    border: 1px solid white;
    opacity: 0;
    transition: opacity 0.2s, transform 0.1s;
}
.freq-card-wrapper:hover .remove-indicator {
    opacity: 1;
    transform: scale(1.1);
}
.edit-cards .freq-card-wrapper:hover {
    opacity: 0.8;
}
.edit-cards .freq-card-wrapper.disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
.edit-cards .freq-card-wrapper.disabled:hover {
    transform: none;
    opacity: 0.6;
}
.empty-list {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: gray;
    font-size: 0.9em;
    font-style: italic;
    border: 1px dashed #ccc;
    border-radius: 6px;
    min-height: 44px;
    width: 100%;
    box-sizing: border-box;
}

.list-editor {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 5px;
}

:deep(.separator), :deep(.separator-choice) {
    margin-top: 15px;
    margin-bottom: 10px;
}
.list {
    resize: none;
    font-size: 13px;
    padding: 5px;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    width: 100%;
    box-sizing: border-box;
}

.colorSchemeSelector {
    display: flex;
    justify-content: center;
}
.schemeOption {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 5px;
    padding: 1px;
    margin: 0 5px;
}
.modeSelector .schemeOption {
    padding: 3px 10px;
    background: #e0e0e0;
    color: #333;
    border: 1px solid #ccc;
}
.modeSelector .schemeOption.selected {
    background: var(--primary-color, #007bff);
    color: white;
    border-color: var(--primary-color, #007bff);
}
.schemeOption.selected {
    border-color: #007bff;
}
.separator {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin: 15px 0 10px 0;
}
.separator :deep(.separator), .separator .label {
    padding-top: 0;
    color: var(--bg-secondary);
    font-weight: bold;
    white-space: nowrap;
    font-size: 0.9rem;
}
</style>
