<script setup>
import {ref, onMounted, watch} from 'vue';
import { getAirport, getFreqCtaf, getFreqWeather} from '../../assets/data.js'

import AirportEdit from './AirportEdit.vue';
import Corner from './Corner.vue';
import CornerStatic from '../shared/CornerStatic.vue';
import Header from '../shared/Header.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'
import Runway from './Runway.vue'

const emits = defineEmits(['replace','update'])

var previousMode = '';
var state = {}

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
    mode.value = ''
    loadProps(props)
})

const mode = ref('')
const title = ref('')
const weatherFreq = ref('')
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const airportCode = ref('') // used during edit mode
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
const defaultRwyOrientation = 'vertical'
const defaultPatternMode = 0
const defaultTitle = 'Airport'
const corners = [corner0,corner1,corner2,corner3]
const unknownRunway = ref(false)

function getEnding(rwy, endIndex, freq) {
    // console.log('getEnding ' + JSON.stringify(rwy) + ' / ' + ending)
    const output = {}
    try {
        const end = rwy.ends[endIndex]    
        output['name'] = end.name
        output['width'] = rwy.width
        output['length'] = rwy.length
        output['pattern'] = end.tp == 'L' ? 'LP' : 'RP'
        if( 'freq' in rwy) {
            output['freq'] = rwy.freq;
        } 
        else if( freq) {
            output['freq'] = freq ? freq.mhz : '-'
        }
    } catch( error) {
        console.log('[Airport.getEnding]', error)
    }

    return output
}

function getEndings(rwys, freq) {
    const output = []
    if( !rwys) return output;
    
    rwys.forEach((rwy) => {
        // console.log('[Airport.getEndings]', JSON.stringify(rwy))
        if( rwy.ends.length == 2) {
            // console.log('[Airport.getEndings]', JSON.stringify(rwy.ends))
            output.push( getEnding(rwy,0,freq))
            output.push( getEnding(rwy,1,freq))
        }
    })
    output.sort( (a,b) => { return a.name.localeCompare( b.name)})
    return output
}

function getTpClass(end) {
    if(end && end.tp && end.tp=='R') return 'patternRight';
    return 'patternLeft';
}

// load props can happen on initial load or when settings are changed
// 1) Airport Code 2) Selected Runway 3) patternMode 4) Corners and 5) Runway orientation
function loadProps(newProps) {
    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    state = newProps.params;
    if( !state) {
        console.log( 'Airport cannot load params ' + JSON.stringify(state))
        return
    }
    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    const code = state.code
    // Force edit mode if we don't have an airport yet
    if( !code) {
        title.value = defaultTitle
        // mode.value = 'edit'
        return
    }

    // #2 Runway
    if( 'rwy' in state && state.rwy) {
        runwayName.value = state.rwy
    }

    // #3 Pattern mode
    if('pattern' in state) {
        patternMode.value = state.pattern
    } else {
        patternMode.value = defaultPatternMode
    }

    // #4 Restore corner fields
    let cornerFields = state.corners
    if( !cornerFields) {
        // console.log('Airport loading default cornerFields')
        cornerFields = defaultCornerFields;
    } 
    cornerFields.forEach( (field, index) => {
        corners[index].value = {'id':index,'field':field}
    })
    // console.log('Airport loaded corners ' + JSON.stringify(corners))

    // #5 Rwy orientation
    if('rwyOrientation' in state && state.rwyOrientation) {
        rwyOrientation.value = state.rwyOrientation;
    } else {
        rwyOrientation.value = defaultRwyOrientation;
    }

    // load data for this airport
    title.value = "Loading " + code + '...'
    getAirport( code, true)
        .then(airport => {
            onNewAirport(airport)
            // is there a follow up request?
            if(airport && airport.promise) {
                airport.promise.then((outcome) => {
                    // console.log( '[Airport.loadProps] outcome', JSON.stringify(outcome))
                    // if data was not curren, load new version
                    if(!outcome.current && outcome.airport){
                        // console.log( '[Airport.loadProps] data was not current', JSON.stringify(outcome))
                        onNewAirport(outcome.airport)
                    } 
                })
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
    } else {
        mode.value = ''
    }    
}    

// consider new airport and its data
function onNewAirport(airport) {
    if( airport && 'rwys' in airport) {
        showAirport(airport)
        if( 'rwy' in state) {
            if( state.rwy == 'all') {
                mode.value = 'list'
            } else {
                mode.value = ''
                showRunway(state.rwy);
            }
        } else { // default to first runway
            mode.value = ''
            showRunway(airport.rwys[0].name)
        }
    } else { // no data for this airport
        // console.log('No data came out of get airport ' + code)
        // Switch to edit mode
        title.value = 'Airport ?'
        mode.value = 'edit'
    }
}

function onPatternUpdate(newPatternMode) {
    // console.log('Airport onPatternUpdate ' + newPatternMode)
    state.pattern = newPatternMode
    
    // patternMode.value = newPatternMode
    updateWidget();
}

// Settings have been updated in edit mode
function onSettingsUpdate( newAirport, newRunway, newOrientation) {
    // console.log( '[Airport.onSettingsUpdate] airport', JSON.stringify(newAirport))
    // console.log( '[Airport.onSettingsUpdate] newRunway', JSON.stringify(newRunway))
    // console.log( '[Airport.onSettingsUpdate] newOrientation', JSON.stringify(newOrientation))
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
    rwyList.value = airport.rwys;
    allEndings.value = getEndings(airport.rwys, getFreqCtaf(airport.freq));
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    const weather = getFreqWeather( airport.freq)
    weatherFreq.value = weather ? weather.mhz.toString() : '-'
    weatherType.value = weather ? weather.name : '-'

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
}

// Show a runway from its name in the airport
function showRunway(name) {
    // console.log( 'Airport showRunway ' + name)
    const rwyData = airportData.value.rwys.find((rwy) => rwy.name == name)
    // console.log( '[Airport.showRunway]', JSON.stringify(rwyData))
    if( rwyData) {
        selectedRunway.value = rwyData
        runwayName.value = name
        unknownRunway.value = false
    } else {
        // console.log( 'Unknown runway ' + name) 
        unknownRunway.value = true
    }
}

// invoked whenever we want to save the current state
function updateWidget() {
    if( corners) { 
        state['corners'] = corners.map( corner => corner.value.field)
    }
    // console.log( 'Airport widget updated with ' + JSON.stringify(airportParam));
    emits('update', state);
}

</script>

<template>
    <div class="tile">
        <Header :title="title" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <AirportEdit v-if="mode=='edit'" :airport="airportData" :rwyName="runwayName" :rwyOrientation="rwyOrientation"
            @close="onHeaderClick" @selection="onSettingsUpdate" />
        <div v-else-if="mode=='list'" class="content" >
            <div class="airportCode" :class="{shortAirportCode: airportCode.length == 3}">{{airportCode}}</div>
            <div class="runwayList">
                <div class="runwayListRow">
                    <div class="runwayListHeader">Rwy</div>
                    <!-- <div class="runwayListHeader">TP</div> -->
                    <div class="runwayListHeader">Len</div>
                    <div class="runwayListHeader">Freq</div>
                </div>
                <div class="runwayListRow" v-for="rwy in rwyList">
                    <div class="runwayListItemRunway">
                        <span :class="getTpClass(rwy.ends[0])">{{rwy.ends[0].name}}</span>-
                        <span :class="getTpClass(rwy.ends[1])">{{rwy.ends[1]?rwy.ends[1].name:'' }}</span>
                    </div>
                    <div class="runwayListItem">{{ Math.round(rwy.length / 100) }}</div>
                    <div class="runwayListItem">{{ rwy.freq?rwy.freq.toFixed(3):'' }}</div>
                </div>
            </div>
            <div class="footer">
                <CornerStatic label="Elev" :value="elevation" position="bottom"/>
                <CornerStatic label="TPA" :value="tpa" position="bottom"/>
                <CornerStatic :label="weatherType" :value="weatherFreq" position="bottom"/>
            </div>
        </div>
        <div class="content" v-else=""> <!-- Normal mode -->
            <div v-if="airportCode">
                <div class="airportCode" :class="{shortAirportCode: airportCode.length == 3}">{{airportCode}}</div>
                <div v-if="unknownRunway" class="unknownRwy">Unknown Runway</div>
                <Runway v-else :runway="selectedRunway" :pattern="patternMode" :orientation="rwyOrientation"
                    @update="onPatternUpdate" />
                <Corner class="corner top left" :airport="airportData" :data="corner0" :runway="selectedRunway" 
                    @update="onCornerUpdate" />
                <Corner class="corner top right" :airport="airportData" :data="corner1"  :runway="selectedRunway" 
                    @update="onCornerUpdate"/>
                <Corner class="corner bottom left" :airport="airportData" :data="corner2"  :runway="selectedRunway" :flip="true"  
                    @update="onCornerUpdate"/>
                <Corner class="corner bottom right" :airport="airportData" :data="corner3"  :runway="selectedRunway" :flip="true"  
                    @update="onCornerUpdate"/>
            </div>
            <PlaceHolder v-else title="No Airport" />
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
    .patternLeft {
        color: darkblue;
    }
    .patternRight {
        color: darkred;
    }
    .left{
        left: 0;
        text-align: left;
    }
    .right {
        right: 0;
        text-align: right; /* Align text to the right */
    }
    .runwayList {
        background: transparent;
        width:240px;
        height:10.5rem;
        overflow: auto;
        /* overflow-y: scroll; */
        /* z-index: 1; */
        position: relative;
        /* top: -200px; */
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
        font-size: 4rem;
        line-height: 240px;
        opacity: 0.10;
        position: absolute;
        top: 0;
        width:100%;
        height: 100%;
        text-align: center;
        vertical-align: middle;
        z-index: 0;
    }
    .shortAirportCode {
        font-size: 6rem;
    }
    .runwayListRow {
        display: grid;
        grid-template-columns: 40% 20% 40%;
        /* grid-template-columns: 30% 20% 20% 30%; */
    }

    .runwayListHeader {
        font-size: 10px;
        /* text-align: center; */
    }

    .unknownRwy{
        line-height: 13rem;
    }
    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        display: grid;
        grid-template-columns: auto auto auto;
    }
</style>