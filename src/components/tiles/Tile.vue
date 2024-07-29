<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Header from '../shared/Header.vue';
import Airport from '../airport/Airport.vue';
import Atis from '../atis/Atis.vue'
import Notes from '../notes/Notes.vue';
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
    {'name':'Airport','tile':'airport', 'class':'double', 'tooltip':'Display runway and useful information'},
    {'name':'ATIS','tile':'atis', 'class':'', 'tooltip':'Write down ATIS information'},
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

function replaceWidget(newName = '') {
    // widget.value = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    state = { 'id':tile.value.id,'name': newName.toLowerCase(), 'data':{}}
    tile.value = state
    // console.log( "Widget emits update with " + JSON.stringify(widget.value))
    emits('update',state)
}


</script>

<template>
    <div v-if="!tile || tile.name==''" class="widget">
        <Header :title="'Tile Selection'" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="content list">
            <Button v-for="tile in knownTiles" :label="tile.name" :class="tile.class" :title="tile.tooltip"
                @click="replaceWidget(tile.tile)"></Button>
        </div>
    </div>
    <Airport v-else-if="tile.name=='airport'" :params="tile.data" 
        @replace="replaceWidget" @update="onUpdate" />
    <Atis v-else-if="tile.name=='atis'" :params="tile.data"
        @replace="replaceWidget" @update="onUpdate"/>
    <Clearance v-else-if="tile.name=='clearance'" 
        @replace="replaceWidget"/>
    <FuelBug v-else-if="tile.name=='fuel'" :params="tile.data"
        @replace="replaceWidget" @update="onUpdate"/>  
    <Notes v-else-if="tile.name=='notes'" 
        @replace="replaceWidget" />
    <RadioFlow v-else-if="tile.name=='radios'" :params="tile.data" 
        @replace="replaceWidget" @update="onUpdate" @toast="onToast" />
    <SunLight v-else-if="tile.name=='sunlight'" :params="tile.data" 
        @replace="replaceWidget" @update="onUpdate" />
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

.widget {
  border: 1px solid darkgrey;
  font-family: Verdana, sans-serif;
  width: 240px;
  height: 240px;
}

</style>