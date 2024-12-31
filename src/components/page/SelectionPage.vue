<template>
    <div class="contentPage">
        <Header :title="'New Page Selection'" :replace="false" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="list">
            <Separator name="Basics" />
            <FAButton v-for="page in topPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
            <Separator name="Navigation" />
            <FAButton v-for="page in knownPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
            <Separator name="Charts" />
            <FAButton v-for="page in chartsPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
            <Separator name="Cosmetics" />
            <FAButton v-for="page in cosmeticPages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                @click="replacePage(page.type)"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { PageType } from '../../assets/PageType'

import Header from '../shared/Header.vue'
import FAButton from '../shared/FAButton.vue'
import Separator from './Separator.vue'

const emits = defineEmits(['replace'])

const topPages = ref([
    {name:'Tiles',type:PageType.tiles, icon:'border-all', tooltip:'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...'},
    {name:'Checklist',type:PageType.checklist, icon:'list-check', tooltip:'A customizable checklist'},
    {name:'Notes',type:PageType.notes, icon:'pen-to-square', tooltip:'A blank page to write down instructions'},
])
const knownPages = ref([
    {name:'NavLog',type:PageType.navLog, icon:'route', tooltip:'A Navigation Log with checkpoints and headings'},
    {name:'IFR Flight Notes',type:PageType.flightNotes, icon:'pen-to-square', tooltip:'Aviation101 IFR flight notes page'},
])
const chartsPages = ref([
    {name:'Airport Diagram',type:PageType.diagram, icon:'road-circle-check',tooltip:'Airport Diagram (FAA)'},
    {name:'Instrument Approach',type:PageType.approach, icon:'plane-arrival', tooltip:'Instrument Approach Plates (FAA)'},
])
const cosmeticPages = ref([
    {name:'Cover',type:PageType.cover, icon:'image', tooltip:'A cover page for your stylish templates'},
])

function replacePage(type) {
    // console.log('[SelectionPage.replacePage]', type)
    emits('replace',type)
}

</script>

<style scoped>
.list {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap:10px;
    /* padding-top: 50px; */
}
</style>