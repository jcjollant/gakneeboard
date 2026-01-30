<template>
    <div class="tile-wrapper">
    <div v-if="!tile || tile.name==''" class="tile">
        <Header :title="title" :replace="restorable" :clickable="restorable" :leftButton="''"
            @replace="tile=previousTile"></Header>
        <div class="tileContent list">
            <FAButton v-for="tile in knownTiles" class="tileButton"
                :icon="tile.icon" 
                :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="onReplace(tile.tile)"/>
        </div>
    </div>
    <AirportTile v-else-if="tile.name==TileType.airport" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @settings="emits('settings',tile)"/>
    <AtisTile v-else-if="tile.name==TileType.atis" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate"/>
    <ChecklistTile v-else-if="tile.name==TileType.checklist" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" @settings="emits('settings',tile)"/>
    <IfrTile v-else-if="tile.name==TileType.clearance" :params="tile.data"
        @replace="onReplace" @update="onUpdate" @settings="emits('settings',tile)"/>
    <Dummy v-else-if="tile.name==TileType.dummy" :params="tile.data"  />
    <RegulationsTile v-else-if="tile.name==TileType.regulations" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <Hold v-else-if="tile.name==TileType.hold" @replace="onReplace" @update="onUpdate" />
    <NavlogTile v-else-if="tile.name==TileType.navlog" @replace="onReplace" />
    <NotesTile v-else-if="tile.name==TileType.notes" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" />
    <RadioTile v-else-if="tile.name==TileType.radios" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @settings="emits('settings',tile)"/>
    <SunLight v-else-if="tile.name==TileType.sunlight" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <VfrTile v-else-if="tile.name==TileType.vfr" :params="tile.data"
        @replace="onReplace" @update="onUpdate" />
    <div v-if="captureMode" class="capture-overlay" @click.stop="emits('capture', index)" title="Click to Capture Image">
        <font-awesome-icon icon="camera" class="capture-icon" />
    </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { TileType } from '../../models/TileType'
import { TileData } from '../../models/TileData';

import Header from '../shared/Header.vue';
import AirportTile from '../airport/AirportTile.vue';
import AtisTile from '../atis/AtisTile.vue'
import ChecklistTile from '../checklist/ChecklistTile.vue';
import IfrTile from '../../components/clearance/IfrTile.vue';
import Dummy from './Dummy.vue';
import Hold from '../clearance/HoldTile.vue'
import RadioTile from '../radios/RadioTile.vue';
import SunLight from '../sunlight/SunLight.vue';
import RegulationsTile from '../regulations/RegulationsTile.vue';
import FAButton from '../shared/FAButton.vue'
import NavlogTile from '../navlog/NavlogTile.vue';
import NotesTile from '../notes/NotesTile.vue';
import VfrTile from '../vfr/VfrTile.vue';

const emits = defineEmits(['update','settings','capture', 'replacePage'])
const confirm = useConfirm()

const props = defineProps({
    tile: { type: Object, default: null},
    captureMode: { type: Boolean, default: false},
    index: { type: Number, default: -1}
})

var state:TileData
const knownTiles = ref([
    {name:'Airport',tile:TileType.airport, class:'double', icon:'plane-departure', tooltip:'Display runway and useful information'},
    {name:'Notes',tile:TileType.notes, class:'', icon:'pen-to-square',  tooltip:'A blank tile to write stuff'},
    {name:'Checklist',tile:TileType.checklist, class:'', icon:'list-check', tooltip:'Short checklist'},
    {name:'Weather',tile:TileType.atis, class:'', icon:'cloud-sun-rain', tooltip:'Write down ATIS information'},
    {name:'Radios',tile:TileType.radios, class:'', icon:'headset',  tooltip:'Radio frequencies'},
    {name:'IFR',tile:TileType.clearance, class:'', icon:'plane-circle-check', tooltip:'Instrument Flying'},
    {name:'VFR',tile:TileType.vfr, class:'', icon:'sun',  tooltip:'Visual Flying Rules'},
    {name:'Regs',tile:TileType.regulations, class:'', icon:'gavel', tooltip:'Aviation regulations and requirements'},
    {name:'Sunlight',tile:TileType.sunlight, class:'', icon:'clock',  tooltip:'Sunrise, Sunset, Civil Twilight...'},
    // {name:'Navlog',tile:TileType.navlog, class:'', icon:'route',  tooltip:'Companion Tile to the Navlog Page'},
])
const selectionTile = new TileData(TileType.selection)
const tile = ref(selectionTile)
const previousTile = ref(selectionTile)
const defaultTitle = 'Tile Selection'
const restorable = ref(false)
const title = ref(defaultTitle)

onMounted(() => {
    // console.debug('Tile mounted')
    loadProps(props)
})

watch( props, async (newP, oldP) => {
    // console.debug("Tile props changed " + JSON.stringify(props));
    // console.debug("old:" + JSON.stringify(oldP) + '\nnew:' + JSON.stringify(newP));
    loadProps(props)
})

function loadProps( props:any) {
    state = JSON.parse( JSON.stringify(props.tile));
    // console.debug( 'Tile loadProps ' + JSON.stringify(state  ))
    tile.value = props.tile
}

// replace current tile with a new one, which could be the selection tile
function onReplace(newName = TileType.selection, mode=undefined) {
    // console.debug('[Tile.onReplace]', newName, mode)
    
    // Intercept replace on the top right tile
    if( props.index == 1 && newName == TileType.selection) {
        confirm.require({
            message: 'Do you want to replace this Tile or the entire Page?',
            header: 'Replace Tile or Page',
            rejectLabel: 'Replace Page',
            acceptLabel: 'Replace Tile',
            accept: () => {
                performReplace(newName, mode)
            },
            reject: () => {
                emits('replacePage')
            }
        });
        return
    }

    performReplace(newName, mode)
}

function performReplace(newName = TileType.selection, mode=undefined) {
    const tileName = newName.toLowerCase()
    // state = { id:tile.value.id,name: tileName, data:{}}
    state = new TileData(tileName)
    if(mode) state.data['mode'] = mode

    if(newName == TileType.selection) {
        // console.debug('[Tile.onReplace]', tile.value)
        previousTile.value = tile.value
        restorable.value = true
    } else {
        // memorize new state if not selection
        emits('update',state)
    }
    // refect in the tile
    tile.value = state
    title.value = defaultTitle
}

// when a tile notifies us of an update, we notify the parent to save values
function onUpdate(newState:TileData) {
    // console.debug('[Tile.onUpdate]', newState)
    state = newState
    emits('update',state)
}

</script>

<style scoped>
.list {
    padding: 10px;
    display: grid;
    gap:5px;
    grid-template-columns: 110px 110px;
    grid-template-rows: repeat(6, 1fr);
}

.double  {
    grid-column: 1 / span 2;
}

/* .tileName {
    line-height: 2.5rem;
} */
.selection {
    padding: 10px;
    display: flex;
    flex-flow: column;
}
.tileButton {
    background-color: var(--tile-button-bg);
}
.tileButton:hover {
    background-color: var(--tile-button-hover);
}

.tile-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    height: var(--tile-height);
    width: var(--tile-width);
}

.tile-wrapper .span2 {
    width: var(--tile-span2);
}

.tile-wrapper > .tile {
    flex: 1;
    width: 100%;
}

.capture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
}

.capture-overlay:hover {
    opacity: 1;
}

.capture-icon {
    font-size: 3rem;
    filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
}

</style>