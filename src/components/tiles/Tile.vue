<template>
    <div v-if="!tile || tile.name==''" class="tile">
        <Header :title="title" :replace="false" :clickable="false"></Header>
        <div class="tileContent list">
            <FAButton v-for="tile in knownTiles"
                :icon="tile.icon" 
                :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="onReplace(tile.tile)"/>
        </div>
    </div>
    <AirportTile v-else-if="tile.name==TileType.airport" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @expand="onExpand" />
    <AtisTile v-else-if="tile.name==TileType.atis" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @expand="onExpand"/>
    <ChecklistTile v-else-if="tile.name==TileType.checklist" :params="tile.data" 
        @replace="onReplace" @update="onUpdate"/>
    <IfrTile v-else-if="tile.name==TileType.clearance" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <Dummy v-else-if="tile.name==TileType.dummy" :params="tile.data"  />
    <FuelBug v-else-if="tile.name==TileType.fuel" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <NavlogTile v-else-if="tile.name==TileType.navlog" @replace="onReplace" />
    <NotesTile v-else-if="tile.name==TileType.notes" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @expand="onExpand" />
    <RadioTile v-else-if="tile.name==TileType.radios" :params="tile.data" :span2="tile.span2"
        @replace="onReplace" @update="onUpdate" @expand="onExpand" />
    <SunLight v-else-if="tile.name==TileType.sunlight" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import { TileType } from '../../model/TileType'

import Header from '../shared/Header.vue';
import AirportTile from '../airport/AirportTile.vue';
import AtisTile from '../atis/AtisTile.vue'
import ChecklistTile from '../checklist/ChecklistTile.vue';
import IfrTile from '../../components/clearance/IfrTile.vue';
import Dummy from './Dummy.vue';
import RadioTile from '../radios/RadioTile.vue';
import SunLight from '../sunlight/SunLight.vue';
import FuelBug from '../fuel/FuelBug.vue';
import FAButton from '../shared/FAButton.vue'
import NavlogTile from '../navlog/NavlogTile.vue';
import NotesTile from '../notes/NotesTile.vue';
import { TileData } from '../../model/TileData';

const emits = defineEmits(['update','expand'])

const props = defineProps({
    tile: { type: Object, default: null},
})

var state:TileData
const knownTiles = ref([
    {name:'Airport',tile:TileType.airport, class:'double', icon:'plane-departure', tooltip:'Display runway and useful information'},
    {name:'Notes',tile:TileType.notes, class:'', icon:'pen-to-square',  tooltip:'A blank tile to write stuff'},
    {name:'Weather',tile:TileType.atis, class:'', icon:'cloud-sun-rain', tooltip:'Write down ATIS information'},
    {name:'Checklist',tile:TileType.checklist, class:'', icon:'list-check', tooltip:'Short checklist'},
    {name:'Radios',tile:TileType.radios, class:'', icon:'headset',  tooltip:'Radio frequencies'},
    {name:'IFR',tile:TileType.clearance, class:'', icon:'plane-circle-check', tooltip:'Instrument Flying'},
    {name:'Sunlight',tile:TileType.sunlight, class:'', icon:'sun',  tooltip:'Sunrise, Sunset, Civil Twilight...'},
    {name:'Fuel',tile:TileType.fuel, class:'', icon:'gas-pump', tooltip:'Track your fuel consumption'},
    {name:'Navlog',tile:TileType.navlog, class:'', icon:'route',  tooltip:'Companion Tile to the Navlog Page'},
])
const selectedTile = ref(undefined)
const tile = ref({})
const defaultTitle = 'Tile Selection'
const title = ref(defaultTitle)

onMounted(() => {
    // console.log('Tile mounted')
    loadProps(props)
})

watch( props, async (newP, oldP) => {
    // console.log("Tile props changed " + JSON.stringify(props));
    // console.log("old:" + JSON.stringify(oldP) + '\nnew:' + JSON.stringify(newP));
    loadProps(props)
})

function loadProps( props) {
    state = JSON.parse( JSON.stringify(props.tile));
    // console.log( 'Tile loadProps ' + JSON.stringify(state  ))
    tile.value = props.tile
}

// replace a tile with a new one
function onReplace(newName = '', mode=undefined) {
    // console.log('[Tile.onReplace]', newName, mode)

    const tileName = newName.toLowerCase()
    // state = { id:tile.value.id,name: tileName, data:{}}
    state = new TileData(tileName)
    if(mode) state.data['mode'] = mode
    tile.value = state
    title.value = defaultTitle
    emits('update',state)
}

// when a tile notifies us of an update, we notify the parent to save values
function onUpdate(params=undefined) {
    // console.log('Tile on update ' + JSON.stringify(params))
    state = new TileData(state.name, params)
    emits('update',state)
}

function onExpand(params=undefined) {
    state = new TileData(state.name, params)
    emits('expand',state)
}

</script>

<style scoped>
.list {
    display: grid;
    padding: 10px;
    gap:5px;
    grid-template-columns: 110px 110px;
    grid-template-rows: repeat(5, 1fr);
    height: 186px;
}

.modesList {
    display: grid;
    padding: 10px;
    gap:5px;
    grid-template-rows: repeat(4, 1fr);
    height: 186px;
}

.double  {
    grid-column: 1 / span 2;
}

.tileName {
    line-height: 2.5rem;
}

</style>