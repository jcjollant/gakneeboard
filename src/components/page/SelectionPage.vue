<script setup lang="ts">
import { ref } from 'vue'

import { PageType } from '../../assets/Templates'

import Header from '../shared/Header.vue'
import FAButton from '../shared/FAButton.vue'

const emits = defineEmits(['replace'])

const topPages = ref([
    {name:'Tiles',type:PageType.tiles, icon:'border-all', tooltip:'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...'},
    {name:'Checklist',type:PageType.checklist, icon:'list-check', tooltip:'A customizable checklist'},
])
const knownPages = ref([
    {name:'Airport Diagram',type:PageType.diagram, icon:'road-circle-check',tooltip:'Airport Diagram (FAA)'},
    {name:'Cover',type:PageType.cover, icon:'image', tooltip:'A cover page for your stylish templates'},
    {name:'Instrument Approach',type:PageType.approach, icon:'plane-arrival', tooltip:'Instrument Approach Plates (FAA)'},
    {name:'NavLog',type:PageType.navLog, icon:'route', tooltip:'A Navigation Log with checkpoints and headings'},
    {name:'Notes',type:PageType.notes, icon:'pen-to-square', tooltip:'A blank page to write down instructions'},
])

function replacePage(type) {
    // console.log('[SelectionPage.replacePage]', type)
    emits('replace',type)
}

</script>

<template>
    <div class="contentPage">
        <Header :title="'Page Selection'" :replace="false" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="list">
            <FAButton v-for="page in topPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
            <div class="separator"></div>
            <FAButton v-for="page in knownPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap:10px;
    /* padding-top: 50px; */
}
.separator {
    height: 1px;
    border: 1px solid lightblue;
    width: 20%;
    margin: 10px auto;
}
</style>