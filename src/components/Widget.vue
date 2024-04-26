<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref, watch} from 'vue';
import Airport from './Airport.vue';
import Atis from './Atis.vue'
import Notes from './Notes.vue';
import List from './List.vue';

const emits = defineEmits(['loadWidget'])

const props = defineProps({
    widget: { type: Object, default: null},
})

const knownWidgets = ref(['Airport','ATIS','List','Notes'])
const widget = ref({})

function updateWidgetName(newName = '') {
    widget.value = { 'id':widget.value.id,'name': newName.toLowerCase(), 'data':{}}
    // console.log( "Widget emits loadWidget with " + JSON.stringify(widget.value))
    emits('loadWidget',widget.value)
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
        <div class="widgetTitle">Widget Selection</div>
        <div class="content list">
            <button v-for="widget in knownWidgets" class="item" @click="updateWidgetName(widget)">{{ widget }}</button>
        </div>
    </div>
    <Airport v-else-if="widget.name=='airport'" :params="widget.data" @reset="updateWidgetName" />
    <Atis v-else-if="widget.name=='atis'" @reset="updateWidgetName"/>
    <Notes v-else-if="widget.name=='notes'" @reset="updateWidgetName" />
    <List v-else-if="widget.name=='list'" @reset="updateWidgetName"/>
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