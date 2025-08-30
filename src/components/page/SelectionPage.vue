<template>
    <div class="contentPage" :class="{'fullpage': isFullPage}">
        <Header :title="'New Page Selection'" :replace="false" :clickable="false"></Header>
        <div class="list">
            <template v-for="section in filteredSections">
                <Separator :name="section.name" />
                <FAButton v-for="page in section.pages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                    @click="replacePage(page.type)"/>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { PageType } from '../../assets/PageType'
import { TemplateFormat } from '../../model/TemplateFormat'

import Header from '../shared/Header.vue'
import FAButton from '../shared/FAButton.vue'
import Separator from './Separator.vue'

const props = defineProps({
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)

const emits = defineEmits(['replace'])

enum Section {
    composable = 'Composable',
    navigation = 'Navigation',
    charts = 'Charts',
    cosmetics = 'Cosmetics'
}

class PageItem {
    name: string
    type: PageType
    icon: string
    tooltip: string
    smallPage: boolean
    fullPage: boolean
    section: Section
    constructor(name: string, type: PageType, icon: string, tooltip: string, section: Section, smallPage: boolean, fullPage: boolean) {
        this.name = name
        this.type = type
        this.icon = icon
        this.tooltip = tooltip
        this.section = section
        this.smallPage = smallPage
        this.fullPage = fullPage
    }
}

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
    Section.composable,
    Section.navigation,
    Section.charts,
    Section.cosmetics,
])

const allPages = ref([
    new PageItem('Tiles', PageType.tiles, 'border-all', 'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...', Section.composable, true, true),
    new PageItem('Strips', PageType.strips, 'bars', 'Customizable horizontal strips', Section.composable, true, false),
    new PageItem('Checklist', PageType.checklist, 'list-check', 'A customizable checklist', Section.composable, true, true),
    new PageItem('Calculated NavLog', PageType.navLog, 'route', 'A Navigation Log with automated calculations', Section.navigation, true, false),
    new PageItem('Paper Navlog', PageType.paperNavlog, 'route', 'A Blank Template for hand built navlogs', Section.navigation, true, true),
    new PageItem('Airport Diagram', PageType.diagram, 'road-circle-check', 'Airport Diagram (FAA)', Section.charts, true, false),
    new PageItem('Instrument Approach', PageType.approach, 'plane-arrival', 'Instrument Approach Plates (FAA)', Section.charts, true, false),
    new PageItem('Cover', PageType.cover, 'image', 'A cover page for your stylish templates', Section.cosmetics, true, false),
    new PageItem('Notes', PageType.notes, 'pen-to-square', 'A blank page to write down instructions', Section.cosmetics, true, false),
    new PageItem('Blank', PageType.none, 'file', 'A blank page', Section.cosmetics, false, false)
])

// Filter sections based on format
const filteredSections = computed(() => {
    return sections.value.map( section => {
        // filter pages that belong in the section and support the page format
        const filteredPages = allPages.value.filter(page => 
            page.section === section && 
            (isFullPage.value ? page.fullPage : page.smallPage)
        )

        return filteredPages.length == 0 ? null : {name:section, pages:filteredPages}
    }).filter(section => section !== null)
})

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
