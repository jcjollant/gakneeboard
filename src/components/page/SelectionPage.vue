<template>
    <div class="contentPage">
        <Header :title="'New Page Selection'" :replace="false" :clickable="false"></Header>
        <div class="list">
            <template v-for="section in sections">
                <Separator :name="section.name" />
                <FAButton v-for="page in section.pages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                    @click="replacePage(page.type)"/>
            </template>
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

const group1 = ref([
    {name:'Tiles',type:PageType.tiles, icon:'border-all', tooltip:'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...'},
    {name:'Strips',type:PageType.strips, icon:'bars', tooltip:'Customizable horizontal strips'},
    {name:'Checklist',type:PageType.checklist, icon:'list-check', tooltip:'A customizable checklist'},
])
const group2 = ref([
    {name:'NavLog',type:PageType.navLog, icon:'route', tooltip:'A Navigation Log with checkpoints and headings'},
    // {name:'IFR Flight Notes',type:PageType.flightNotes, icon:'pen-to-square', tooltip:'Aviation101 IFR flight notes page'},
])
const group3 = ref([
    {name:'Airport Diagram',type:PageType.diagram, icon:'road-circle-check',tooltip:'Airport Diagram (FAA)'},
    {name:'Instrument Approach',type:PageType.approach, icon:'plane-arrival', tooltip:'Instrument Approach Plates (FAA)'},
])
const group4 = ref([
    {name:'Cover',type:PageType.cover, icon:'image', tooltip:'A cover page for your stylish templates'},
    {name:'Notes',type:PageType.notes, icon:'pen-to-square', tooltip:'A blank page to write down instructions'},
    {name:'Blank',type:PageType.none, icon:'file', tooltip:'A blank page'},
])

const sections = ref([
    {name:'Composable', pages:group1},
    {name:'Navigation', pages:group2},
    {name:'Charts', pages:group3},
    {name:'Cosmetics', pages:group4}
])

function replacePage(type:PageType) {
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