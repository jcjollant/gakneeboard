<template>
    <div class="contentPage" :class="{'fullpage': isFullPage}">
        <Header :title="'Pick Your Page Style'" :replace="false" :clickable="false"></Header>
        <div class="topTwo">
            <div class="clickable preview" @click="replacePage(PageType.tiles)" :title="allPages[0].tooltip">
                <div>Tiles</div>
                <img src="/thumbnails/vfrflight.png"></img>
            </div>
            <div class="clickable preview" @click="replacePage(PageType.checklist)"  :title="allPages[2].tooltip">
                <div>Checklist</div>
                <img src="/thumbnails/page-checklist.png"></img>
            </div>
        </div>

        <div class="list">
            <div class="section wide">
                <!-- <Separator name="More Choices" class="separator" /> -->
                <!-- <div class="grid">
                    <FAButton v-for="page in [0,1,2]" :label="allPages[page].name" :title="allPages[page].tooltip" :icon="allPages[page].icon" class="grow"
                        @click="replacePage(allPages[page].type)"/>
                </div> -->
            </div>
            <template v-for="section in filteredSections">
                <div class="section">
                    <Separator :name="section.name" class="separator" />
                    <FAButton v-for="page in section.pages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                        @click="replacePage(page.type)"/>
                </div>
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
    debrief = 'Pre/Post Flight',
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

const sections = ref([
    // Section.composable,
    Section.navigation,
    Section.charts,
    Section.debrief,
    Section.cosmetics,
])

const allPages = ref([
    new PageItem('Tiles', PageType.tiles, 'border-all', 'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...', Section.composable, true, true),
    new PageItem('Strips', PageType.strips, 'bars', 'Customizable horizontal strips', Section.cosmetics, true, false),
    new PageItem('Checklist', PageType.checklist, 'list-check', 'A customizable checklist', Section.composable, true, true),
    new PageItem('Calculated NavLog', PageType.navLog, 'route', 'A Navigation Log with automated calculations', Section.navigation, true, false),
    new PageItem('Paper Navlog', PageType.paperNavlog, 'route', 'A Blank Template for hand built navlogs', Section.navigation, true, true),
    new PageItem('Airport Diagram', PageType.diagram, 'road-circle-check', 'Airport Diagram (FAA)', Section.charts, true, false),
    new PageItem('Instrument Approach', PageType.approach, 'plane-arrival', 'Instrument Approach Plates (FAA)', Section.charts, true, false),
    new PageItem('Personal Minimums', PageType.minimums, 'shield', 'Personal Minimums', Section.debrief, true, false),
    new PageItem('Flight Debrief', PageType.flightDebrief, 'pen-to-square', 'Debrief your flights per topic', Section.debrief, true, false),
    new PageItem('Notes', PageType.notes, 'pen-to-square', 'A blank page to write down instructions', Section.debrief, true, false),
    new PageItem('Cover', PageType.cover, 'image', 'A cover page for your stylish templates', Section.cosmetics, true, false),
    new PageItem('Blank', PageType.none, 'file', 'A blank page', Section.cosmetics, true, false)
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
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 10px;
    gap:10px;
    /* padding-top: 50px; */
}
.separator {
    font-weight: bold;
    color: black;
}
.topTwo {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    padding: 10px;
    font-weight: bold;
    color: black;
}
.section {
    display: flex;
    flex-flow: column;
    gap: 10px;
}
.section.wide {
    grid-column: 1 / span 2;
}
.section.wide .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}
.preview {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    border: 3px solid var(--bg);
    background-color: #f0f0f0;
    font-weight: bold;
    color: black;
}
.preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
}
</style>
