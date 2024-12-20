<template>
    <div v-if="!tile || tile.name==''" class="tile">
        <Header :title="'Tile Selection'" :replace="false" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="tileContent list">
            <FAButton v-for="tile in knownTiles"
                :icon="tile.icon" 
                :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="onReplace(tile.tile)"/>

            <!-- <Button v-for="tile in knownTiles" 
                :icon="tile.icon"
                :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="onReplace(tile.tile)"></Button> -->
        </div>
    </div>
    <Airport v-else-if="tile.name==Tile.airport" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <Atis v-else-if="tile.name==Tile.atis" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <ChecklistTile v-else-if="tile.name==Tile.checklist" :params="tile.data" 
        @replace="onReplace" @update="onUpdate"/>
    <Clearance v-else-if="tile.name==Tile.clearance" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <Dummy v-else-if="tile.name==Tile.dummy" :params="tile.data"  />
    <FuelBug v-else-if="tile.name==Tile.fuel" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>  
    <NavlogTile v-else-if="tile.name==Tile.navlog" @replace="onReplace" />
    <NotesTile v-else-if="tile.name==Tile.notes" :params="tile.data"
        @replace="onReplace" @update="onUpdate" />
    <RadioTile v-else-if="tile.name==Tile.radios" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <SunLight v-else-if="tile.name==Tile.sunlight" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';

import { Tile } from '../../assets/Tile'

import Header from '../shared/Header.vue';
import Airport from '../airport/Airport.vue';
import Atis from '../atis/Atis.vue'
import ChecklistTile from '../checklist/ChecklistTile.vue';
import Clearance from '../clearance/Clearance.vue';
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
    {name:'Airport',tile:Tile.airport, class:'double', icon:'plane-departure', tooltip:'Display runway and useful information'},
    {name:'Weather',tile:Tile.atis, class:'', icon:'cloud-sun-rain', tooltip:'Write down ATIS information'},
    {name:'Checklist',tile:Tile.checklist, class:'', icon:'list-check', tooltip:'Short checklist'},
    {name:'Clearance',tile:Tile.clearance, class:'', icon:'plane-circle-check', tooltip:'Write down clearance information'},
    {name:'Fuel',tile:Tile.fuel, class:'', icon:'gas-pump', tooltip:'Track your fuel consumption'},
    {name:'Navlog',tile:Tile.navlog, class:'', icon:'route',  tooltip:'Companion Tile to the Navlog Page'},
    {name:'Notes',tile:Tile.notes, class:'', icon:'pen-to-square',  tooltip:'A blank tile to write stuff'},
    {name:'Radios',tile:Tile.radios, class:'', icon:'headset',  tooltip:'Radio frequencies'},
    {name:'Sunlight',tile:Tile.sunlight, class:'', icon:'sun',  tooltip:'Sunrise, Sunset, Civil Twilight...'},
])
const tile = ref({})

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
function onReplace(newName = '') {
    // widget.value = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    state = { 'id':tile.value.id,'name': newName.toLowerCase(), 'data':{}}
    tile.value = state
    // console.log( "Widget emits update with " + JSON.stringify(widget.value))
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
    grid-template-rows: auto auto auto auto;
    height: 186px;
}

.double  {
    grid-column: 1 / span 2;
}



</style>