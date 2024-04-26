<script setup>

import {ref, onMounted, watch} from 'vue';
import WidgetTitle from './WidgetTitle.vue'
import Runway from './Runway.vue'
import * as data from '../assets/data.js'

const emits = defineEmits(['reset'])


var currentAirport
var currentRwyIndex;
const props = defineProps({
    params: { type: Object, default: null},
    mode: { type: String, default: ''}  // used for edit mode
})

const mode = ref('')
const title = ref('')
const weatherFreq = ref()
const weatherType = ref()
const trafficFreq = ref()
const trafficType = ref()
const elevation = ref()
const tpa = ref()
const runwayCount = ref(0)
const airportCode = ref() // used during edit mode
const rwys = ref([]) // used during runway selection
const selectedRunway = ref(null)

function cycleRunway() {
    // console.log( "cycleRunway rwy Count " + runwayCount.value);
    if( runwayCount.value < 1) return;

    const newIndex = (currentRwyIndex + 1) % currentAirport.rwy.length;
    // console.log('Cycling runway to ' + newIndex)
    showRunway(newIndex);
}

function editMode() {
    title.value = 'Airport'
    mode.value = 'edit'
}

function resetWidget() {
    emits('reset');
}

// gets invoked as airport code it typed into the input field
function onCodeUpdate() {
    // console.log(airportCode.value)
    const code = airportCode.value.toLowerCase();
    if( code in data.airports) {
        rwys.value = data.airports[code].rwy
        currentAirport = data.airports[code]
    } else { // reset runways list
        rwys.value = [];
    }
}

function loadAirportByCode(code) {
    const airport = data.airports[code];
    if( airport != undefined && 'rwy' in airport) {
        showAirport(airport)
        showRunway(airport.rwy.findIndex((rwy) => rwy.name == props.params.rwy));
    } else {
        editMode()
    }
}

// add initialization code 
onMounted(() => {   
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadAirportByCode(props.params.code)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    mode.value = props.mode;
    if(props.mode == 'edit') {
        editMode()
    } else {
        loadAirportByCode(props.params.code)
    }
})

function selectRunway(index) {
    mode.value = '';
    showAirport(currentAirport)
    showRunway(index);
}

function showAirport( airport) {
    // console.log( "Showing airport " + JSON.stringify(airport))
    if( airport == null) {
        console.log( 'Airport data missing')
        mode.value = 'edit';
        return
    }
    currentAirport = airport;
    runwayCount.value = airport.rwy.length
    airportCode.value = airport.airportCode
    rwys.value = airport.rwy;
    
    title.value = airport.airportCode + ' : ' + airport.airportName
    weatherFreq.value = airport.weather.freq
    weatherType.value = airport.weather.type
    // If traffic is runway specific, it will be overriden by showRunway
    trafficFreq.value = airport.traffic.freq
    trafficType.value = airport.traffic.type
    elevation.value = airport.elev;
    tpa.value = airport.tpa;
}
// Show a runway from its index in the airport
function showRunway(index) {
    // console.log( 'Showing runway ' + index)
    currentRwyIndex = index
    var runway = currentAirport.rwy[index]
    selectedRunway.value = runway
    // Override traffice frequency if needed
    if('freq' in runway) trafficFreq.value = runway.freq;
}

</script>

<template>
    <div class="widget">
        <WidgetTitle :title="title" @edit-mode="mode='edit'" />
        <div class="content" v-if="mode=='edit'">
            <div class="label">Code</div>
            <input class="airportCode" v-model="airportCode" @input="onCodeUpdate" />
            <div class="label">Runway</div>
            <div class="rwySelector" v-for="(rwy, index) in rwys"><button @click="selectRunway(index)">{{rwy.name}}</button></div>
            <button class="deleteButton" @click="resetWidget()">Reset</button>
        </div>
        <div class="content" v-else="">
            <div class="corner top left"><div>{{weatherFreq}}</div><div class="label">{{weatherType}}</div></div>
            <div class="corner top right"><div>{{trafficFreq}}</div><div class='label'>{{trafficType}}</div></div>
            <div class="corner bottom left"><div class='label'>Elev</div><div>{{ elevation }}</div></div>
            <div class="corner bottom right"><div class='label'>TPA</div><div>{{ tpa }}</div></div>
            <Runway @click="cycleRunway()" :class="{clickable: runwayCount > 1}" :runway="selectedRunway" />
        </div>
    </div>    
</template>

<style scoped>
    .corner {
        position: absolute; /* Absolute positioning within container */
        padding: 5px; /* Adjust padding for better visibility */
    }
    .corner .label {
        padding: 0;
        font-size:9px;
    }
    .deleteButton {
        position: absolute;
        font-size: 8px;
        bottom: 2px;
        right: 2px;
    }
    .top {
        top: 0;
    }
    .bottom {
        bottom: 0;
    }
    .left{
        left: 0;
        text-align: left;
    }
    .right {
        right: 0;
        text-align: right; /* Align text to the right */
    }
    .label {
        font-size: 12px;
        padding-top: 15px;
    }
    .airportCode {
        text-align: center;
        width: 90px;
    }
    .rwySelector {
        font-size: 12px;
        margin:5px;
    }
</style>