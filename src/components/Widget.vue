<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Airport from './Airport.vue';
import Atis from './Atis.vue'
import Notes from './Notes.vue';
// import List from './List.vue';
import Clearance from './Clearance.vue';

const emits = defineEmits(['update'])

const props = defineProps({
    widget: { type: Object, default: null},
})

const knownWidgets = ref(['Airport','ATIS','Clearance','Notes'])
const widget = ref({})

function updateWidgetName(newName = '') {
    widget.value = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    // console.log( "Widget emits update with " + JSON.stringify(widget.value))
    emits('update',widget.value)
}

function updateWidgetParam(params = '') {
    // keep same id and name, just refresh the param
    widget.value = { 'id':widget.value.id,'name': widget.value.name, 'data':JSON.parse(params)}
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
        <div class="widgetTitle">Tile Selection</div>
        <div class="content list">
            <button v-for="widget in knownWidgets" class="item" @click="updateWidgetName(widget)">{{ widget }}</button>
        </div>
    </div>
    <Airport v-else-if="widget.name=='airport'" :params="widget.data" @reset="updateWidgetName" @update="updateWidgetParam" />
    <Atis v-else-if="widget.name=='atis'" @replace="updateWidgetName"/>
    <Clearance v-else-if="widget.name=='clearance'" @replace="updateWidgetName"/>
    <Notes v-else-if="widget.name=='notes'" @replace="updateWidgetName" />
    <!-- <List v-else-if="widget.name=='list'" @replace="updateWidgetName"/> -->
</template>

<style scoped>
.list {
    display: grid;
    /* grid-template-columns: auto auto; */
}
.item {
    margin: 5px;
}
.widget {
  border: 1px solid darkgrey;
  font-family: Verdana, sans-serif;
}

</style>