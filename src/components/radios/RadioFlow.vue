<script setup>
import { onMounted, ref, watch } from 'vue'
import { formatMhz } from '../../assets/data'

import Header from '../shared/Header.vue';
import AirportInput from '../shared/AirportInput.vue'
import FrequencyBox from './FrequencyBox.vue'

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
const knownFrequencies = ref([])
let listBeforeEdit = []
// format use to be {target:"", freq:"", name:""}
// new format is {mhz:123.456, name:'Radio name'}

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
        // build text based of the frequency list
        textData.value = list.map( f => f.mhz + ',' + f.name).join('\n')
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
    frequencies.value.push({mhz:freq.mhz, name:freq.name})
    toast( freq.name + ' added (' + (frequencies.value.length) + '/' + maxFreqCount + ')')
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

function onDone() {
    mode.value='edit'
    knownFrequencies.value = []
    textData.value = frequencies.value.map( f => f.mhz + ',' + f.name).join('\n')
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
    mode.value = 'lookup'
}

/**
 * Builds the list of known frequencies from given airport data
 * @param {*} airport 
 */
function showFrequencies(airport) {
    let list = []
    if( airport) {
        for(let freq of airport.freq) {
            list.push({name:airport.code + ' ' + freq.name,display:freq.name, mhz:freq.mhz,nav:false})
        }
        for(let nav of airport.navaids) {
            list.push({name:nav.id + ' ' + nav.type, display:nav.id,mhz:nav.freq,nav:true})
        }
    }
    knownFrequencies.value = list
}

function toast(message, severity='success') {
    emits( 'toast', { severity: severity, summary: 'Radio Flow', detail: message, life: 2000})
}

</script>

<template>
    <div class="tile">
        <Header :title="'Radio Flow'" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="mode==''">
            <div v-if="frequencies.length==0" class="fullsize"><div>No Radios</div></div>
            <div class="freqList" v-else>
                <FrequencyBox v-for="freq in frequencies" :freq="freq" :small="frequencies.length > 8" />
            </div>
        </div>
        <div v-else-if="mode=='edit'" class="edit">
            <Button icon="pi pi-search" label="Lookup" link
                @click="onLookup"></Button>
            <Textarea class='list' rows="8" cols="24" v-model="textData"
                placeholder="Enter up to 15 freq."></Textarea>
            <div class="actionBar">
                <Button @click="onCancel" label="Cancel" link></Button>
                <Button icon="pi pi-check" @click="onApply" label="Apply"></Button>
            </div>
        </div>
        <div v-else-if="mode=='lookup'" class="lookup">
            <AirportInput :auto="true" @valid="showFrequencies"></AirportInput>
            <div >
                <div v-if="knownFrequencies.length" class="knownFrequencies">
                    <Button v-for="kf in knownFrequencies" :label="kf.display" 
                        :title="formatMhz(kf.mhz) + ',' + kf.name"
                        @click="addFrequency(kf)" :icon="kf.nav?'pi pi-compass':''"></Button>
                </div>
                <div class="" v-else>Enter an airport code to view its known frequencies</div>
            </div>
            <div>
                <Button icon="pi pi-thumbs-up" label="Done" link
                    @click="onDone"></Button> 
            </div>
        </div>
    </div>
</template>

<style scoped>
.fullsize{
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    font-weight: 600;
    font-size: x-large;
    opacity: .3;
    line-height: 200px;
}
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

.edit {
    position: relative;
    height:200px;
    font-size: 0.8rem;
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
