<template>
    <div class="tile">
        <LookupDialog v-model:visible="showLookup" :time="lookupTime" @add="addFrequency" />
        <Header :title="(editMode || mode =='') ? 'Radio Flow' : 'Lost Comms'" :hideReplace="mode!='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div class="tileContent">
            <div v-if="editMode" class="edit">
                <Button icon="pi pi-search" label="Lookup" link
                    @click="onLookup" class="lookupBtn"></Button>
                <Textarea class='list' rows="11" cols="24" v-model="textData"
                    placeholder="Enter up to 15 freq."></Textarea>
                <ActionBar @apply="onApply" @cancel="onCancel" :help="UserUrl.radioFlowTileGuide" />
            </div>
            <div v-else-if="mode=='nordo'" @click="onMainClick" class="nordo">
                <div class="nordoLights">
                    <div>Signal</div>
                    <div class="nordoHeader">Ground</div>
                    <div class="nordoHeader">Air</div>
                    <div class="nordoLine"></div>
                    <div class="lightSteady green">&nbsp;</div>
                    <div><font-awesome-icon :icon="['fas','check']" class="iconClear" />T/O</div>
                    <div><font-awesome-icon :icon="['fas','check']" class="iconClear" />Land</div>
                    <div class="nordoLine"></div>
                    <div class="lightFlashing green"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
                    <div><font-awesome-icon :icon="['fas','check']" class="iconClear" />Taxi</div>
                    <div><font-awesome-icon :icon="['fas','rotate-left']" class="iconReturn" />Land</div>
                    <div class="nordoLine"></div>
                    <div class="lightSteady red">&nbsp;</div>
                    <div>STOP</div>
                    <div>Give Way</div>
                    <div class="nordoLine"></div>
                    <div class="lightFlashing red"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
                    <div>Taxi Off Rwy</div>
                    <div><font-awesome-icon :icon="['fas','times']" class="iconDonot"/> Land</div>
                    <div class="nordoLine"></div>
                    <div class="lightFlashing"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" :class="{'red': (i % 2), 'green': !(i % 2)}" /></div>
                    <div class="nordoCaution">Use Extreme Caution</div>
                    <div class="nordoLine"></div>
                    <div class="lightFlashing white"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
                    <div><font-awesome-icon :icon="['fas','rotate-left']" class="iconReturn" />Start</div>
                    <div>-</div>
                    <div class="nordoLine"></div>
                </div>
                <div class="nordoXpdr">
                    <div><font-awesome-icon :icon="['fas','jet-fighter']" /></div>
                    <div>
                        <font-awesome-icon :icon="['fas','ban']" class="red"/>
                        <font-awesome-icon :icon="['fas','walkie-talkie']"  />
                    </div>
                    <div><font-awesome-icon :icon="['fas','star-of-life']" class="red" /></div>
                    <div>7500</div>
                    <div>7600</div>
                    <div>7700</div>
                </div>
            </div>
            <div v-else class="main" @click="onMainClick">
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
import PlaceHolder from '../shared/PlaceHolder.vue'

import Button from 'primevue/button'
import Textarea from 'primevue/textarea';

const emits = defineEmits(['replace','update','toast'])
const editMode=ref(false)
const maxFreqCount = 18
const mode=ref('')
const textData = ref('')
const frequencies = ref([])
const showLookup = ref(false)
const lookupTime = ref(0)
let listBeforeEdit = []

const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
})

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
    }
}

function onLookup() {
    loadDataFromText()
    showLookup.value = true
    lookupTime.value = Date.now()
    // loadDataFromText()
    // mode.value = 'lookup'
}

function onMainClick() {
    if(mode.value == '') {
        mode.value = 'nordo'
    } else {
        mode.value = ''
    }
}

function toast(message, severity='success') {
    emits( 'toast', { severity: severity, summary: 'Radio Flow', detail: message, life: 2000})
}

function updateTextarea() {
    textData.value = frequencies.value.map( f => Formatter.frequency(f.mhz) + ',' + f.name).join('\n')
}
</script>

<style scoped>
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
.iconClear {
    color: #090;
    padding-right: 3px;
    font-weight: 600;
}
.iconDonot {
    color: #900;
    padding-right: 3px;
    font-weight: 600;
}
.iconReturn {
    padding-right: 3px;
    font-weight: 600;
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
.lightFlashing {
    display: flex;
    justify-content: center;
    gap: 3px;
    padding: 2px;
}
.lightFlashing.green, .lightFlashing > .green {
    color: green;
}
.lightFlashing.red, .lightFlashing > .red {
    color: red;
}
.lightFlashing.white {
    color: white;
    background-color: darkgrey;
}
.lightSteady {
    border-radius: 8px;
    margin: 0 8px;
}
.lightSteady.green {
    background-color: green;
}
.lightSteady.red {
    background-color: red;
}
.list {
    resize: none;
    font-size: 0.8rem;
    padding: 0.2rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
}
.lookup {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
    font-size: 0.8rem
}
.lookupBtn {
    margin: 0 auto;
    margin-top: 5px;
}
.main {
    cursor: pointer;
}
.nordo {
    position: relative;
    cursor: pointer;
    height: 100%;
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
}
.nordoCaution {
    grid-column: 2 / span 2
}
.nordoHeader {
    font-weight: 600;
    text-align: center;
}
.nordoLights {
    display: grid;
    grid-template-columns: 60px 1fr 1fr;
    justify-content: center;
    align-items: center;
}
.nordoLine {
    height: 1px;
    grid-column: 1 / span 3;
    border-bottom: 1px dashed darkgrey;
    padding-top: 5px;
    margin-bottom: 5px;;
}
.nordoXpdr {
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(3, 1fr);
    font-size: 1rem;
}
.edit {
    position: relative;
    width: var(--tile-width);
    height: 100%;
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    padding: 0 5px;
}

.p-button {
    font-size: 0.8rem;
    padding: 4px 8px;
    height: 1.5rem;
}
.red {
    color: red;
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
