
<template>
    <div class="tile">
        <Header :title="title" :showReplace="editMode" :displayMode="false"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <AirportEdit v-if="editMode" :airport="airportData" :rwyName="runwayName" :rwyOrientation="rwyOrientation" :tp="patternMode" :showHeadings="showHeadings"
            @close="onHeaderClick" @selection="onSettingsUpdate" />
        <div v-else-if="mode=='list'" class="tileContent" >
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
        <div class="tileContent" v-else=""> <!-- Normal mode -->
            <div v-if="airportCode">
                <div class="airportCode" :class="{shortAirportCode: airportCode.length == 3}">{{airportCode}}</div>
                <div v-if="unknownRunway" class="unknownRwy">Unknown Runway</div>
                <Runway v-else :runway="selectedRunway" :pattern="patternMode" :orientation="rwyOrientation" :headings="showHeadings" class="clickable"
                    @click="onHeaderClick" />
                <div v-if="expanded" class="top left cornerColumn">
                    <Corner v-for="index in [0,4,6,2]" :airport="airportData" :data="corners[index]" :runway="selectedRunway" :big="true" :class="['corner'+index]"
                        @update="onCornerUpdate(index, $event)" />
                </div>
                <div v-if="expanded" class="top right cornerColumn">
                    <Corner v-for="index in [1,5,7,3]" :airport="airportData" :data="corners[index]" :runway="selectedRunway" :big="true" :class="['corner'+index]"
                        @update="onCornerUpdate(index, $event)" />
                </div>
                <Corner v-if="!expanded" class="corner top left" :airport="airportData" :data="corners[0]" :runway="selectedRunway" :flip="true"
                    @update="onCornerUpdate(0, $event)" />
                <Corner v-if="!expanded" class="corner top right" :airport="airportData" :data="corners[1]"  :runway="selectedRunway" :flip="true"
                    @update="onCornerUpdate(1, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom left" :airport="airportData" :data="corners[2]"  :runway="selectedRunway"
                    @update="onCornerUpdate(2, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom right" :airport="airportData" :data="corners[3]"  :runway="selectedRunway"
                    @update="onCornerUpdate(3, $event)"/>
            </div>
            <PlaceHolder v-else title="No Airport" />
        </div>
    </div>    
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import { getAirport, getFreqCtaf, getFreqWeather} from '../../assets/data.js'
import { Formatter } from '../../lib/Formatter.ts'

import AirportEdit from './AirportEdit.vue';
import Corner from './Corner.vue';
import CornerStatic from '@/components/shared/CornerStatic.vue';
import Header from '@/components/shared/Header.vue'
import PlaceHolder from '@/components/shared/PlaceHolder.vue'
import Runway from './Runway.vue'

const emits = defineEmits(['replace','update'])
const expanded = ref(false)
const editMode = ref(false)
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
const showHeadings = ref(true)

const defaultCornerFields = ['weather','twr','field','tpa','#FCD/P','gnd','?Custom?Custom','#FUNICOM']
const defaultRwyOrientation = 'vertical'
const defaultPatternMode = 0
const defaultTitle = 'Airport'
const corners = ref(defaultCornerFields)
const unknownRunway = ref(false)


var state = {}

//-----------------------------------------------------
// Props Management
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
    span2: {type: Boolean, default: false},
})

// load props can happen on initial load or when settings are changed
// 1) Airport Code 2) Selected Runway 3) patternMode 4) Corners and 5) Runway orientation
function loadProps(newProps) {
    // console.log('[AirportTile.loadProps] ' + JSON.stringify(newProps))
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
        editMode.value = true
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

    // #3.5 Show headings
    if('headings' in state) {
        showHeadings.value = state.headings
    } else {
        showHeadings.value = true
    }



    // #4 Restore corner fields
    let cornerFields = state.corners
    if( !cornerFields) {
        // console.log('AirportTile loading default cornerFields')
        cornerFields = defaultCornerFields;
    } 
    cornerFields.forEach( (field, index) => {
        // console.log('[AirportTile.loadProps]', index)
        corners.value[index] = field
    })
    // console.log('AirportTile loaded corners ' + JSON.stringify(corners))

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
            // Refresh with that data to get immediate visuals
            onNewAirport(airport)
            // is there a follow up request?
            if(airport && airport.promise) {
                airport.promise.then((outcome) => {
                    // console.log( '[AirportTile.loadProps] outcome', JSON.stringify(outcome))
                    // if data was not current, load new version
                    if(!outcome.current && outcome.airport){
                        // console.log( '[AirportTile.loadProps] data was not current', JSON.stringify(outcome))
                        onNewAirport(outcome.airport)
                    }
                })
            }
        })

    // Are we in expanded mode?
    expanded.value = newProps.span2
    // console.log('[AirportTile.loadProps]', expanded.value)
}

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

// End of props management
//--------------------------


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
        console.log('[AirportTile.getEnding]', error)
    }

    return output
}

function getEndings(rwys, freq) {
    const output = []
    if( !rwys) return output;
    
    rwys.forEach((rwy) => {
        // console.log('[AirportTile.getEndings]', JSON.stringify(rwy))
        if( rwy.ends.length == 2) {
            // console.log('[AirportTile.getEndings]', JSON.stringify(rwy.ends))
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

/**
 * An update has happened in a corner, memorize the value and bubble it up
 * @param {*} data 
 */
function onCornerUpdate( index, field) {
    // console.log( 'onCornerUpdate ' + JSON.stringify(data))
    if( field) {
        // update the source data
        corners.value[index] = field
        updateData();
    } else {
        console.log('Missing data from corner update')
    }
}

// Toggle between edit mode and current mode
function onHeaderClick() {
    if(editMode.value) {
        editMode.value = false
        if( airportData.value){
            const airport = airportData.value
            // when switching back to normal mode, adjust variables affected by edit
            rwyList.value = airport.rwy
            airportCode.value = airport.code
            editMode.value = false
            title.value = airport.name
        }    
    } else {
        title.value = defaultTitle
        editMode.value = true
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
        editMode.value = true
    }
}

// Settings have been updated in edit mode
function onSettingsUpdate( newAirport, newRunway, newOrientation, newPatternMode, newShowHeadings) {
    // console.log( '[AirportTile.onSettingsUpdate] airport', JSON.stringify(newAirport))
    // console.log( '[AirportTile.onSettingsUpdate] newRunway', JSON.stringify(newRunway))
    // console.log( '[AirportTile.onSettingsUpdate] newOrientation', JSON.stringify(newOrientation))
    // console.log( '[AirportTile.onSettingsUpdate] newShowHeading', newShowHeadings)
    editMode.value = false
    props.params.code = newAirport.code;
    airportData.value = newAirport;
    state.pattern = newPatternMode
    patternMode.value = newPatternMode;
    showHeadings.value = newShowHeadings
    state.headings = newShowHeadings
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

    updateData()
}

function showAirport( airport) {
    // console.log( "[AirportTile.showAirport] Showing airport ", JSON.stringify(airport))
    if( airport == null) {
        // if airport data is missing, we switch to edit mode
        console.log( 'Airport data missing')
        editMode.value = true
        return
    }
    airportData.value = airport;
    airportCode.value = airport.code
    rwyList.value = airport.rwys;
    allEndings.value = getEndings(airport.rwys, getFreqCtaf(airport.freq));
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    const weather = getFreqWeather( airport.freq)
    weatherFreq.value = weather ? Formatter.frequency(weather.mhz) : Formatter.noFrequency
    weatherType.value = weather ? weather.name : '-'

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
}

// Show a runway from its name in the airport
function showRunway(name) {
    // console.log( 'Airport showRunway ' + name)
    const rwyData = airportData.value.rwys.find((rwy) => rwy.name == name)
    // console.log( '[AirportTile.showRunway]', JSON.stringify(rwyData))
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
function updateData() {
    if( corners) { 
        state['corners'] = corners.value
    }
    // console.log( 'Airport widget updated with ' + JSON.stringify(airportParam));
    emits('update', state);
}

</script>
<style scoped>
    .tileContent {
        position: relative;
        overflow: hidden;
        width: 100%;
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
    }
    .runwayListHeader {
        font-size: 10px;
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
    .cornerColumn {
        position: absolute;
        display: flex;
        flex-flow: column;
        padding: 5px;
        background-color: lightgrey;
        justify-content: space-between;
        height: 100%;
    }

</style>