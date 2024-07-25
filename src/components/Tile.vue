<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Header from './shared/Header.vue';
import Airport from './airport/Airport.vue';
import Atis from './atis/Atis.vue'
import Notes from './notes/Notes.vue';
import Clearance from './clearance/Clearance.vue';
import RadioFlow from './radios/RadioFlow.vue';
import SunLight from './sunlight/SunLight.vue';
import FuelBug from './fuel/FuelBug.vue';
import Button from 'primevue/button';


const emits = defineEmits(['update','toast'])

const props = defineProps({
    widget: { type: Object, default: null},
})

var state = {}
const widgetsList = ref([
    {'name':'Airport','tile':'airport', 'class':'double', 'tooltip':'Display runway and useful information'},
    {'name':'ATIS','tile':'atis', 'class':'', 'tooltip':'Write down ATIS information'},
    {'name':'Clearance','tile':'clearance', 'class':'', 'tooltip':'Write down clearance information'},
    {'name':'Fuel','tile':'fuel', 'class':'','tooltip':'Track your fuel consumption'},
    {'name':'Notes','tile':'notes', 'class':'', 'tooltip':'A blank tile to write stuff'},
    {'name':'Radios','tile':'radios', 'class':'', 'tooltip':'Radio frequencies'},
    {'name':'Sunlight','tile':'sunlight', 'class':'', 'tooltip':'Sunrise, Sunset, Civil Twilight...'},
])
const widget = ref({})

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
    state = JSON.parse( JSON.stringify(props.widget));
    // console.log( 'Tile loadProps ' + JSON.stringify(state  ))
    widget.value = props.widget
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
    state = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    widget.value = state
    // console.log( "Widget emits update with " + JSON.stringify(widget.value))
    emits('update',state)
}


</script>

<template>
    <div v-if="!widget || widget.name==''" class="widget">
        <Header :title="'Tile Selection'" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="content list">
            <Button v-for="widget in widgetsList" :label="widget.name" :class="widget.class" :title="widget.tooltip"
                @click="replaceWidget(widget.tile)"></Button>
        </div>
    </div>
    <Airport v-else-if="widget.name=='airport'" :params="widget.data" 
        @replace="replaceWidget" @update="onUpdate" />
    <Atis v-else-if="widget.name=='atis'" :params="widget.data"
        @replace="replaceWidget" @update="onUpdate"/>
    <Clearance v-else-if="widget.name=='clearance'" 
        @replace="replaceWidget"/>
    <FuelBug v-else-if="widget.name=='fuel'" :params="widget.data"
        @replace="replaceWidget" @update="onUpdate"/>  
    <Notes v-else-if="widget.name=='notes'" 
        @replace="replaceWidget" />
    <RadioFlow v-else-if="widget.name=='radios'" :params="widget.data" 
        @replace="replaceWidget" @update="onUpdate" @toast="onToast" />
    <SunLight v-else-if="widget.name=='sunlight'" :params="widget.data" 
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