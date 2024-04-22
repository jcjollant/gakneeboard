<script setup>

import {ref, onMounted, watch} from 'vue';
import RunwayViewer from './RunwayViewer.vue'
import * as data from '../assets/data.js'

var currentRwyIndex
var currentAirportCode
const props = defineProps({
    airport: { type: Object, default: null},
    rwyIndex: { type: Number, default: 0}
})

const title = ref('Runway Selection')
const weatherFreq = ref()
const weatherType = ref()
const trafficFreq = ref()
const trafficType = ref()
const elevation = ref()
const tpa = ref()
const runwayCount = ref(0)
const initMode = ref(false)
const airportCode = ref() // used during runway selection
const rwys = ref([]) // used during runway selection
const selectedRunway = ref(null)

function cycleRunway() {
    // console.log( "Rwy Count " + props.airport.rwy.length);
    if( runwayCount.value > 1) {
        currentRwyIndex = ( currentRwyIndex + 1) % runwayCount.value
        // console.log('rwyIndex ' + rwyIndex)
        show( props.airport, currentRwyIndex)
    }
}

// add initialization code 
onMounted(() => {   
    show( props.airport, props.rwyIndex)
})

// watch( props, async() => {
//     // console.log("props changed");
//     show(props.airport, props.rwyIndex)
// })

function onCodeUpdate() {
    // console.log(airportCode.value)
    const code = airportCode.value.toLowerCase();
    if( code in data.airports) {
        rwys.value = data.airports[code].rwy
        currentAirportCode = code
    }
}

function selectRunway(index) {
    initMode.value = false
    selectedRunway.value = data.airports[currentAirportCode].rwy[index];
    show( data.airports[currentAirportCode], index)
}

function show( airport, rwyIndexParam) {
    // console.log( "airport " + JSON.stringify(airport) + " rwyIndex " + rwyIndexParam)
    if( airport == null) {
        initMode.value = true
        return
    } else {
        initMode.value = false
        currentRwyIndex = rwyIndexParam
        selectedRunway.value = airport.rwy[currentRwyIndex]
    }
    
    runwayCount.value = airport.rwy.length
    const runway = airport.rwy[currentRwyIndex];

    title.value = airport.airportCode + ' : ' + airport.airportName
    weatherFreq.value = airport.weather.freq;
    weatherType.value = airport.weather.type
    // If traffic is runway specific, it will be specified in the runway data
    trafficFreq.value = ('freq' in runway) ? runway.freq : airport.traffic.freq;
    trafficType.value = airport.traffic.type;
    elevation.value = airport.elev;
    tpa.value = airport.tpa;
}
</script>

<template>
    <div class="widget">
        <div class="widgetTitle">{{title}}</div>
        <div class="content" v-if="!initMode">
            <div class="corner top left"><div>{{weatherFreq}}</div><div class="label">{{weatherType}}</div></div>
            <div class="corner top right"><div>{{trafficFreq}}</div><div class='label'>{{trafficType}}</div></div>
            <div class="corner bottom left"><div class='label'>Elev</div><div>{{ elevation }}</div></div>
            <div class="corner bottom right"><div class='label'>TPA</div><div>{{ tpa }}</div></div>
            <RunwayViewer @click="cycleRunway()" :class="{clickable: runwayCount > 1}" :runway="selectedRunway" />
        </div>
        <div class="content" v-if="initMode">
            <div class="label">Airport Code</div>
            <input class="airportCode" v-model="airportCode" @input="onCodeUpdate" />
            <div class="label">Runway</div>
            <div class="rwySelector" v-for="(rwy, index) in rwys"><button @click="selectRunway(index)">{{rwy.name}}</button></div>
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
    .clickable {
        cursor: pointer;
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