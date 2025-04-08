
<template>
    <div class="tile">
        <Header :title="title" :showReplace="editMode"
            @replace="emits('replace')" @display="displaySelection=!displaySelection" @title="onHeaderClick"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList" :expandable="!expanded"
            @selection="changeMode" @expand="onExpand" />
        <AirportEdit v-else-if="editMode" :displayMode="displayMode" :airport="airportData" :rwyName="runwayName" :rwyOrientation="rwyOrientation" :tp="patternMode" :showHeadings="showHeadings"
            @close="onHeaderClick" @selection="onSettingsUpdate" />
        <div v-else-if="displayMode==DisplayModeAirport.RunwayList" class="tileContent clickable"  @click="onHeaderClick">
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
        <div class="tileContent" v-else> <!-- One Runway or sketch -->
            <div v-if="airportCode">
                <div v-if="displayMode==DisplayModeAirport.Diagram" class="rwySketch clickable" @click="onHeaderClick">
                    <PlaceHolder v-if="!rwySketch || rwySketch=='dne'" title="No Diagram" subtitle="Consider sending feedback" />
                    <img v-else class="rwySketch" :src="rwySketch" />
                </div>
                <div v-else>
                    <div class="airportCode" :class="{shortAirportCode: airportCode.length == 3}">{{airportCode}}</div>
                    <div v-if="unknownRunway" class="unknownRwy">Unknown Runway</div>
                    <Runway v-else :runway="selectedRunway" :pattern="patternMode" :orientation="rwyOrientation" :headings="showHeadings" class="clickable"
                        @click="onHeaderClick"/>
                </div>
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

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import { getAirport, getFreqCtaf, getFreqWeather} from '../../assets/data.js'
import { Formatter } from '../../lib/Formatter.ts'
import { DisplayModeAirport, DisplayModeChoice } from '../../model/DisplayMode';

import AirportEdit from './AirportEdit.vue';
import Corner from './Corner.vue';
import CornerStatic from '../../components/shared/CornerStatic.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../../components/shared/Header.vue'
import PlaceHolder from '../../components/shared/PlaceHolder.vue'
import Runway from './Runway.vue'
import { Airport, Runway as RunwayModel } from '../../model/Airport.ts';

const defaultMode = DisplayModeAirport.OneRunway
const displayMode = ref(defaultMode)
const displaySelection = ref(false)
const emits = defineEmits(['expand','replace','update'])
const expanded = ref(false)
const editMode = ref(false)
const modesList = ref([
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.OneRunway, true),
    new DisplayModeChoice('Runway List', DisplayModeAirport.RunwayList),
    new DisplayModeChoice('Airport Diagram', DisplayModeAirport.Diagram, true),
])
const title = ref('')
const weatherFreq = ref('')
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const airportCode = ref('') // used during edit mode
const rwyList = ref<RunwayModel[]>([]) // used during runway selection
const rwySketch = ref('')
const allEndings = ref<HybridEnding[]>([]) // used when displaying all runways

const noRunway = new RunwayModel()
const selectedRunway = ref(noRunway)
const airportData = ref()
const patternMode = ref(0)
const runwayName = ref('')
const rwyOrientation = ref('')
const showHeadings = ref(true)

const defaultCornerFields = ['weather','twr','field','tpa','#FCD/P','#FGND','?Custom?Custom','#FUNICOM']
const defaultRwyOrientation = 'vertical'
const defaultPatternMode = 0
const defaultTitle = 'Airport'
const corners = ref(defaultCornerFields)
const unknownRunway = ref(false)

//-----------------------------------------------------
// Props Management
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
    span2: {type: Boolean, default: false},
})

interface AirportData {
    code: string
    rwy: string
    pattern: number
    corners: string[]
    rwyOrientation: string
    headings: boolean
    mode: DisplayModeAirport
}

// load props can happen on initial load or when settings are changed
// 1) Airport Code 2) Selected Runway 3) patternMode 4) Corners and 5) Runway orientation
function loadProps(newProps:any) {
    // console.log('[AirportTile.loadProps] ' + JSON.stringify(newProps))
    const params = newProps.params;
    if( !params) {
        console.log( 'Airport cannot load params ' + JSON.stringify(params))
        return
    }

    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    const code = params.code
    // Force edit mode if we don't have an airport yet
    if( !code) {
        title.value = defaultTitle
        editMode.value = true
        return
    }

    // #2 Runway
    runwayName.value = params?.rwy ?? ''

    // #3 Pattern mode
    patternMode.value = params?.pattern ?? defaultPatternMode

    // #3.5 Show headings
    showHeadings.value = params?.headings ?? true;

    // #4 Restore corner fields
    let cornerFields = params.corners
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
    rwyOrientation.value = params?.rwyOrientation ?? defaultRwyOrientation;

    // #6 display mode
    displayMode.value = params?.mode ?? defaultMode

    // load data for this airport
    title.value = "Loading " + code + '...'
    getAirport( code, true)
        .then(a => {
            // Refresh with that data to get immediate visuals
            const airport = Airport.copy(a)
            onNewAirport(airport)

            // is there a follow up request?
            if(!a || !a.promise) return;
            a.promise.then((outcome) => {
                // console.log( '[AirportTile.loadProps] outcome', JSON.stringify(outcome))
                // if data was not current, load new version
                if(!outcome.current && outcome.airport){
                    // console.log( '[AirportTile.loadProps] data was not current', JSON.stringify(outcome))
                    onNewAirport(outcome.airport)
                }
            })
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
    loadProps(props)
})

// End of props management
//--------------------------

function changeMode(newMode:DisplayModeAirport, expand:boolean=false) {
    // console.log('[AirportTile.changeMode]', newMode, editMode.value)
    displaySelection.value = false;
    displayMode.value = newMode
    // Edit mode is only needed when there is no airport
    editMode.value = !airportData.value

    updateData(expand)
}

class HybridEnding {
    name: string
    width: number
    length: number
    pattern: string
    freq: number
    constructor(name:string, width:number, length:number, pattern:string, freq:number) {
        this.name = name
        this.width = width
        this.length = length
        this.pattern = pattern
        this.freq = freq
    }
}


function getEnding(rwy:RunwayModel, endIndex:number, freq):HybridEnding {
    // console.log('getEnding ' + JSON.stringify(rwy) + ' / ' + ending)
    let output:HybridEnding
    try {
        const end = rwy.ends[endIndex]    
        const pattern = end.tp == 'L' ? 'LP' : 'RP'
        let frequency = 0
        if( 'freq' in rwy) {
            frequency = rwy.freq;
        } else if( freq) {
            frequency = freq.mhz
        }
        return new HybridEnding( end.name, rwy.width, rwy.length, pattern, frequency)
    } catch( error) {
        console.log('[AirportTile.getEnding]', error)
    }

    return new HybridEnding( '', 0, 0, '', 0)
}

// builds a list of all endings
function getEndings(rwys:RunwayModel[], freq):HybridEnding[] {
    const output:HybridEnding[] = []
    if( !rwys) return output;
    
    rwys.forEach((rwy) => {
        // console.log('[AirportTile.getEndings]', JSON.stringify(rwy))
        if( rwy.ends.length == 2) {
            // console.log('[AirportTile.getEndings]', JSON.stringify(rwy.ends))
            output.push( getEnding(rwy,0,freq))
            output.push( getEnding(rwy,1,freq))
        }
    })
    // sort endinds by name
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

function onExpand(mode:string) {
    // console.log('[AirportTile.onExpand]', mode)
    changeMode(mode as DisplayModeAirport, true)
}

// Toggle between edit mode and current mode
function onHeaderClick() {
    if(displaySelection.value) return;

    if(editMode.value) {
        editMode.value = false
        if( airportData.value){
            const airport = airportData.value
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
function onNewAirport(airport:Airport) {
    if( airport && 'rwys' in airport) {
        rwyList.value = airport.rwys
        showAirport(airport)
        if(displayMode.value == DisplayModeAirport.OneRunway) {
            showRunway( runwayName.value ?? airport.rwys[0].name)            
        }
    } else { // no data for this airport
        // console.log('No data came out of get airport ' + code)
        // Switch to edit mode
        title.value = 'Airport ?'
        editMode.value = true
    }
}

// Settings have been updated in edit mode
function onSettingsUpdate( newAirport:Airport, newRunway, newOrientation:string, newPatternMode, newShowHeadings) {
    // console.log( '[AirportTile.onSettingsUpdate] airport', JSON.stringify(newAirport))
    // console.log( '[AirportTile.onSettingsUpdate] newRunway', JSON.stringify(newRunway))
    // console.log( '[AirportTile.onSettingsUpdate] newOrientation', JSON.stringify(newOrientation))
    // console.log( '[AirportTile.onSettingsUpdate] newShowHeading', newShowHeadings)
    // Close edit mode
    editMode.value = false

    props.params.code = newAirport.code;
    airportData.value = newAirport;
    patternMode.value = newPatternMode;
    showHeadings.value = newShowHeadings
    rwyOrientation.value = newOrientation
    showAirport( newAirport)
    showRunway( newRunway)
    
    updateData()
}

function showAirport( airport:Airport) {
    // console.log( "[AirportTile.showAirport] Showing airport ", JSON.stringify(airport))
    if( airport == null) {
        // if airport data is missing, we switch to edit mode
        // console.log( 'Airport data missing')
        editMode.value = true
        return
    }
    airportData.value = airport;
    airportCode.value = airport.code
    allEndings.value = getEndings(airport.rwys, getFreqCtaf(airport.freq));
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    const weather = airport.getFreqWeather()
    weatherFreq.value = Formatter.frequency(weather)
    weatherType.value = weather ? weather.name : '-'

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
    rwySketch.value = airport.sketch
}

// Show a runway from its name in the airport
function showRunway(name:string) {
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
function updateData(expand:boolean=false) {
    const state:AirportData = {
        code: airportCode.value,
        rwy: runwayName.value,
        pattern: patternMode.value,
        corners: corners.value,
        rwyOrientation: rwyOrientation.value,
        headings: showHeadings.value,
        mode: displayMode.value
    }

    if( corners) { 
        state['corners'] = corners.value
    }
    // console.log( 'Airport widget updated with ' + JSON.stringify(airportParam));
    emits( expand ? 'expand' : 'update', state);
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
    background-color: rgba(255,255,255,0.5);
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
    cursor: pointer;
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

.rwySketch {
    height: var(--tile-content-height);
}
</style>