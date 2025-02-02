<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <div class="tileContent">
            <DisplayModeSelection v-if="displaySelection" :modes="modesList" v-model="displayMode"
                @selection="onChangeMode" />
            <ServiceVolumes v-else-if="displayMode==DisplayMode.ServiceVolumes" v-model="serviceVolume"/>
            <Nordo v-else-if="displayMode==DisplayMode.LostComms" />
            <div v-else-if="displayMode==DisplayMode.FreqList" class="main">
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
                    <div v-else class="freqList" :class="{small:frequencies.length > 8}" >
                        <FrequencyBox v-for="freq in frequencies" :freq="freq" :small="frequencies.length > 8" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Frequency } from '../../model/Frequency';
import { Formatter } from '../../lib/Formatter'
import { onMounted, ref, watch } from 'vue'
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
import { FrequencyType } from '../../model/FrequencyType';

const DisplayMode = Object.freeze ({
    FreqList : '',
    LostComms : 'nordo',
    ServiceVolumes : 'sv',
})
const displaySelection = ref(false)
const emits = defineEmits(['replace','update'])
const listEditMode=ref(false) // toggle list into edit mode
const maxFreqCount = 18
const displayMode=ref('') // active display mode
const textData = ref('')
const toaster = useToaster(useToast())
const noFreq:Frequency[] = []
const frequencies = ref(noFreq)
const showLookup = ref(false)
const lookupTime = ref(0)
let listBeforeEdit:Frequency[] = []
const modesList = ref([
    {label:'Frequencies', value:DisplayMode.FreqList},
    {label:'Lost Comms', value:DisplayMode.LostComms},
    {label:'VOR Service Volumes', value:DisplayMode.ServiceVolumes},
])
const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
})
const serviceVolume=ref(ServiceVolume.Terminal)

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadData(props.params);
})

watch( props, async() => {
    // console.log('Radio watch ' + JSON.stringify(props.params))
    loadData(props.params);
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
        case DisplayMode.LostComms: return 'Lost Comms';
        case DisplayMode.ServiceVolumes: return 'VOR Service Volumes';
        default: return 'Radios';
    }
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

        // Restore display mode
        if('mode' in data) displayMode.value = data.mode

        // restote service volume
        if('sv' in data) serviceVolume.value = data.sv
    } else {
        frequencies.value = []
    }
}

function loadListFromText() {
    const list:Frequency[] = []
    textData.value.split('\n').forEach( (row) => {
        const [mhz,name] = row.split(',')
        // if we have enough values, we make a radio out of it
        // there is an upper limit at 15
        if( list.length < maxFreqCount && mhz && name) {
            const freq = new Frequency(Number(mhz), name)
            list.push(freq)
        }
    })
    loadData(list)
    return list;
}

function addFrequency(freq:any) {
    if( frequencies.value.length >= maxFreqCount) {
        toaster.warning('Radio Flow', 'Radio boxes are full')
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
    textData.value = frequencies.value.map( (f:Frequency) => Formatter.frequency(f.mhz) + ',' + f.name).join('\n')
}
</script>

<style scoped>
.edit {
    position: relative;
    width: var(--tile-width);
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
    /* justify-content: center; */
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
    /* border: 1px solid red; */
}

</style>
