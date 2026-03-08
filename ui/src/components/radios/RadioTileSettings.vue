<template>
    <div class="radio-settings">

        <div>
            <Separator :name="currentMode === DisplayModeRadios.RouteFrequencies ? 'Route Frequencies' : 'Frequency List'" :leftAligned="true" />
            <div class="list-editor">
                <Textarea class='list' rows="15" cols="24" v-model="textData"
                            :disabled="currentMode !== DisplayModeRadios.FreqList"
                            placeholder="Format: Value,Name,Type&#10;Ex: 123.45, KABC Twr, Tower"></Textarea>
                <Button icon="pi pi-search" title="Frequency Lookup" link
                            :disabled="currentMode !== DisplayModeRadios.FreqList"
                            @click="showLookup = true" class="lookupBtn"></Button>
            </div>
            
            <Separator name="Color Scheme" :leftAligned="true" style="margin-top: 5px;" />
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
        
         <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />

    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { ref, onMounted, watch, computed, inject } from 'vue';
import { useToaster } from '../../assets/Toaster';
import { TileData } from '../../models/TileData';
import { DisplayModeRadios } from '../../models/DisplayMode';
import { Frequency, FrequencyType } from '../../models/Frequency';
import { RadioTileConfig } from './RadioTileConfig';
import { RouteService } from '../../services/RouteService';
import { Route } from '@gak/shared';


import Separator from '../../components/shared/Separator.vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import FrequencyBox from '../shared/FrequencyBox.vue';
import LookupDialog from './LookupDialog.vue';

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
const colorScheme = ref('light');
const showLookup = ref(false);
const lookupTime = ref(0);
const toaster = useToaster(useToast());
const isInternalUpdate = ref(false);

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

watch([currentMode, textData, colorScheme], () => {
    emitUpdate();
});

watch(currentMode, (newMode) => {
    if (newMode === DisplayModeRadios.RouteFrequencies) {
        populateRouteFrequenciesText();
    } else if (newMode === DisplayModeRadios.FreqList) {
        syncTextDataFromManual();
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
        if (currentMode.value === DisplayModeRadios.FreqList) {
            syncTextDataFromManual();
        }
        
        // Color Scheme
        if('colorScheme' in data) colorScheme.value = data.colorScheme
    }
    
    // If it's RouteFrequencies but the list is empty (which happens since it's dynamically generated),
    // let's fetch it for preview in textData or just keep the textarea hidden.
    // The user hid textData for RouteFrequencies in the template, so we don't need to populate textData for RouteFrequencies,
    // wait, the user modified RadioTileSettings.vue to show list-editor for EVERY mode!
    // "<div> <Separator name="Frequency List" ... <Textarea class='list' "
    // Ah, if they want to see the RouteFrequencies IN the text area to preview them:
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
    textData.value = freqs.map( (f:Frequency) => f.value + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n');
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

function addFrequency(freq:Frequency) {
    // Append to text area
    const newLine = freq.value + ',' + freq.name + ',' + Frequency.typeToString(freq.type)
    if(textData.value.length > 0) {
        textData.value += '\n' + newLine
    } else {
        textData.value = newLine
    }
    toaster.success('Radio Settings', freq.name + ' added')
}

function emitUpdate() {
     if (currentMode.value === DisplayModeRadios.FreqList) {
         manualFrequencies.value = loadListFromText();
     }
     const data = {'mode':currentMode.value,'list':manualFrequencies.value, 'colorScheme':colorScheme.value}
     
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
    padding: 0 4px;
}
.list-editor {
    position: relative;
    display: flex;
    flex-direction: column;
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
.lookupBtn {
    position: absolute;
    right: 0;
    top: 0;
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
}
.schemeOption.selected {
    border-color: #007bff;
}
</style>
