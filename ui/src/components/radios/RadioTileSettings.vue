<template>
    <div class="radio-settings">
        <!-- Display Mode Section -->
        <Separator name="Display" class="separator" />
        <div class="display-mode-selector">
            <OneChoice :choices="modeChoices" v-model="selectedModeChoice" :thinpad="true" />
             <EitherOr either="Normal" or="Wide" v-model="isNormal" />
        </div>

        <div v-if="currentMode === DisplayModeRadios.FreqList">
            <Separator name="Frequency List" />
            <div class="list-editor">
                 <Textarea class='list' rows="9" cols="24" v-model="textData"
                            placeholder="Enter up to 15 freq."></Textarea>
                 <Button icon="pi pi-search" title="Frequency Lookup" link
                            @click="showLookup = true" class="lookupBtn"></Button>
            </div>
            
            <Separator name="Color Scheme" />
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
import { ref, onMounted, watch, computed, inject } from 'vue';
import { TileData } from '../../models/TileData';
import { DisplayModeRadios, DisplayModeChoice } from '../../models/DisplayMode';
import { Frequency, FrequencyType } from '../../models/Frequency';
import { OneChoiceValue } from '../../models/OneChoiceValue';

import Separator from '../../components/shared/Separator.vue';
import OneChoice from '../shared/OneChoice.vue';
import EitherOr from '../shared/EitherOr.vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import FrequencyBox from '../shared/FrequencyBox.vue';
import LookupDialog from './LookupDialog.vue';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

const emits = defineEmits(['update']);

const tileData = ref<TileData>(props.tileData);
const currentMode = ref(DisplayModeRadios.FreqList);
const expanded = ref(false);
const textData = ref('');
const colorScheme = ref('light');
const showLookup = ref(false);
const lookupTime = ref(0);

const freqLight = new Frequency('Light', '123.45', FrequencyType.ctaf)
const freqShade = new Frequency('Shade', '123.45', FrequencyType.ctaf)
const freqDark = new Frequency('Dark', '123.45', FrequencyType.ctaf)

const modesList = ref([
    new DisplayModeChoice('Frequencies', DisplayModeRadios.FreqList, true),
    new DisplayModeChoice('Lost Comms VFR', DisplayModeRadios.LostComms),
    new DisplayModeChoice('Lost Comms IFR', DisplayModeRadios.LostCommsIFR),
    new DisplayModeChoice('Service Volumes', DisplayModeRadios.ServiceVolumes),
])

const modeChoices = computed(() => {
    return modesList.value.map(m => new OneChoiceValue(m.label, m.value, m.description));
})

const selectedModeChoice = computed({
    get: () => modeChoices.value.find(c => c.value === currentMode.value),
    set: (val) => { 
        if(val) currentMode.value = val.value as DisplayModeRadios 
    }
})

const isNormal = computed({
    get: () => !expanded.value,
    set: (val) => { expanded.value = !val; emitUpdate(); }
})

const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

watch([currentMode, textData, colorScheme], () => {
    emitUpdate();
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
        textData.value = list.map( (f:Frequency) => f.value + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n')
        
        // Color Scheme
         if('colorScheme' in data) colorScheme.value = data.colorScheme
    }
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
}

function emitUpdate() {
     const list = loadListFromText();
     const data = {'mode':currentMode.value,'list':list, 'colorScheme':colorScheme.value}
     
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
}
.display-mode-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    align-items: center;
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
    width:100%;
}
.lookupBtn {
    position: absolute;
    right: 0;
    top: 0;
}
.colorSchemeSelector {
    display: flex;
    gap: 1px;
    justify-content: center;
    padding: 2px 0;
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
