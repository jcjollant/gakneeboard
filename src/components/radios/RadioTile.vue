<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <div class="tileContent" :class="{'expanded':expanded}">
            <DisplayModeSelection v-if="displaySelection" :modes="modesList" v-model="displayMode" :expandable="true" :expanded="expanded"
                @expand="onExpand" @keep="displaySelection=false" />
            <VorServiceVolumes v-else-if="displayMode==DisplayModeRadios.ServiceVolumes" />
            <Nordo v-else-if="displayMode==DisplayModeRadios.LostComms" />
            <ImageContent v-else-if="displayMode==DisplayModeRadios.LostCommsIFR" src="lostcomms-ifr.png" /> 
            <div v-else-if="displayMode==DisplayModeRadios.FreqList" class="main">
                <div v-if="listEditMode" class="edit">
                    <div class="lookupList">
                        <Textarea class='list' rows="9" cols="24" v-model="textData"
                            placeholder="Enter up to 15 freq."></Textarea>
                        <Button icon="pi pi-search" title="Frequency Lookup" link
                            @click="onLookup" class="lookupBtn"></Button>
                    </div>
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
                    <ActionBar @apply="onApply" @cancel="onCancel" :help="UserUrl.radioTileGuide" />
                </div>
                <div v-else class="clickable" @click="onEditMode">
                    <PlaceHolder v-if="frequencies.length==0" title="No Radios" subtitle="Click Here to Add Frequencies" />
                    <div v-else class="freqList" :class="[boxColumns()]" >
                        <FrequencyBox v-for="(freq,index) in frequencies" :freq="freq" :size="boxSize()" :class="['freq'+index]" :colorScheme="colorScheme" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeChoice, DisplayModeRadios } from '../../models/DisplayMode';
import { Frequency, FrequencyType } from '../../models/Frequency';
import { UserUrl } from '../../lib/UserUrl';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster'
import { TileData } from '../../models/TileData';
import { TileType } from '../../models/TileType';

import ActionBar from '../shared/ActionBar.vue'
import Button from 'primevue/button'
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import FrequencyBox from '../shared/FrequencyBox.vue'
import ImageContent from '../shared/ImageContent.vue'
import LookupDialog from './LookupDialog.vue'
import Nordo from './Nordo.vue';
import PlaceHolder from '../shared/PlaceHolder.vue'
import Textarea from 'primevue/textarea';
import VorServiceVolumes from './VorServiceVolumes.vue';

const displayMode = ref(DisplayModeRadios.Unknown) // active display mode
const displaySelection = ref(false)
const emits = defineEmits(['replace','update'])
const expanded = ref(false)
const noFreq:Frequency[] = []
const frequencies = ref(noFreq)
const freqLight = new Frequency('Light', '123.45', FrequencyType.ctaf)
const freqShade = new Frequency('Light', '123.45', FrequencyType.ctaf)
const freqDark = new Frequency('Light', '123.45', FrequencyType.ctaf)

let listBeforeEdit:Frequency[] = []
const listEditMode = ref(false) // toggle list into edit mode
const colorScheme = ref('light')
const lookupTime = ref(0)
const maxFreqCount = 15
const modesList = ref([
    new DisplayModeChoice('Frequencies', DisplayModeRadios.FreqList, true),
    new DisplayModeChoice('Lost Comms VFR', DisplayModeRadios.LostComms),
    new DisplayModeChoice('Lost Comms IFR', DisplayModeRadios.LostCommsIFR),
    new DisplayModeChoice('Service Volumes', DisplayModeRadios.ServiceVolumes),
])
const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
    span2 : { type: Boolean, default: false },
})
const showLookup = ref(false)
const textData = ref('')
const toaster = useToaster(useToast())

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadProps(props);
})

watch(displayMode, (newValue, oldValue) => {
    if( newValue != oldValue && displaySelection.value) {
        saveConfig()
    }
    displaySelection.value = false;
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
    if(displaySelection.value) return "Radios Tile Mode";
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
        updateTextarea()

        // restore color scheme
        if('colorScheme' in data) colorScheme.value = data.colorScheme
    } else {
        frequencies.value = []
    }
    // Restore display mode
    if(data && 'mode' in data) {
        displayMode.value = data.mode
    } else if (frequencies.value.length === 0) {
        // Show display mode selection when no content
        displayMode.value = DisplayModeRadios.Unknown
        displaySelection.value = true
    } else { // defaulting to frequency list
        displayMode.value = DisplayModeRadios.FreqList
    }

}

function loadListFromText() {
    const list:Frequency[] = []
    textData.value.split('\n').forEach( (row) => {
        const [value,name,type] = row.split(',')
        // if we have enough values, we make a radio out of it
        if( value && name) {
            const freq = new Frequency(value, name, Frequency.typeFromString(type))
            // console.log('[RadioTile.loadListFromText]',freq)
            list.push(freq)
        }
    })
    loadData(list)
    return list;
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

    // refresh the list
    updateTextarea()
}

// load data from text value
function onApply() {
    frequencies.value = loadListFromText();
    saveConfig()
    // go back to normal mode
    listEditMode.value = false;
}

function onCancel() {
    listEditMode.value = false;
    loadData( listBeforeEdit)
}

function onEditMode() {
    listBeforeEdit = frequencies.value
    listEditMode.value = true
}

function onExpand(newValue:boolean) {
    // console.debug('[RadioTile.onExpand]')
    expanded.value = newValue
    saveConfig()
}

function onLookup() {
    loadListFromText()
    showLookup.value = true
    lookupTime.value = Date.now()
    // loadDataFromText()
    // mode.value = 'lookup'
}

function saveConfig() {
    // console.debug('[RadioTile.saveConfig]')
    const data = {'mode':displayMode.value,'list':frequencies.value, 'colorScheme':colorScheme.value}
    emits('update', new TileData( TileType.radios, data, expanded.value));
}

function updateTextarea() {
    textData.value = frequencies.value.map( (f:Frequency) => f.value + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n')
}
</script>

<style scoped>
.expanded {
    width: var(--tile-width-expanded);
}
.edit {
    position: relative;
    height: var(--tile-content-height);
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    padding: 5px;
    gap: 2px;
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
.br {
    border-right: 1px dashed darkgrey;
}
.bb {
    border-bottom: 1px dashed darkgrey;
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
.list {
    resize: none;
    font-size: 13px;
    padding: 5px;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    width:100%;
    flex-grow: 1;
    white-space: nowrap;
    overflow-x: auto;
}
.lookup {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
    font-size: 0.8rem
}
.lookupBtn {
    position: absolute;
    right: 0;
    top: 0;
    margin: 0 auto;
    margin-top: 5px;
}
.lookupList {
    position: relative
}
.modeChoice {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
}

.p-button {
    font-size: 0.8rem;
    padding: 4px 8px;
    height: 1.5rem;
}
.shortcut {
    padding: 2px;
    font-size: 0.8rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 400;
}
.radioList {
    position: relative;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto auto;
    height: 170px;
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
