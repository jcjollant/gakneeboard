<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="(editMode || mode =='') ? 'Radios' : 'Lost Comms'" :hideReplace="mode!='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div class="tileContent">
            <div v-if="editMode" class="edit">
                <div class="modeChoice">
                    <div class="miniHeader" >Display</div>
                    <OneChoice v-model="modeChoice" :choices="displayModes" style="line-height: 9px;" />
                </div>
                <div class="lookupList">
                    <Textarea class='list' rows="11" cols="24" v-model="textData"
                        placeholder="Enter up to 15 freq."></Textarea>
                    <Button icon="pi pi-search" title="Frequency Lookup" link
                        @click="onLookup" class="lookupBtn"></Button>
                </div>
                <ActionBar @apply="onApply" @cancel="onCancel" :help="UserUrl.radioFlowTileGuide" />
            </div>
            <Nordo v-else-if="mode=='nordo'"  />
            <div v-else class="main">
                <PlaceHolder v-if="frequencies.length==0" title="No Radios" />
                <div class="freqList" :class="{small:frequencies.length > 8}" v-else>
                    <FrequencyBox v-for="freq in frequencies" :freq="freq" :small="frequencies.length > 8" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Formatter } from '../../assets/Formatter'
import { UserUrl } from '../../lib/UserUrl';

import ActionBar from '../shared/ActionBar.vue'
import Header from '../shared/Header.vue';
import FrequencyBox from './FrequencyBox.vue'
import LookupDialog from './LookupDialog.vue'
import OneChoice from '../shared/OneChoice.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'

import Button from 'primevue/button'
import Textarea from 'primevue/textarea';
import Nordo from './Nordo.vue';

const emits = defineEmits(['replace','update','toast'])
const editMode=ref(false)
const maxFreqCount = 18
const mode=ref('')
const textData = ref('')
const frequencies = ref([])
const showLookup = ref(false)
const lookupTime = ref(0)
let listBeforeEdit = []
const displayModes = [
    {value:'', label:'Freq. List'},
    {value:'nordo', label:'Lost Comms'},
]
const modeChoice = ref(displayModes[0])
const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
})

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadData(props.params);
})

watch( props, async() => {
    // console.log('Radio watch ' + JSON.stringify(props.params))
    loadData(props.params);
})


function loadData(data) {
    // console.log('[RadioTile.loadData]', JSON.stringify(data))
    if( data && (Array.isArray(data) || 'list' in data)) {
        let list = []
        // old format, all data is the actual list
        // new format, list is in data.list
        let listData = Array.isArray(data) ? data : data.list;

        // new format has mode
        if('mode' in data) mode.value = data.mode

        listData.forEach( (freq) => {
            if( 'target' in freq) { // old format
                // turn freq into mhz, keep name. Target is lost
                list.push( {mhz:Number(freq.freq),name:freq.name})
            } else {
                list.push(freq)
            }
        })
        frequencies.value = list
        updateTextarea()
    } else {
        frequencies.value = []
    }
}

function loadListFromText() {
    const list = []
    textData.value.split('\n').forEach( (row) => {
        const [mhz,name] = row.split(',')
        // if we have enough values, we make a radio out of it
        // ther is an upper limit at 15
        if( mhz && name && list.length < maxFreqCount) {
            const freq = {mhz:mhz,name:name}
            list.push(freq)
        }
    })
    loadData(list)
    return list;
}

function addFrequency(freq) {
    if( frequencies.value.length >= maxFreqCount) {
        toast('Radio boxes are full', 'warn')
        return;
    }
    frequencies.value.push(freq)
    toast( freq.name + ' added (' + (frequencies.value.length) + '/' + maxFreqCount + ')')

    // refresh the list
    updateTextarea()
}

// load data from text value
function onApply() {
    // console.log( 'onApply ' + textData.value)
    const list = loadListFromText();
    mode.value = displayModes.find( (m) => m.value == modeChoice.value.value).value
    emits('update',{'mode':mode.value,'list':list});
    // go back to normal mode
    editMode.value = false;
}

function onCancel() {
    editMode.value = false;
    loadData( listBeforeEdit, false)
}

function onHeaderClick() {
    // console.log('onHeaderClick ' + mode.value)
    editMode.value = !editMode.value;
    if( editMode.value) {
        listBeforeEdit = frequencies.value
        modeChoice.value = displayModes.find( (m) => m.value == mode.value)
    } 
}

function onLookup() {
    loadListFromText()
    showLookup.value = true
    lookupTime.value = Date.now()
    // loadDataFromText()
    // mode.value = 'lookup'
}

// function onMainClick() {
//     if(mode.value == '') {
//         mode.value = 'nordo'
//     } else {
//         mode.value = ''
//     }
// }

function toast(message, severity='success') {
    emits( 'toast', { severity: severity, summary: 'Radio Flow', detail: message, life: 2000})
}

function updateTextarea() {
    textData.value = frequencies.value.map( f => Formatter.frequency(f.mhz) + ',' + f.name).join('\n')
}
</script>

<style scoped>
.edit {
    position: relative;
    width: var(--tile-width);
    height: 100%;
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    padding: 5px;
    gap: 5px;
}
.freqList {
    padding: 5px;
    display: grid;
    grid-template-columns: auto auto;
    gap: 5px;
    /* justify-content: center; */
    overflow: hidden;
}
.freqList.small {
    grid-template-columns: auto auto auto;

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
    font-size: 0.8rem;
    padding: 0.2rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    width:100%;
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

/* .main {
    cursor: pointer;
} */
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

/* .helpers {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 5px 0 2px 0;
} */
.shortcut {
    padding: 2px;
    font-size: 0.8rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 400;
}
/* .counter {
    font-size: 0.9rem;
} */
.radioList {
    position: relative;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto auto;
    height: 203px;
    /* border: 1px solid red; */
}

</style>
