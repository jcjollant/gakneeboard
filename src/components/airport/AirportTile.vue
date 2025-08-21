
<template>
    <div class="tile">
        <CornerConfig :event="cornerConfigEvent" :airport="airportData" :runway="mainRunway" :index="cornerConfigIndex"
            @selection="onCornerUpdate" />
        <Header :title="title" :showReplace="editMode"
            @replace="emits('replace')" @display="displaySelection=!displaySelection" @title="onHeaderClick()"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList" :expandable="true" :expanded="expanded"
            @expand="onExpand" @keep="displaySelection=false" />
        <AirportEdit v-else-if="editMode" :airport="airportData" :config="config"
            @close="onHeaderClick()" @update="onSettingsUpdate" />
        <!-- <div class="compact" v-else-if="displayMode==DisplayModeAirport.FourRunways">
            <FourRunways :rwySettings="rwySettings"/>
        </div> -->
        <div class="tileContent" v-else> <!-- Runway Sketch or Diagram -->
            <div v-if="config?.code">
                <div v-if="displayMode==DisplayModeAirport.Diagram" class="aptDiagram clickable" @click="onHeaderClick()">
                    <PlaceHolder v-if="!aptDiagram || aptDiagram=='dne'" title="No Diagram" subtitle="Consider sending feedback" />
                    <img v-else class="aptDiagram" :src="aptDiagram" />
                </div>
                <div v-else><!-- Runway Sketch(es) -->
                    <div class="airportCode">{{config.code.toUpperCase()}}</div>
                    <div v-if="runwayViews.length==1" class="flex">
                        <RunwaySketch :settings="runwayViews[0]" class="clickable oneRunway" @click="onHeaderClick()"/>
                    </div>
                    <div v-else-if="runwayViews.length==2" class="clickable twoRunways" @click="onHeaderClick()">
                        <RunwaySketch :settings="runwayViews[0]" :small="true" class="smallRunway"/>
                        <RunwaySketch :settings="runwayViews[1]" :small="true" class="smallRunway"/>
                    </div>
                    <div v-else class="unknownRwy">Unknown Runway</div>
                </div>
                <div v-if="expanded" class="top left cornerColumn">
                    <Corner v-for="index in [0,4,6,2]" :airport="airportData" :data="corners[index]" :runway="mainRunway" :big="true" :class="['corner'+index]"
                        @click="onCornerEdit(index, $event)"/>
                </div>
                <div v-if="expanded" class="top right cornerColumn">
                    <Corner v-for="index in [1,5,7,3]" :airport="airportData" :data="corners[index]" :runway="mainRunway" :big="true" :class="['corner'+index]"
                        @click="onCornerEdit(index, $event)" />
                </div>
                <Corner v-if="!expanded" class="corner top left" :airport="airportData" :data="corners[0]" :runway="mainRunway" :flip="true" id="corner0"
                    @click="onCornerEdit(0, $event)" />
                <Corner v-if="!expanded" class="corner top right" :airport="airportData" :data="corners[1]"  :runway="mainRunway" :flip="true" id="corner1"
                    @click="onCornerEdit(1, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom left" :airport="airportData" :data="corners[2]"  :runway="mainRunway"  id="corner2"
                    @click="onCornerEdit(2, $event)"/>
                <Corner v-if="!expanded"  class="corner bottom right" :airport="airportData" :data="corners[3]"  :runway="mainRunway"  id="corner3"
                    @click="onCornerEdit(3, $event)"/>
            </div>
            <PlaceHolder v-else title="No Airport" />
        </div>
    </div>    
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import { getAirport } from '../../assets/data.js'
import { Formatter } from '../../lib/Formatter.ts'
import { DisplayModeAirport, DisplayModeChoice } from '../../model/DisplayMode';
import { Airport, Runway } from '../../model/Airport.ts';
import { AirportTileConfig } from './AirportTileConfig.ts';
import { RunwayOrientation } from './RunwayOrientation.ts';
import { RunwayViewSettings } from './RunwayViewSettings.ts';
import { TileData } from '../../model/TileData.ts';
import { TileType } from '../../model/TileType.ts';

import AirportEdit from './AirportEdit.vue';
import Corner from './Corner.vue';
import CornerConfig from './CornerConfig.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../../components/shared/Header.vue'
import PlaceHolder from '../../components/shared/PlaceHolder.vue'
import RunwaySketch from './RunwaySketch.vue'

const defaultMode = DisplayModeAirport.RunwaySketch
const displayMode = ref(defaultMode)
const displaySelection = ref(false)
const emits = defineEmits(['replace','update'])
const expanded = ref(false)
const editMode = ref(false)
const modesList = ref([
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.RunwaySketch, true, "Simplified vue of runway(s) with airport data"),
    new DisplayModeChoice('Airport Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data"),
])
const title = ref('')
const weatherFreq = ref('')
const weatherType = ref()
const elevation = ref()
const tpa = ref()
const airportCode = ref('') // shortcut to airportData.value.code
const aptDiagram = ref('')

const airportData = ref<Airport|undefined>(undefined)
const runwayViews = ref(<RunwayViewSettings[]>[])

const defaultCornerFields = ['weather','twr','field','#FGND','#FCD/P','tpa','?Custom?Custom','#FUNICOM']
const defaultPatternMode = 0
const defaultHeadings = true
const defaultTitle = 'Airport'
const config = ref<AirportTileConfig>(new AirportTileConfig())
const mainRunway = ref<Runway>(Runway.noRunway())
const corners = ref(defaultCornerFields)
const cornerConfigEvent = ref(undefined)
const cornerConfigIndex = ref(0)

//-----------------------------------------------------
// Props Management
const props = defineProps({
    params: { type: Object, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
    span2: {type: Boolean, default: false},
})

// load props can happen on initial load or when settings are changed
function loadProps(newProps:any) {
    // console.debug('[AirportTile.loadProps]', newProps)
    const params = newProps.params;
    if( !params) {
        console.warn( 'Airport cannot load params ' + JSON.stringify(params))
        return
    }

    // console.debug('Airport loadProps ' + JSON.stringify(newProps))
    let propsConfig = new AirportTileConfig()

    if( params.code) {
        propsConfig.code = params.code
    } else { // Force edit mode if we don't have an airport yet
        title.value = defaultTitle
        editMode.value = true
        return
    }
    
    // runway
    if( params.rwy) { // old format
        propsConfig.rwys = [params.rwy]
    } else { // new format, a list
        propsConfig.rwys = params.rwys
    }

    // Pattern mode
    propsConfig.pattern = params?.pattern ?? defaultPatternMode

    // Show headings
    propsConfig.headings = params?.headings ?? defaultHeadings;

    // Restore corner fields
    let cornerFields = params.corners
    if( !cornerFields) {
        // console.debug('AirportTile loading default cornerFields')
        cornerFields = defaultCornerFields;
    } 
    cornerFields.forEach( (field, index) => {
        // console.debug('[AirportTile.loadProps]', index)
        corners.value[index] = field
    })
    propsConfig.corners = corners.value
    // console.debug('AirportTile loaded corners ' + JSON.stringify(corners))

    // Rwy orientation
    propsConfig.rwyOrientation = params?.rwyOrientation ?? RunwayOrientation.Vertical;

    // Sisplay mode
    propsConfig.mode = params?.mode ?? defaultMode
    displayMode.value = propsConfig.mode;
    // console.debug('[AirportTile.loadProps] displayMode', displayMode.value)

    expanded.value = newProps.span2
    // console.debug('[AirportTile.loadProps] expanded', expanded.value)

    // Activate this new configuration
    config.value = propsConfig

    // Temporary title
    title.value = "Loading " + propsConfig.code + '...'

    // load data for this airport
    getAirport( propsConfig.code, true).then(a => {
        // Refresh with that data to get immediate visuals
        const airport = Airport.copy(a)

        showAirport(airport)
        // is there a follow up request?
        if(!a || !a.promise) {
            return
        } 

        a.promise.then((outcome) => {
            // console.debug( '[AirportTile.loadProps] outcome', JSON.stringify(outcome))
            // if data was not current, load new version
            if(!outcome.current && outcome.airport){
                // console.debug( '[AirportTile.loadProps] data was not current', JSON.stringify(outcome))
                const refreshedAirport = Airport.copy(outcome.airport)
                showAirport(refreshedAirport)
            }
        })
    })
}

onMounted(() => {
    // console.debug('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
})

watch( props, async() => {
    // console.debug("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

watch(displayMode, (newValue,oldValue) => {
    console.debug('[AirportTile.displayMode]', displayMode.value, newValue, oldValue)
    if(newValue == oldValue) return;
    
    displaySelection.value = false;
    config.value.mode = newValue;

    // Edit mode is only needed when there is no airport
    editMode.value = !airportData.value

    saveConfig()
})

// End of props management
//--------------------------


/**
 * Corner edition is being invoked, show the panel
 * @param index Corder
 */
function onCornerEdit(index:number, event) {
    // console.debug('[AirportTile.onCornerEdit]', index, event)
    cornerConfigEvent.value = event
    cornerConfigIndex.value = index
}

/**
 * An update has happened in a corner, memorize the value and bubble it up
 * @param {*} data 
 */
function onCornerUpdate( field:string) {
    // console.debug( 'onCornerUpdate ' + JSON.stringify(data))
    // prevent event processing in the component
    cornerConfigEvent.value = undefined
    if( field) {
        // update the source data
        corners.value[cornerConfigIndex.value] = field
        saveConfig();
    } else {
        console.warn('Missing data from corner update')
    }
}

function onExpand(newValue:boolean) {
    // console.debug('[AirportTile.onExpand]', newValue)
    expanded.value = newValue
    saveConfig()
}

// Toggle between edit mode and current mode
function onHeaderClick() {
    // do not toggle edit mode during display selection
    if(displaySelection.value) return;

    if(editMode.value) { // exit edit mode
        if( airportData.value){
            airportCode.value = airportData.value.code
        }
    }  
    editMode.value = !editMode.value
    updateTitle()
}    

// Settings have been updated in edit mode
// Show new Airport and runway(s)
function onSettingsUpdate( newAirport:Airport, newConfig:AirportTileConfig, save:boolean = true) {
    // console.debug('[AirportTile.onSettingsUpdate]', newAirport, newConfig, save)
    // Close edit mode and save config
    editMode.value = false
    config.value = newConfig

    if(save) {
        saveConfig()
    } else {
        showAirport(newAirport)
    }
}

/**
 * Parses new airport into global variables
 * @param airport
 */
function showAirport( airport:Airport) {
    // console.debug( "[AirportTile.showAirport] Showing airport ", JSON.stringify(airport))
    if( !airport) {
        // if airport data is missing, we switch to edit mode
        editMode.value = true
        title.value = 'Airport ?'
        return
    }
    airportData.value = airport;
    
    // title.value = airport.code + ":" + airport.name
    title.value = airport.name
    const weather = airport.getFreqWeather()
    weatherFreq.value = Formatter.frequency(weather)
    weatherType.value = weather ? weather.name : '-'

    // If traffic is runway specific, it will be overriden by showRunway
    elevation.value = Math.round(airport.elev).toString()
    tpa.value = Math.round(airport.elev + 1000).toString()
    aptDiagram.value = airport.sketch

    // get runway(s) data into runwayViews
    // console.debug('[AirportTile.showAirport] config', config.value)
    const conf = config.value
    if(conf && conf.rwys) {
        runwayViews.value = conf.rwys.map((rwyName, index) => {
            const rwyData = airport.rwys.find((rwy) => rwy.name == rwyName)
            // console.debug( '[AirportTile.showAirport] runway ', index, rwyData, conf)
            return new RunwayViewSettings(rwyData, conf.pattern, conf.rwyOrientation, undefined, conf.headings)
        })
    } else {
        runwayViews.value = []
    }

    // resolve main runway
    if( runwayViews.value.length > 0) {
        const rvs:RunwayViewSettings = runwayViews.value[0]
        if( rvs.runway) {
            mainRunway.value = Runway.copy(rvs.runway)
        }
    } else if(airport.rwys.length > 0) {
        mainRunway.value = Runway.copy(airport.rwys[0])
    } else {
        mainRunway.value = Runway.noRunway()
    }
}

// invoked whenever we want to save the current state
function saveConfig() {
    // console.debug('[AirportTile.saveConfig]', config.value)
    if( !config.value) {
        console.warn('[AirportTile.saveConfig] config is missing')
        return;
    }

    emits( 'update', new TileData( TileType.airport, config.value, expanded.value));
}

function updateTitle() {
    if(editMode.value) {
        if( displayMode.value == DisplayModeAirport.RunwaySketch){
            title.value = 'Select Airport and Rwy'
        } else {
            title.value = "Select Airport"
        }
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

.aptDiagram {
    height: var(--tile-content-height);
}
.oneRunway {
    width: var(--tile-content-width);
    height: var(--tile-content-height);
    /* margin: auto; */
}
.twoRunways {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: var(--tile-content-height);
}
.smallRunway {
    width: 120px;
    height: 150px;
}
</style>