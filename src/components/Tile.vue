<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Header from './Header.vue';
import Airport from './Airport.vue';
import Atis from './Atis.vue'
import Notes from './Notes.vue';
import Clearance from './Clearance.vue';
import RadioFlow from './RadioFlow.vue';
import Button from 'primevue/button'

const emits = defineEmits(['update'])

const props = defineProps({
    widget: { type: Object, default: null},
})

const knownWidgets = ref([
    {'name':'Airport','tile':'airport'},
    {'name':'ATIS','tile':'atis'},
    {'name':'Clearance','tile':'clearance'},
    {'name':'Notes','tile':'notes'},
    {'name':'Radio flow','tile':'radios'},
])
const widget = ref({})

function updateWidgetName(newName = '') {
    widget.value = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    // console.log( "Widget emits update with " + JSON.stringify(widget.value))
    emits('update',widget.value)
}

// when a tile notifies us of an update, we notify the parent to save values
function onUpdate(params = '') {
    // keep same id and name, just refresh the param
    widget.value = { 'id':widget.value.id,'name': widget.value.name, 'data':params}
    emits('update',widget.value)
}

onMounted(() => {
    // console.log('Widget mounted')
    widget.value = props.widget
})

watch( props, async() => {
    // console.log("Widget props changed " + JSON.stringify(props));
    widget.value = props.widget
})


</script>

<template>
    <div v-if="!widget || widget.name==''" class="widget">
        <Header :title="'Tile Selection'" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="content list">
            <Button v-for="widget in knownWidgets" class="item" :label="widget.name"
                @click="updateWidgetName(widget.tile)"></Button>
        </div>
    </div>
    <Airport v-else-if="widget.name=='airport'" :params="widget.data" 
        @replace="updateWidgetName" @update="onUpdate" />
    <Atis v-else-if="widget.name=='atis'" @replace="updateWidgetName"/>
    <Clearance v-else-if="widget.name=='clearance'" @replace="updateWidgetName"/>
    <Notes v-else-if="widget.name=='notes'" @replace="updateWidgetName" />
    <RadioFlow v-else-if="widget.name=='radios'" :params="widget.data" 
        @replace="updateWidgetName" @update="onUpdate" />
    <!-- <List v-else-if="widget.name=='list'" @replace="updateWidgetName"/> -->
</template>

<style scoped>
.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-columns: 105px 105px;
    grid-template-rows: auto auto auto;
    /* width:220px; */
    height: 186px;
}
.item {
    font-size: 12px;
}
.widget {
  border: 1px solid darkgrey;
  font-family: Verdana, sans-serif;
  width: 240px;
  height: 240px;
}

</style>