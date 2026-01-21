<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="getTitle()" :showReplace="displaySelection" :leftButton="'settings'"
            @replace="emits('replace')" @settings="emits('settings')"></Header>
        <div class="tileContent" :class="{'expanded':expanded}">
            <VorServiceVolumes v-if="displayMode==DisplayModeRadios.ServiceVolumes" />
            <Nordo v-else-if="displayMode==DisplayModeRadios.LostComms" />
            <ImageContent v-else-if="displayMode==DisplayModeRadios.LostCommsIFR" src="lostcomms-ifr.png" /> 
            <div v-else-if="displayMode==DisplayModeRadios.FreqList" class="main">
                 <div>
                    <PlaceHolder v-if="frequencies.length==0" title="No Radios" />
                    <div v-else class="freqList" :class="[boxColumns()]" >
                        <FrequencyBox v-for="(freq,index) in frequencies" :freq="freq" :size="boxSize()" :class="['freq'+index]" :colorScheme="colorScheme" />
                    </div>
                </div>
            </div>
             <div v-else class="main">
                 <!-- Fallback/Unknown mode -->
                <PlaceHolder title="Radios" subtitle="Configure in Settings" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useToaster } from '../../assets/Toaster';
import { DisplayModeRadios } from '../../models/DisplayMode';
import { Frequency } from '../../models/Frequency';
import { TileData } from '../../models/TileData';
import { TileType } from '../../models/TileType';

import FrequencyBox from '../shared/FrequencyBox.vue';
import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import PlaceHolder from '../shared/PlaceHolder.vue';
import LookupDialog from './LookupDialog.vue';
import Nordo from './Nordo.vue';
import VorServiceVolumes from './VorServiceVolumes.vue';

const displayMode = ref(DisplayModeRadios.FreqList) // active display mode
const displaySelection = ref(false) // Keeping this as prop for Header for now, but logic might change
const emits = defineEmits(['replace','update', 'settings'])
const expanded = ref(false)
const noFreq:Frequency[] = []
const frequencies = ref(noFreq)

const colorScheme = ref('light')
const lookupTime = ref(0)
const maxFreqCount = 15

const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
    span2 : { type: Boolean, default: false },
})
const showLookup = ref(false)
const toaster = useToaster(useToast())

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadProps(props);
})

watch( props, async() => {
    // console.log('Radio watch ' + JSON.stringify(props.params))
    loadProps(props);
})

function boxColumns() {
    if( expanded.value) {
        if(frequencies.value.length <= 8) return 'two';
        if(frequencies.value.length <= 16) return 'four';
        return 'six';
    } else {
        if(frequencies.value.length <= 4) return 'one';
        if(frequencies.value.length <= 8) return 'two';
        return 'three';
    }
}
function boxSize() {
    if( expanded.value) {
        if(frequencies.value.length <= 8) return 'large';
        if(frequencies.value.length <= 16) return 'medium';
        return 'small';
    } else {
        if(frequencies.value.length <= 4) return 'large';
        if(frequencies.value.length <= 8) return 'medium';
        return 'small';
    }
}

function getTitle() {
    switch(displayMode.value) {
        case DisplayModeRadios.LostComms: return 'Lost Comms VFR';
        case DisplayModeRadios.LostCommsIFR: return 'Lost Comms IFR';
        case DisplayModeRadios.ServiceVolumes: return 'Service Volumes';
        default: return 'Radios';
    }
}

function loadData(data:any) {
    // console.log('[RadioTile.loadData]', data)
    if( data && (Array.isArray(data) || 'list' in data)) {
        let list:Frequency[] = []
        // old format, all data is the actual list
        // new format, list is in data.list
        let listData = Array.isArray(data) ? data : data.list;

        listData.forEach( (freq:any) => {
            if(freq instanceof Frequency) {
                list.push( freq)
            } else if( 'target' in freq) { // old format
                // turn freq into mhz, keep name. Target is lost
                list.push( new Frequency( freq.target, freq.name))
            } else { // import format used in tile data
                list.push( Frequency.copy(freq))
            }
        })
        // console.log('[RadioTile.loadData] list', list)
        frequencies.value = list

        // restore color scheme
        if('colorScheme' in data) colorScheme.value = data.colorScheme
    } else {
        frequencies.value = []
    }
    // Restore display mode
    if(data && 'mode' in data) {
        displayMode.value = data.mode
    } else { // defaulting to frequency list
        displayMode.value = DisplayModeRadios.FreqList
    }

}


function loadProps(props:any) {
    loadData(props.params)
    expanded.value = props.span2 || false;
}

function addFrequency(freq:Frequency) {
    // do we have room for more frequencies
    if( frequencies.value.length >= maxFreqCount * ( expanded.value ? 2 : 1)) {
        toaster.error('Radio Flow', 'Radio boxes are full')
        return;
    }
    frequencies.value.push(Frequency.copy(freq))
    toaster.success( 'Radio Flow', freq.name + ' added (' + (frequencies.value.length) + '/' + maxFreqCount + ')')

    saveConfig()
}


function saveConfig() {
    // console.debug('[RadioTile.saveConfig]')
    const data = {'mode':displayMode.value,'list':frequencies.value, 'colorScheme':colorScheme.value}
    emits('update', new TileData( TileType.radios, data, expanded.value));
}

</script>

<style scoped>
.expanded {
    width: var(--tile-width-expanded);
}
.freqList {
    padding: 5px;
    display: grid;
    gap: 5px;
    overflow: hidden;
    grid-template-columns: 1fr 1fr;
}
.freqList.one {
    grid-template-columns: 1fr;
}
.freqList.three {
    padding: 3px;
    gap: 3px;
    grid-template-columns: repeat(3, 1fr);
    place-items: center;
}
.freqList.four {
    grid-template-columns: repeat(4, 1fr);
}
.freqList.six {
    grid-template-columns: repeat(6, 1fr);
}

.knownFrequencies {
    display: flex;
    gap:5px;
    flex-flow: wrap;
    align-content: flex-start;
    height: 125px;
    overflow: auto;
}

.label {
    font-size: 0.8rem;
    text-align: center;
}

.lookup {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
    font-size: 0.8rem
}
</style>
