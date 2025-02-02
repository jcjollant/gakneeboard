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
    <Airport v-else-if="tile.name==TileType.airport" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <Atis v-else-if="tile.name==TileType.atis" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <ChecklistTile v-else-if="tile.name==TileType.checklist" :params="tile.data" 
        @replace="onReplace" @update="onUpdate"/>
    <IfrTile v-else-if="tile.name==TileType.clearance" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <Dummy v-else-if="tile.name==TileType.dummy" :params="tile.data"  />
    <FuelBug v-else-if="tile.name==TileType.fuel" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <NavlogTile v-else-if="tile.name==TileType.navlog" @replace="onReplace" />
    <NotesTile v-else-if="tile.name==TileType.notes" :params="tile.data"
        @replace="onReplace" @update="onUpdate" />
    <RadioTile v-else-if="tile.name==TileType.radios" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <SunLight v-else-if="tile.name==TileType.sunlight" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import { TileType } from '../../model/TileType'

import Header from '../shared/Header.vue';
import Airport from '../airport/Airport.vue';
import Atis from '../atis/Atis.vue'
import ChecklistTile from '../checklist/ChecklistTile.vue';
import IfrTile from '../../components/clearance/IfrTile.vue';
import Dummy from './Dummy.vue';
import RadioTile from '../radios/RadioTile.vue';
import SunLight from '../sunlight/SunLight.vue';
import FuelBug from '../fuel/FuelBug.vue';
import FAButton from '../shared/FAButton.vue'
import NavlogTile from '../navlog/NavlogTile.vue';
import NotesTile from '../notes/NotesTile.vue';

const emits = defineEmits(['update'])

const props = defineProps({
    tile: { type: Object, default: null},
})

var state = {}
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
    state = { id:tile.value.id,name: tileName, data:{}}
    if(mode) state.data.mode = mode
    tile.value = state
    title.value = defaultTitle
    emits('update',state)
}

// when a tile notifies us of an update, we notify the parent to save values
function onUpdate(params = '') {
    // console.log('Tile on update ' + JSON.stringify(params))
    // keep same id and name, just refresh the param
    state = { 'id':state.id,'name': state.name, 'data':params}
    emits('update',state)
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