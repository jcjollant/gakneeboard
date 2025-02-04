<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <div class="tileContent" :class="{'expanded':expanded}">
            <DisplayModeSelection v-if="displaySelection" :modes="modesList" v-model="displayMode"
                @selection="onChangeMode" />
            <ServiceVolumes v-else-if="displayMode==DisplayModeRadios.ServiceVolumes" v-model="serviceVolume"/>
            <Nordo v-else-if="displayMode==DisplayModeRadios.LostComms" />
            <div v-else-if="displayMode==DisplayModeRadios.FreqList" class="main">
                <div v-if="listEditMode" class="edit">
                    <div class="lookupList">
                        <Textarea class='list' rows="12" cols="24" v-model="textData"
                            placeholder="Enter up to 15 freq."></Textarea>
                        <Button icon="pi pi-search" title="Frequency Lookup" link
                            @click="onLookup" class="lookupBtn"></Button>
                    </div>
                    <ActionBar @apply="onApply" @cancel="onCancel" :help="UserUrl.radioFlowTileGuide" />
                </div>
                <div v-else class="clickable" @click="onEditMode">
                    <PlaceHolder v-if="frequencies.length==0" title="No Radios" subtitle="Click Here to Add Frequencies" />
                    <div v-else class="freqList" :class="{small:isSmall()}" >
                        <FrequencyBox v-for="freq in frequencies" :freq="freq" :small="isSmall()" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeRadios } from '../../model/DisplayMode';
import { Frequency, FrequencyType } from '../../model/Frequency';
import { Formatter } from '../../lib/Formatter'
import { ServiceVolume} from '../../model/ServiceVolume'
import { UserUrl } from '../../lib/UserUrl';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster'

import ActionBar from '../shared/ActionBar.vue'
import Button from 'primevue/button'
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import FrequencyBox from '../shared/FrequencyBox.vue'
import LookupDialog from './LookupDialog.vue'
import Nordo from './Nordo.vue';
import PlaceHolder from '../shared/PlaceHolder.vue'
import Textarea from 'primevue/textarea';
import ServiceVolumes from './ServiceVolumes.vue';

const displayMode = ref('') // active display mode
const displaySelection = ref(false)
const emits = defineEmits(['replace','update'])
const expanded = ref(false)
const noFreq:Frequency[] = []
const frequencies = ref(noFreq)
let listBeforeEdit:Frequency[] = []
const listEditMode = ref(false) // toggle list into edit mode
const lookupTime = ref(0)
const maxFreqCountLarge = 8
const maxFreqCount = 15
const modesList = ref([
    {label:'Frequencies', value:DisplayModeRadios.FreqList},
    {label:'Lost Comms', value:DisplayModeRadios.LostComms},
    {label:'VOR Service Volumes', value:DisplayModeRadios.ServiceVolumes},
])
const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
    span2 : { type: Boolean, default: false },
})
const serviceVolume=ref(ServiceVolume.Terminal)
const showLookup = ref(false)
const textData = ref('')
const toaster = useToaster(useToast())

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadProps(props);
})

watch( props, async() => {
    // console.log('Radio watch ' + JSON.stringify(props.params))
    loadProps(props);
})

watch( serviceVolume, () => {
    // console.log('[RadioTile.watch] serviceVolume changed', serviceVolume.value)
    emitUpdate()
})

function emitUpdate() {
    emits('update',{'mode':displayMode.value,'list':frequencies.value,'sv':serviceVolume});
}

function getTitle() {
    if(displaySelection.value) return "Radios Tile Mode";
    switch(displayMode.value) {
        case DisplayModeRadios.LostComms: return 'Lost Comms';
        case DisplayModeRadios.ServiceVolumes: return 'VOR Service Volumes';
        default: return 'Radios';
    }
}

function isSmall() {
    // console.log('[RadioTile.isSmall]', frequencies.value.length, expanded.value)
    return frequencies.value.length > maxFreqCountLarge * (expanded.value ? 2 : 1)
}

function loadData(data:any) {
    // console.log('[RadioTile.loadData]', JSON.stringify(data))
    if( data && (Array.isArray(data) || 'list' in data)) {
        let list:Frequency[] = []
        // old format, all data is the actual list
        // new format, list is in data.list
        let listData = Array.isArray(data) ? data : data.list;

        listData.forEach( (freq:any) => {
            if( 'target' in freq) { // old format
                // turn freq into mhz, keep name. Target is lost
                list.push( new Frequency( Number(freq.target), freq.name))
            } else {
                list.push( Frequency.copy(freq))
            }
        })
        // console.log('[RadioTile.loadData] list', list)
        frequencies.value = list
        updateTextarea()

        // restote service volume
        if('sv' in data) serviceVolume.value = data.sv
    } else {
        frequencies.value = []
    }
    // Restore display mode
    if(data && 'mode' in data) {
        displayMode.value = data.mode
    } else {
        displayMode.value = DisplayModeRadios.FreqList
    }

}

function loadListFromText() {
    const list:Frequency[] = []
    textData.value.split('\n').forEach( (row) => {
        const [mhz,name,type] = row.split(',')
        // if we have enough values, we make a radio out of it
        if( mhz && name) {
            const freq = new Frequency(Number(mhz), name, Frequency.typeFromString(type))
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

function addFrequency(freq:any) {
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
    emitUpdate()
    // go back to normal mode
    listEditMode.value = false;
}

function onCancel() {
    listEditMode.value = false;
    loadData( listBeforeEdit)
}

function onChangeMode(mode) {
    // console.log('onChangeMode', mode)
    displayMode.value = mode
    displaySelection.value = false;
    emitUpdate()
}

function onEditMode() {
    listBeforeEdit = frequencies.value
    listEditMode.value = true
}

function onLookup() {
    loadListFromText()
    showLookup.value = true
    lookupTime.value = Date.now()
    // loadDataFromText()
    // mode.value = 'lookup'
}

function updateTextarea() {
    textData.value = frequencies.value.map( (f:Frequency) => Formatter.frequency(f.mhz) + ',' + f.name + ',' + Frequency.typeToString(f.type)).join('\n')
}
</script>

<style scoped>
.expanded {
    width: calc( var(--page-width) - 2px)
}
.edit {
    position: relative;
    height: var(--tile-content-height);
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    padding: 5px;
    gap: 5px;
}
.freqList {
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    overflow: hidden;
}
.freqList.small {
    display: flex;
    flex-wrap: wrap;
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
    height: 203px;
}
</style>
