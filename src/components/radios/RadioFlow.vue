<script setup>
import { onMounted, ref, watch } from 'vue'
import { urlGuideRadioFlow } from '../../assets/data'
import { Formatter } from '../../assets/Formatter'

import ActionBar from '../shared/ActionBar.vue'
import Header from '../shared/Header.vue';
import FrequencyBox from './FrequencyBox.vue'
import LookupDialog from './LookupDialog.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'

import Button from 'primevue/button'
import Textarea from 'primevue/textarea';

const emits = defineEmits(['replace','update','toast'])
const maxFreqCount = 15

const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
})

const mode=ref('')
const textData = ref('')
const frequencies = ref([])
const showLookup = ref(false)
const lookupTime = ref(0)
let listBeforeEdit = []

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadData(props.params);
})

watch( props, async() => {
    // console.log('RadioFlow watch ' + JSON.stringify(props.params))
    loadData(props.params);
})


function loadData(data) {
    // console.log('[RadioFlow.loadData]', JSON.stringify(data))
    if( data && Array.isArray(data)) {
        let list = []
        data.forEach( (freq) => {
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

function loadDataFromText() {
    const data = []
    textData.value.split('\n').forEach( (row) => {
        const [mhz,name] = row.split(',')
        // if we have enough values, we make a radio out of it
        // ther is an upper limit at 15
        if( mhz && name && data.length < maxFreqCount) {
            const freq = {mhz:mhz,name:name}
            data.push(freq)
        }
    })
    loadData(data)
    return data;
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
    const data = loadDataFromText();
    emits('update',data);
    // go back to normal mode
    mode.value = ''
}

function onCancel() {
    mode.value = ''
    loadData( listBeforeEdit, false)
}

function onHeaderClick() {
    // console.log('onHeaderClick ' + mode.value)
    if( mode.value == 'edit') {
        mode.value = ''
    } else {
        mode.value = 'edit'
        listBeforeEdit = frequencies.value
    }
}

function onLookup() {
    loadDataFromText()
    showLookup.value = true
    lookupTime.value = Date.now()
    // loadDataFromText()
    // mode.value = 'lookup'
}

function toast(message, severity='success') {
    emits( 'toast', { severity: severity, summary: 'Radio Flow', detail: message, life: 2000})
}

function updateTextarea() {
    textData.value = frequencies.value.map( f => Formatter.frequency(f.mhz) + ',' + f.name).join('\n')
}
</script>

<template>
    <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
    <div class="tile">
        <Header :title="'Radio Flow'" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="mode==''">
            <PlaceHolder v-if="frequencies.length==0" title="No Radios" />
            <div class="freqList" v-else>
                <FrequencyBox v-for="freq in frequencies" :freq="freq" :small="frequencies.length > 8" />
            </div>
        </div>
        <div v-else-if="mode=='edit'" class="edit">
            <Button icon="pi pi-search" label="Lookup" link
                @click="onLookup" class="lookupBtn"></Button>
            <Textarea class='list' rows="9" cols="24" v-model="textData"
                placeholder="Enter up to 15 freq."></Textarea>
            <ActionBar @apply="onApply" @cancel="onCancel" :help="urlGuideRadioFlow" />
        </div>
    </div>
</template>

<style scoped>
.freqList {
    padding-top: 5px;
    display: flex;
    gap: 5px;
    flex-flow: wrap;
    justify-content: center;
}
.radioList {
    position: relative;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto auto;
    height: 203px;
    /* border: 1px solid red; */
}
.br {
    border-right: 1px dashed darkgrey;
}
.bb {
    border-bottom: 1px dashed darkgrey;
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
}

.lookupBtn {
    margin: 0 auto;
    margin-top: 5px;
}

.edit {
    position: relative;
    height:200px;
    width:240px;
    font-size: 0.8rem;
    display: inline-flex;
    flex-flow: column;
    /* gap: 5px; */
    padding: 0 5px;
}

.p-button {
    font-size: 0.8rem;
    padding: 4px 8px;
    height: 1.5rem;
}

.helpers {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 5px 0 2px 0;
}
.shortcut {
    padding: 2px;
    font-size: 0.8rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 400;
}
.lookup {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
    font-size: 0.8rem
}
.knownFrequencies {
    display: flex;
    gap:5px;
    flex-flow: wrap;
    align-content: flex-start;
    height: 125px;
    overflow: auto;
}
.counter {
    font-size: 0.9rem;
}
</style>
