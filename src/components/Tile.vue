<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Header from './Header.vue';
import Airport from './airport/Airport.vue';
import Atis from './Atis.vue'
import Notes from './Notes.vue';
import Clearance from './Clearance.vue';
import RadioFlow from './RadioFlow.vue';
import Button from 'primevue/button'

const emits = defineEmits(['update'])

const props = defineProps({
    widget: { type: Object, default: null},
})

var state = {}
const knownWidgets = ref([
    {'name':'Airport','tile':'airport'},
    {'name':'ATIS','tile':'atis'},
    {'name':'Clearance','tile':'clearance'},
    {'name':'Notes','tile':'notes'},
    {'name':'Radios','tile':'radios'},
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
            <Button v-for="widget in knownWidgets" :label="widget.name"
                @click="replaceWidget(widget.tile)"></Button>
        </div>
    </div>
    <Airport v-else-if="widget.name=='airport'" :params="widget.data" 
        @replace="replaceWidget" @update="onUpdate" />
    <Atis v-else-if="widget.name=='atis'" :params="widget.data"
        @replace="replaceWidget" @update="onUpdate"/>
    <Clearance v-else-if="widget.name=='clearance'" 
        @replace="replaceWidget"/>
    <Notes v-else-if="widget.name=='notes'" 
        @replace="replaceWidget" />
    <RadioFlow v-else-if="widget.name=='radios'" :params="widget.data" 
        @replace="replaceWidget" @update="onUpdate" />
    <!-- <List v-else-if="widget.name=='list'" @replace="updateWidgetName"/> -->
</template>

<style scoped>
.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-columns: 105px 105px;
    grid-template-rows: auto auto auto;
    height: 186px;
}
.widget {
  border: 1px solid darkgrey;
  font-family: Verdana, sans-serif;
  width: 240px;
  height: 240px;
}

</style>