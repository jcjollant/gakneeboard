
<template>
    <div class="tile">
        <Header :title="title" :showReplace="editMode"
            @replace="emits('replace')" @display="displaySelection=!displaySelection" @title="onHeaderClick(0)"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList" :expandable="!expanded"
            @selection="changeMode" @expand="onExpand" />
        <AirportEdit v-else-if="editMode" :displayMode="displayMode" :airport="airportData" :rwySettings="rwySettings[rwyEditIndex]"
            @close="onHeaderClick(0)" @selection="onSettingsUpdate" />
        <div class="compact" v-else-if="displayMode==DisplayModeAirport.FourRunways">
            <FourRunways :rwySettings="rwySettings"/>
        </div>
        <div class="tileContent" v-else> <!-- One Runway or sketch -->
            <div v-if="airportCode">
                <div v-if="displayMode==DisplayModeAirport.Diagram" class="rwySketch clickable" @click="onHeaderClick(0)">
                    <PlaceHolder v-if="!rwySketch || rwySketch=='dne'" title="No Diagram" subtitle="Consider sending feedback" />
                    <img v-else class="rwySketch" :src="rwySketch" />
                </div>
                <div v-else><!-- One Runway-->
                    <div class="airportCode">{{airportCode}}</div>
                    <div v-if="!runways[0]" class="unknownRwy">Unknown Runway</div>
                    <Runway v-else :runway="runways[0]" :pattern="patternMode" :orientation="rwyOrientation" :headings="showHeadings"
                        class="clickable oneRunway" @click="onHeaderClick(0)"/>
                </div>
                <div v-if="expanded" class="top left cornerColumn">
                    <Corner v-for="index in [0,4,6,2]" :airport="airportData" :data="corners[index]" :runway="runways[0]" :big="true" :class="['corner'+index]"
                        @update="onCornerUpdate(index, $event)" />
                </div>
                <div v-if="expanded" class="top right cornerColumn">
                    <Corner v-for="index in [1,5,7,3]" :airport="airportData" :data="corners[index]" :runway="runways[0]" :big="true" :class="['corner'+index]"
                        @update="onCornerUpdate(index, $event)" />
                </div>
                <Corner v-if="!expanded" class="corner top left" :airport="airportData" :data="corners[0]" :runway="runways[0]" :flip="true"
                    @update="onCornerUpdate(0, $event)" />
                <Corner v-if="!expanded" class="corner top right" :airport="airportData" :data="corners[1]"  :runway="runways[0]" :flip="true"
                    @update="onCornerUpdate(1, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom left" :airport="airportData" :data="corners[2]"  :runway="runways[0]"
                    @update="onCornerUpdate(2, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom right" :airport="airportData" :data="corners[3]"  :runway="runways[0]"
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
import { RunwaySettings } from './RunwaySettings';

import AirportEdit from './AirportEdit.vue';
import Corner from './Corner.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import FourRunways from './FourRunways.vue';
import Header from '../../components/shared/Header.vue'
import PlaceHolder from '../../components/shared/PlaceHolder.vue'
import Runway from './Runway.vue'
import { Airport, TrafficPattern, Runway as RunwayModel } from '../../model/Airport.ts';

const defaultMode = DisplayModeAirport.OneRunway
const displayMode = ref(defaultMode)
const displaySelection = ref(false)
const emits = defineEmits(['expand','replace','update'])
const expanded = ref(false)
const editMode = ref(false)
const modesList = ref([
    new DisplayModeChoice('One Runway', DisplayModeAirport.OneRunway, true, "One Runway Sketch with airport data"),
    new DisplayModeChoice('Four Runways', DisplayModeAirport.FourRunways, false, "Four Runway Skectches w/o airport data"),
    new DisplayModeChoice('Airport Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data"),
])
const title = ref('')
const weatherFreq = ref('')
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const airportCode = ref('') // used during edit mode
const rwySketch = ref('')
const allEndings = ref<HybridEnding[]>([]) // used when displaying all runways

const noRunways = new Array<RunwayModel>(4).fill(new RunwayModel())
const runways = ref<RunwayModel[]>(noRunways)
const airportData = ref()
const patternMode = ref(0)
const rwyOrientation = ref('') // default runway orientation
const showHeadings = ref(true) // deault runway orientation

const defaultCornerFields = ['weather','twr','field','tpa','#FCD/P','#FGND','?Custom?Custom','#FUNICOM']
const defaultRwyOrientation = 'vertical'
const defaultPatternMode = 0
const defaultTitle = 'Airport'
const corners = ref(defaultCornerFields)
const rwyEditIndex = ref(0) // index of the runway currently being edited
const rwySettings = ref<RunwaySettings[]>([])

//-----------------------------------------------------
// Props Management
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
    span2: {type: Boolean, default: false},
})

interface AirportTileConfig {
    code: string
    rwys: string[]
    pattern: number
    corners: string[]
    rwyOrientation: string
    headings: boolean
    mode: DisplayModeAirport
}

// load props can happen on initial load or when settings are changed
function loadProps(newProps:any) {
    // console.log('[AirportTile.loadProps] ' + JSON.stringify(newProps))
    const params = newProps.params;
    if( !params) {
        console.log( 'Airport cannot load params ' + JSON.stringify(params))
        return
    }

    // console.log('Airport loadProps ' + JSON.stringify(newProps))
    const firstCode = params.code
    // Force edit mode if we don't have an airport yet
    if( !firstCode) {
        title.value = defaultTitle
        editMode.value = true
        return
    }
    
    // runway
    if( params.rwy) {

    }

    // Pattern mode
    patternMode.value = params?.pattern ?? defaultPatternMode

    // Show headings
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

    // How many airports do we need to restore?
    let airportCodes:String[] = []
    if( params.code) {
        airportCodes.push( params.code)
    } else if (params.codes) {
        airportCodes = params.codes
    }
    console.log('[AirportTile.loadProps] fetching airportCodes', airportCodes)

    // Temporary title
    const multipleAirports = displayMode.value == DisplayModeAirport.FourRunways
    const what = multipleAirports ? "Runways" : airportCodes[0]
    title.value = "Loading " + what + '...'

    // load data for th(i)ese airport
    airportCodes.forEach((code,index) => {
        if(index == 0 || multipleAirports) getAirport( code, true)
            .then(a => {
                // Refresh with that data to get immediate visuals
                const airport = Airport.copy(a)
                onNewAirport(airport, index)

                // is there a follow up request?
                if(!a || !a.promise) return;
                a.promise.then((outcome) => {
                    // console.log( '[AirportTile.loadProps] outcome', JSON.stringify(outcome))
                    // if data was not current, load new version
                    if(!outcome.current && outcome.airport){
                        // console.log( '[AirportTile.loadProps] data was not current', JSON.stringify(outcome))
                        onNewAirport(outcome.airport, index)
                    }
                })
            })
   });
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
function onHeaderClick(runwayIndex:number) {
    // do not toggle edit mode during display selection
    if(displaySelection.value) return;

    if(editMode.value) { // exit edit mode
        if( airportData.value){
            airportCode.value = airportData.value.code
        }    
    } else { // enter edit mode
        rwyEditIndex.value = runwayIndex
    }  
    editMode.value = !editMode.value
    updateTitle()
}    

// consider new airport data
function onNewAirport(airport:Airport, index:number) {
    if( airport && 'rwys' in airport) {
        if(displayMode.value == DisplayModeAirport.OneRunway && index == 0) {
            showAirport(airport)
            // Use runway name or default to first runway
            const runwayName = runways.value[index].name ?? airport.rwys[0].name
            showRunway( airport, runwayName, 0)
        } else if( displayMode.value == DisplayModeAirport.FourRunways) {
            // console.log('[AirportTile.onNewAirport] ' + airport.code + ' ' + index)
            rwySettings.value[index] = new RunwaySettings(runways.value[index], index)
        }

    } else { // no data for this airport
        // console.log('No data came out of get airport ' + code)
        // Switch to edit mode
        title.value = 'Airport ?'
        editMode.value = true
    }
    updateTitle()
}

// Settings have been updated in edit mode
function onSettingsUpdate( newAirport:Airport, newRunwaySettings:RunwaySettings) {
    // console.log( '[AirportTile.onSettingsUpdate] airport', JSON.stringify(newAirport))
    // console.log( '[AirportTile.onSettingsUpdate] newRunway', JSON.stringify(newRunway))
    // console.log( '[AirportTile.onSettingsUpdate] newOrientation', JSON.stringify(newOrientation))
    // console.log( '[AirportTile.onSettingsUpdate] newShowHeading', newShowHeadings)
    
    // Close edit mode
    editMode.value = false

    if( rwyEditIndex.value == 0) {
        props.params.code = newAirport.code;
        patternMode.value = newRunwaySettings.patternMode;
        showHeadings.value = newRunwaySettings.headings
        rwyOrientation.value = newRunwaySettings.orientation
        showAirport( newAirport)
    }
    if(newRunwaySettings.runway) showRunway( newAirport, newRunwaySettings.runway.name, rwyEditIndex.value)

    updateData()
    
}

/**
 * Parses new airport into global variables
 * @param airport
 */
function showAirport( airport:Airport) {
    // console.log( "[AirportTile.showAirport] Showing airport ", JSON.stringify(airport))
    if( !airport) {
        // if airport data is missing, we switch to edit mode
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

/**
 * Show a runway from its name in the airport
 * @param name Runway name e.g: '14L'
 */
function showRunway(airport:Airport, name:string, index:number) {
    // console.log( 'Airport showRunway ' + name)
    const rwyData = airport.rwys.find((rwy) => rwy.name == name)
    // console.log( '[AirportTile.showRunway]', JSON.stringify(rwyData))
    if( rwyData) {
        runways.value[index] = rwyData
    }
}

// invoked whenever we want to save the current state
function updateData(expand:boolean=false) {
    const state:AirportTileConfig = {
        code: airportCode.value,
        rwys : runways.value.map( (rwy) => { return rwy.name }),
        pattern: patternMode.value,
        corners: corners.value,
        rwyOrientation: rwyOrientation.value,
        headings: showHeadings.value,
        mode: displayMode.value
    }

    // TODO : save settings for other runways

    if( corners) { 
        state['corners'] = corners.value
    }
    // console.log( 'Airport widget updated with ' + JSON.stringify(airportParam));
    emits( expand ? 'expand' : 'update', state);
}

function updateTitle() {
    if(editMode.value) {
        if( displayMode.value == DisplayModeAirport.OneRunway){
            title.value = 'Select Runway'
        } else if(displayMode.value == DisplayModeAirport.FourRunways) {
            // Edit mode and four runways, show which runway is being looked after
            title.value = "Pick Runway " + (rwyEditIndex.value + 1)
        } else {
            title.value = "Select Airport"
        }
    } else if( displayMode.value == DisplayModeAirport.FourRunways){
        title.value = 'Four Runways'
    } else if( airportData.value) {
        title.value = airportData.value.name
    } else {
        title.value = 'Airport ?'
    }
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
    font-size: 2rem;
    line-height: 2rem;
    opacity: 0.10;
    position: absolute;
    width: 100%;
    z-index: 0;
    cursor: pointer;
/*    writing-mode: vertical-rl;*/
    left: 0;
    text-align: center;
}
/* .airportCode.left {
    writing-mode: sideways-lr;
    right: unset;
} */
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
.oneRunway {
    width: var(--tile-content-width);
    height: var(--tile-content-height);
}
</style>