<script setup>

import {ref, onMounted, watch} from 'vue';
import Header from './Header.vue'
import Runway from './RunwayView.vue'
import * as data from '../assets/data.js'
import Button from 'primevue/button'
import Corner from './Corner.vue';
import CornerStatic from './CornerStatic.vue';

const emits = defineEmits(['replace','update'])


var currentAirport
var currentRwyIndex;
var previousMode = '';
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
})

const mode = ref('')
const title = ref('')
const weatherFreq = ref()
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const runwayCount = ref(0)
const airportCode = ref() // used during edit mode
const allRunways = ref([]) // used during runway selection
const allEndings = ref([]) // used when displaying all runways
const selectedRunway = ref(null)
const airportData = ref()
const corner0 = ref({'id':0,'field':'weather'})
const corner1 = ref({'id':1,'field':'twr'})
const corner2 = ref({'id':2,'field':'field'})
const corner3 = ref({'id':3,'field':'tpa'})
const defaultCornerFields = ['weather','twr','field','tpa']
// const corner5 = ref('tpa')
const corners = [corner0,corner1,corner2,corner3]

function cycleRunway() {
    // console.log( "cycleRunway rwy Count " + runwayCount.value);
    if( runwayCount.value < 2) return;

    const newIndex = (currentRwyIndex + 1) % currentAirport.rwy.length;
    // console.log('Cycling runway to ' + newIndex)
    showRunway(newIndex);
    updateWidget();
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

function loadProps(newProps) {
    const code = newProps.params.code
    if( !code) {
        title.value = 'Airport'
        mode.value = 'edit'
        return
    }

    let cornerFields = newProps.params.corners
    if( !cornerFields) {
        // console.log('Airport loading default cornerFields')
        cornerFields = defaultCornerFields;
    } 
    cornerFields.forEach( (field, index) => {
        corners[index].value = {'id':index,'field':field}
    })
    // console.log('Airport loaded corners ' + JSON.stringify(corners))

    title.value = "Loading " + code + '...'
    data.getAirport( code, true)
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
                mode.value = 'edit'
            }
        })
}

// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    data.getAirport( airportCode.value)
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

/**
 * An update has happened in a corner, memorize the value and bubble it up
 * @param {*} data 
 */
function onCornerUpdate( data) {
    // console.log( 'onCornerUpdate ' + JSON.stringify(data))
    if( data && 'id' in data && 'field' in data) {
        corners[data.id].value.field = data.field
        updateWidget();
    } else {
        console.log('Missing data from corner update')
    }
}

function onHeaderClick() {
    if( mode.value == '' || mode.value =='list') {
        previousMode = mode.value;
        mode.value = 'edit'
    } else {
        mode.value = previousMode;
    }    
}    

onMounted(() => {   
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
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
    airportData.value = airport;
    runwayCount.value = airport.rwy.length
    airportCode.value = airport.code
    allRunways.value = airport.rwy;
    allEndings.value = getEndings(airport.rwy, airport.ctaf);
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    weatherFreq.value = airport.weather.freq.toString()
    weatherType.value = airport.weather.type

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
}

// Show a runway from its index in the airport
function showRunway(index) {
    // console.log( 'Showing runway ' + index)
    currentRwyIndex = index
    if( currentRwyIndex == -1) return
    
    var runway = currentAirport.rwy[index]
    selectedRunway.value = runway
}

// invoked whenever we want to save the current state
function updateWidget() {
    const rwyName = (currentRwyIndex == -1) ? 'all' : currentAirport.rwy[currentRwyIndex].name;
    const cornersList = corners.map( corner => corner.value.field)
    const airportParam = {'code':airportCode.value.toLowerCase(),'rwy':rwyName,'corners':cornersList};
    // console.log( 'Widget updated with ' + JSON.stringify(airportParam));
    emits('update', airportParam);
}

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

</script>

<template>
    <div class="widget">
        <Header :title="title" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div class="content" v-if="mode=='edit'">
            <div class="label">Airport Code</div>
            <input class="airportCodeInput" v-model="airportCode" @input="onCodeUpdate" />
            <div class="label" v-if="allRunways.length > 0">Select Runway</div>
            <div class="rwySelector">
                <Button :label="rwy.name" class="runwaySign" v-for="(rwy, index) in allRunways" @click="selectRunway(index)"></Button>
                <Button label="All Rwys" class="sign" v-if="allRunways.length > 0" @click="selectRunway(-1)"></Button>
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
                <CornerStatic label="Elev" :value="elevation" position="bottom"/>
                <CornerStatic label="TPA" :value="tpa" position="bottom"/>
                <CornerStatic :label="weatherType" :value="weatherFreq" position="bottom"/>
            </div>
        </div>
        <div class="content" v-else="">
            <Runway :runway="selectedRunway" />
            <div class="airportCode" @click="cycleRunway()" :class="{clickable: runwayCount > 1}" >{{airportCode}}</div>
            <Corner class="corner top left" :airport="airportData" :data="corner0" :runway="selectedRunway" 
                @update="onCornerUpdate" />
            <Corner class="corner top right" :airport="airportData" :data="corner1"  :runway="selectedRunway" @update="onCornerUpdate"/>
            <Corner class="corner bottom left" :airport="airportData" :data="corner2"  :runway="selectedRunway" :flip="true"  @update="onCornerUpdate"/>
            <Corner class="corner bottom right" :airport="airportData" :data="corner3"  :runway="selectedRunway" :flip="true"  @update="onCornerUpdate"/>
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
        margin-bottom: 10px;
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
        border-radius: 4px;
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
        border-radius: 4px;
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
        width:240px;
    }
    .runwayListRow {
        display: grid;
        grid-template-columns: 30% 20% 20% 30%;
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