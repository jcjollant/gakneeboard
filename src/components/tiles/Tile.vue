<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Header from '../shared/Header.vue';
import Airport from '../airport/Airport.vue';
import Atis from '../atis/Atis.vue'
import Notes from '../notes/Notes.vue';
import ChecklistTile from '../checklist/ChecklistTile.vue';
import Clearance from '../clearance/Clearance.vue';
import RadioFlow from '../radios/RadioFlow.vue';
import SunLight from '../sunlight/SunLight.vue';
import FuelBug from '../fuel/FuelBug.vue';

import Button from 'primevue/button';


const emits = defineEmits(['update','toast'])

const props = defineProps({
    tile: { type: Object, default: null},
})

var state = {}
const knownTiles = ref([
    {'name':'Airport','tile':'airport', 'class':'', 'tooltip':'Display runway and useful information'},
    {'name':'ATIS','tile':'atis', 'class':'', 'tooltip':'Write down ATIS information'},
    {'name':'Checklist','tile':'checklist', 'class':'', 'tooltip':'Short checklist'},
    {'name':'Clearance','tile':'clearance', 'class':'', 'tooltip':'Write down clearance information'},
    {'name':'Fuel','tile':'fuel', 'class':'','tooltip':'Track your fuel consumption'},
    {'name':'Notes','tile':'notes', 'class':'', 'tooltip':'A blank tile to write stuff'},
    {'name':'Radios','tile':'radios', 'class':'', 'tooltip':'Radio frequencies'},
    {'name':'Sunlight','tile':'sunlight', 'class':'', 'tooltip':'Sunrise, Sunset, Civil Twilight...'},
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

function onToast(data) {
    emits('toast', data)
}


</script>

<template>
    <div v-if="!tile || tile.name==''" class="tile">
        <Header :title="'Tile Selection'" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="content list">
            <Button v-for="tile in knownTiles" :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="onReplace(tile.tile)"></Button>
        </div>
    </div>
    <Airport v-else-if="tile.name=='airport'" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <Atis v-else-if="tile.name=='atis'" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>
    <ChecklistTile v-else-if="tile.name=='checklist'" :params="tile.data" 
        @replace="onReplace" @update="onUpdate"/>
    <Clearance v-else-if="tile.name=='clearance'" 
        @replace="onReplace"/>
    <FuelBug v-else-if="tile.name=='fuel'" :params="tile.data"
        @replace="onReplace" @update="onUpdate"/>  
    <Notes v-else-if="tile.name=='notes'" 
        @replace="onReplace" />
    <RadioFlow v-else-if="tile.name=='radios'" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" @toast="onToast" />
    <SunLight v-else-if="tile.name=='sunlight'" :params="tile.data" 
        @replace="onReplace" @update="onUpdate" />
    <!-- <List v-else-if="widget.name=='list'" @replace="updateWidgetName"/> -->
</template>

<style scoped>
.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-columns: 105px 105px;
    grid-template-rows: auto auto auto auto;
    height: 186px;
}

.double  {
    grid-column: 1 / span 2;
}

.tile {
    background-color: white;
}
</style>