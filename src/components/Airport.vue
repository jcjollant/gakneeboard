<script setup>

import {ref, onMounted, watch} from 'vue';
import Header from './Header.vue'
import Runway from './RunwayView.vue'
import * as data from '../assets/data.js'

const emits = defineEmits(['replace','update'])


var currentAirport
var currentRwyIndex;
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
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
const allRunways = ref([]) // used during runway selection
const allEndings = ref([]) // used when displaying all runways
const selectedRunway = ref(null)

function cycleRunway() {
    // console.log( "cycleRunway rwy Count " + runwayCount.value);
    if( runwayCount.value < 2) return;

    const newIndex = (currentRwyIndex + 1) % currentAirport.rwy.length;
    // console.log('Cycling runway to ' + newIndex)
    showRunway(newIndex);
    updateWidget();
}

function editMode() {
    title.value = 'Runway'
    mode.value = 'edit'
}

// invoked whenever we want to save the current state
function updateWidget() {
    const rwyName = (currentRwyIndex == -1) ? 'all' : currentAirport.rwy[currentRwyIndex].name;
    const airportParam = {'code':airportCode.value.toLowerCase(),'rwy':rwyName};
    // console.log( 'Widget updated with ' + JSON.stringify(airportParam));
    emits('update', JSON.stringify(airportParam));
}

// gets invoked as airport code is typed into the input field
function onCodeUpdate() {
    // console.log(airportCode.value)
    data.getOneAirport( airportCode.value.toUpperCase())
        .then( airport => {
            if( airport) {
                // console.log("onCodeUpdate airport " + JSON.stringify(airport))
                currentAirport = airport;
                allRunways.value = airport.rwy
                runwayCount.value = airport.rwy.length
            } else {
                allRunways.value = [];
                runwayCount.value = 0
            }
        })
}

function getEnding(rwy, ending, freq) {
    // console.log('getEnding ' + JSON.stringify(rwy) + ' / ' + ending)
    const output = {}
    if( !(ending in rwy)) return output;

    output['name'] = ending
    output['width'] = rwy.width
    output['length'] = rwy.length
    output['pattern'] = rwy[ending].pattern == 'left' ? 'LP' : 'RP'
    if( 'freq' in rwy) {
        output['freq'] = rwy.freq;
    } 
    else if( freq) {
        output['freq'] = freq
    }

    return output
}

function getEndings(rwys, freq) {
    const output = []
    if( !rwys) return output;

    rwys.forEach((rwy) => {
        const [nameA,nameB] = rwy.name.split('-')
        output.push( getEnding(rwy,nameA,freq))
        output.push( getEnding(rwy,nameB,freq))
    })
    output.sort( (a,b) => { return a.name.localeCompare( b.name)})
    return output
}

function loadAirportByCode(code) {
    title.value = "Loading " + code + '...'
    data.getOneAirport( code)
        .then(airport => {
            if( airport && 'rwy' in airport) {
                showAirport(airport)
                if( props.params.rwy == 'all') {
                    mode.value = 'list'
                    showRunway(-1)
                } else {
                    mode.value = ''
                    showRunway(airport.rwy.findIndex((rwy) => rwy.name == props.params.rwy));
                }
            } else {
                editMode()
            }
    })
}

function onHeaderClick() {
    if( mode.value == '') {
        mode.value = 'edit'
    } else {
        emits('replace')
    }
}

// add initialization code 
onMounted(() => {   
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadAirportByCode(props.params.code)
})

// A runway has been selected from the list
function selectRunway(index) {
    // console.log("selectRunway " + index)
    showAirport(currentAirport)
    mode.value = (index == -1) ? 'list' : ''
    showRunway(index);
    updateWidget()
}

function showAirport( airport) {
    // console.log( "Showing airport " + JSON.stringify(airport))
    if( airport == null) {
        // if airport data is missing, we switch to edit mode
        console.log( 'Airport data missing')
        mode.value = 'edit';
        return
    }
    currentAirport = airport;
    runwayCount.value = airport.rwy.length
    airportCode.value = airport.code
    allRunways.value = airport.rwy;
    allEndings.value = getEndings(airport.rwy, airport.ctaf);
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    weatherFreq.value = airport.weather.freq
    weatherType.value = airport.weather.type
    // If traffic is runway specific, it will be overriden by showRunway
    if( 'ctaf' in airport) {
        trafficFreq.value = airport.ctaf
        if( airport.twr == 'Y') {
            trafficType.value = 'TWR/CTAF'
        } else {
            trafficType.value = 'CTAF'
        }
    }
    elevation.value = Math.round(airport.elev);
    tpa.value = Math.round(airport.elev + 1000);
}

// Show a runway from its index in the airport
function showRunway(index) {
    // console.log( 'Showing runway ' + index)
    currentRwyIndex = index
    if( currentRwyIndex == -1) return
    
    var runway = currentAirport.rwy[index]
    selectedRunway.value = runway
    // Override traffice frequency if needed
    if('freq' in runway) {
        trafficFreq.value = runway.freq;
        trafficType.value = 'TWR';
    }
}

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    mode.value = props.mode;
    if(props.mode == 'edit') {
        editMode()
    } else {
        loadAirportByCode(props.params.code)
    }
})

</script>

<template>
    <div class="widget">
        <Header :title="title" @click="onHeaderClick" />
        <div class="content" v-if="mode=='edit'">
            <div class="label">Airport Code</div>
            <input class="airportCodeInput" v-model="airportCode" @input="onCodeUpdate" />
            <div class="label">Runway</div>
            <div class="rwySelector">
                <button class="runwaySign" v-for="(rwy, index) in allRunways" @click="selectRunway(index)">{{rwy.name}}</button>
                <button class="sign" v-if="allRunways.length > 0" @click="selectRunway(-1)">All Rwys</button>
            </div>
        </div>
        <div class="content" v-else-if="mode=='list'">
            <div class="airportCode">{{airportCode}}</div>
            <div class="runwayList">
                <div class="runwayListRow">
                    <div class="runwayListHeader">Rwy</div>
                    <div class="runwayListHeader">TP</div>
                    <div class="runwayListHeader">Len</div>
                    <div class="runwayListHeader">Freq</div>
                </div>
                <div class="runwayListRow"  v-for="(end) in allEndings">
                    <div class="runwayListItemRunway">{{end.name}}</div>
                    <div class="runwayListItem">{{ end.pattern }}</div>
                    <div class="runwayListItem">{{ Math.round(end.length / 100) }}</div>
                    <div class="runwayListItem">{{ end.freq }}</div>
                </div>
            </div>
            <div class="footer">
                <div class='label'>Elev</div>
                <div class='label'>TPA</div>
                <div class='label'>{{ weatherType }}</div>
                <div>{{ elevation }}</div>
                <div>{{ tpa }}</div>
                <div>{{ weatherFreq }}</div>
            </div>
        </div>
        <div class="content" v-else="">
            <div class="corner top left"><div>{{weatherFreq}}</div><div class="label">{{weatherType}}</div></div>
            <div class="corner top right"><div>{{trafficFreq}}</div><div class='label'>{{trafficType}}</div></div>
            <div class="corner bottom left"><div class='label'>Elev</div><div>{{ elevation }}</div></div>
            <div class="corner bottom right"><div class='label'>TPA</div><div>{{ tpa }}</div></div>
            <Runway :runway="selectedRunway" />
            <div class="airportCode" @click="cycleRunway()" :class="{clickable: runwayCount > 1}" >{{airportCode}}</div>
        </div>
    </div>    
</template>

<style scoped>
    .content {
        position: relative;
        overflow: hidden;
    }
    .corner {
        position: absolute; /* Absolute positioning within container */
        padding: 5px; /* Adjust padding for better visibility */
    }
    .label {
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
    .airportCodeInput {
        text-align: center;
        width: 90px;
    }
    .rwySelector {
        font-size: 14px;
        margin:5px 20px; 
        display:grid;
        grid-template-columns: auto auto;
        gap: 2px 20px;
    }
    .runwaySign {
        background: red;
        color:white;
        border-radius: 2px;
        border: 1px solid black;
        padding: 2px 8px;
        font-weight: 500;
    }
    .runwayListItem {
        text-align: center;
        font-size: 14px;
        padding: 2px 4px;
    }
    .runwayListItemRunway{
        font-size: 14px;
        padding: 2px 4px;
        font-weight: 600;
    }
    .sign {
        background: #ffbb00;
        color:black;
        border-radius: 2px;
        border: 1px solid black;
        padding: 2px 8px 2px 8px;
    }
    .airportCode {
        font-weight: 900;
        font-size: 68px;
        line-height: 200px;
        opacity: 0.10;
        position: absolute;
        top: 0;
        width:100%;
        height: 100%;
        /* height: 90px; */
        text-align: center;
        vertical-align: middle;
    }
    .runwayList {
        /* padding: 10px 10px; */
        width:240px;
    }
    .runwayListRow {
        display: grid;
        grid-template-columns: 30% 20% 20% 30%;
        /* grid-template-columns: auto auto auto auto; */
        /* margin-bottom: 2px; */
    }

    .runwayListHeader {
        font-size: 10px;
        /* text-align: center; */
    }

    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        display: grid;
        grid-template-columns: auto auto auto;
    }
</style>