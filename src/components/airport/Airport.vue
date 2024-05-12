<script setup>

import {ref, onMounted, watch} from 'vue';
import Header from '../Header.vue'
import Runway from './RunwayView.vue'
import * as data from '../../assets/data.js'
import Corner from './Corner.vue';
import CornerStatic from './CornerStatic.vue';
import AirportEdit from './AirportEdit.vue';

const emits = defineEmits(['replace','update'])


var previousMode = '';
var airportSettigns = null;

const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
})

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

const mode = ref('')
const title = ref('')
const weatherFreq = ref()
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const airportCode = ref() // used during edit mode
const rwyList = ref([]) // used during runway selection
const allEndings = ref([]) // used when displaying all runways

const selectedRunway = ref(null)
const airportData = ref()
const patternMode = ref(0)
const runwayName = ref('')
const rwyOrientation = ref('')

const corner0 = ref({'id':0,'field':'weather'})
const corner1 = ref({'id':1,'field':'twr'})
const corner2 = ref({'id':2,'field':'field'})
const corner3 = ref({'id':3,'field':'tpa'})
const defaultCornerFields = ['weather','twr','field','tpa']
const defaultTitle = 'Airport'
const corners = [corner0,corner1,corner2,corner3]

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

// load props can happen on initial load or when settings are changed
// 1) Airport Code 2) Selected Runway 3) patternMode 4) Corners and 5) Runway orientation
function loadProps(newProps) {
    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    const params = newProps.params;
    if( !params) {
        console.log( 'Cannot load params ' + JSON.stringify(params))
        return
    }
    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    const code = params.code
    if( !code) {
        title.value = defaultTitle
        mode.value = 'edit'
        return
    }

    // #2 Runway
    if( 'rwy' in params && params.rwy) {
        runwayName.value = params.rwy
    }

    // #3 Pattern mode
    if('pattern' in params && params.pattern) {
        patternMode.value = params.pattern
    }

    // #4 Restore corner fields
    let cornerFields = params.corners
    if( !cornerFields) {
        // console.log('Airport loading default cornerFields')
        cornerFields = defaultCornerFields;
    } 
    cornerFields.forEach( (field, index) => {
        corners[index].value = {'id':index,'field':field}
    })
    // console.log('Airport loaded corners ' + JSON.stringify(corners))

    // #5 Rwy orientation
    if('rwyOrientation' in params && params.rwyOrientation) {
        rwyOrientation.value = params.rwyOrientation;
    }

    // load data for this airport
    title.value = "Loading " + code + '...'
    data.getAirport( code, true)
        .then(airport => {
            if( airport && 'rwy' in airport) {
                showAirport(airport)
                if( 'rwy' in params) {
                    if( params.rwy == 'all') {
                        mode.value = 'list'
                    } else {
                        mode.value = ''
                        showRunway(params.rwy);
                    }
                } else { // default to first runway
                    mode.value = ''
                    showRunway(airport.rwy[0].name)
                }
            } else {
                mode.value = 'edit'
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

// Toggle between edit mode and current mode
function onHeaderClick() {
    if( mode.value == '' || mode.value =='list') {
        previousMode = mode.value;
        title.value = defaultTitle
        mode.value = 'edit'
    } else if( airportData.value){
        const airport = airportData.value
        // when switching back to normal mode, adjust variables affected by edit
        rwyList.value = airport.rwy
        airportCode.value = airport.code
        mode.value = previousMode;
        title.value = airport.name
    }    
}    

function onPatternUpdate(newPatternMode) {
    // console.log('Airport onPatternUpdate ' + newPatternMode)
    props.params.pattern = newPatternMode
    patternMode.value = newPatternMode
    updateWidget();
}

// Settings have been updated in edit mode
function onSettingsUpdate( newAirport, newRunway, newOrientation) {
    // console.log( 'Airport onSettingsUpdate airport ' + JSON.stringify(newAirport) + ' settings ' + JSON.stringify(newSettings) )
    props.params.code = newAirport.code;
    airportData.value = newAirport;
    showAirport( newAirport)

    props.params.rwy = newRunway
    props.params.rwyOrientation = newOrientation
    if( newRunway == 'all') {
        // console.log('Airport onSettingsUpdate swithcing to list')
        mode.value = 'list';
    } else {
        mode.value = '';
        showRunway(newRunway)
    }

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
    airportData.value = airport;
    airportCode.value = airport.code
    rwyList.value = airport.rwy;
    allEndings.value = getEndings(airport.rwy, airport.ctaf);
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    weatherFreq.value = airport.weather.freq.toString()
    weatherType.value = airport.weather.type

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
}

// Show a runway from its name in the airport
function showRunway(name) {
    // console.log( 'Airport showRunway ' + name)
    const rwyData = airportData.value.rwy.find((rwy) => rwy.name == name)
    // console.log( 'Airport showing  ' + JSON.stringify(rwyData))
    if( rwyData) {
        selectedRunway.value = rwyData
        runwayName.value = name
    }
}

// invoked whenever we want to save the current state
function updateWidget() {
    const airportParam = props.params;

    if( corners) { 
        airportParam['corners'] = corners.map( corner => corner.value.field)
    }
    // console.log( 'Airport widget updated with ' + JSON.stringify(airportParam));
    emits('update', airportParam);
}

</script>

<template>
    <div class="widget">
        <Header :title="title" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <AirportEdit v-if="mode=='edit'" :airport="airportData" :rwyName="runwayName" :rwyOrientation="rwyOrientation"
            @close="onHeaderClick" @selection="onSettingsUpdate" />
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
            <div class="airportCode">{{airportCode}}</div>
            <Runway :runway="selectedRunway" :pattern="patternMode" :orientation="rwyOrientation"
                @update="onPatternUpdate" />
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