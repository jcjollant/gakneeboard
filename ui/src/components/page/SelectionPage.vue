<template>
    <div class="contentPage" :class="{'fullpage': isFullPage}">
        <Header :title="'Pick Your Page Style'" :replace="false" :clickable="false"></Header>
         
        <div class="template-grid" :class="{ 'expanded': isExpanded }">
             <div class="clickable preview" v-for="template in allTemplates" :title="template.tooltip" @click="loadPage(template.demoPage)">
                <div>{{ template.name }}</div>
                <img :src="template.thumbnail"></img>
            </div>
        </div>

        <div v-if="isExpanded" class="list">
            <div class="section wide">
                <Separator name="Composable"/>
           </div>
             <div class="section wide grid">
                <FAButton v-for="page in [0,2]" :label="allPages[page].name" :title="allPages[page].tooltip" :icon="allPages[page].icon" class="grow"
                    @click="replacePage(allPages[page].type)"/>
            </div>
            <template v-for="section in filteredSections">
                <div class="section">
                    <Separator :name="section.name" :level="1"/>
                    <FAButton v-for="page in section.pages" :label="page.name" :title="page.tooltip" :icon="page.icon"
                        @click="replacePage(page.type)"/>
                </div>
            </template>
        </div>

        <div class="footer-toggle">
             <div v-if="canDelete" class="delete-btn" @click="emits('delete')" title="Delete Page">
                <font-awesome-icon :icon="['fas', 'trash']" />
             </div>
             <div class="more-btn clickable" @click="isExpanded = !isExpanded">
                {{ isExpanded ? 'Less...' : 'More...' }}
             </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { PageType } from '../../assets/PageType'
import { TemplateFormat } from '@gak/shared'

import Header from '../shared/Header.vue'
import FAButton from '../shared/FAButton.vue'
import Separator from '../shared/Separator.vue'
import { DemoData } from '../../assets/DemoData'

const props = defineProps({
    format: { type: String, default: TemplateFormat.Kneeboard },
    canDelete: { type: Boolean, default: true }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)

const emits = defineEmits(['replace', 'load', 'delete'])

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

class TemplateItem {
    name: string;
    thumbnail: string;
    tooltip: string;
    demoPage: number;
    constructor(name: string, thumbnail: string, tooltip: string, demoPage: number) {
        this.name = name
        this.thumbnail = thumbnail
        this.tooltip = tooltip
        this.demoPage = demoPage
    }
}

const allTemplates = ref([
    new TemplateItem('VFR Flight', '/thumbnails/vfrflight.png', 'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...', DemoData.VFRFlightPage),
    new TemplateItem('IFR Training', '/thumbnails/ifrflight.png', 'A 2x3 grid of customizable tiles  with Departure, Radios, Weather and Notes', DemoData.IFRTrainingPage),
    new TemplateItem('IFR Strips', '/thumbnails/ifr-strips.png', 'A customizable page of horizontal strips tuned for IFR flying', DemoData.IFRStripsPage),
    new TemplateItem('Checklist', '/thumbnails/checklist-1.png', 'A full page checklist', DemoData.ChecklistPage),
    new TemplateItem('Long Checklist', '/thumbnails/checklist-3.png', 'A high capacity checklist with 3 columns', DemoData.LongChecklistPage),
    new TemplateItem('Airport Diagram', '/thumbnails/airport-diagram.png', 'The official FAA airport diagram', DemoData.AirportDiagramPage),
])

const allPages = ref([
    new PageItem('Tiles', PageType.tiles, 'border-all', 'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...', Section.composable, true, true),
    new PageItem('Strips', PageType.strips, 'bars', 'Customizable horizontal strips', Section.cosmetics, true, false),
    new PageItem('Checklist', PageType.checklist, 'list-check', 'A customizable checklist', Section.composable, true, true),
    new PageItem('Calculated NavLog', PageType.navLog, 'route', 'A Navigation Log with automated calculations', Section.navigation, true, false),
    new PageItem('Paper Navlog', PageType.paperNavlog, 'route', 'A Blank Template for hand built navlogs', Section.navigation, true, true),
    new PageItem('Diagram & Supplement', PageType.diagram, 'road-circle-check', 'Airport Diagram (FAA)', Section.charts, true, false),
    new PageItem('Instrument Approach', PageType.approach, 'plane-arrival', 'Instrument Approach Plates (FAA)', Section.charts, true, false),
    new PageItem('Personal Minimums', PageType.minimums, 'shield', 'Personal Minimums', Section.debrief, true, false),
    new PageItem('Flight Debrief', PageType.flightDebrief, 'pen-to-square', 'Debrief your flights per topic', Section.debrief, true, false),
    new PageItem('Notes', PageType.notes, 'pen-to-square', 'A blank page to write down instructions', Section.debrief, true, false),
    new PageItem('Cover', PageType.cover, 'image', 'A cover page for your stylish templates', Section.cosmetics, true, false),
    new PageItem('Blank', PageType.none, '', 'A blank page', Section.cosmetics, true, false)
])

const isExpanded = ref(localStorage.getItem('selection_page_expanded') === 'true')

watch(isExpanded, (val: boolean) => {
    localStorage.setItem('selection_page_expanded', val.toString())
})

const availableTemplates = computed(() => {
    return allPages.value.filter(page => isFullPage.value ? page.fullPage : page.smallPage)
})

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

function loadPage(index: number) {
    emits('load', index)
}

function replacePage(type:PageType) {
    // console.log('[SelectionPage.replacePage]', type)
    emits('replace',type)
}

</script>

<style scoped>
.template-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: min-content; /* Ensure rows don't stretch unnecessarily */
    padding: 10px;
    gap: 10px;
    flex: 1; /* Allow it to fill space */
    overflow-y: auto; /* Make it scrollable if it gets too long */
    transition: flex 0.3s ease;
}

.template-grid.expanded {
    flex: 0 0 auto; /* Stop it from taking all space */
    padding: 5px;
    gap: 5px;
}

.template-grid.expanded .preview {
    height: 140px; /* Further reduced height */
    padding: 5px;
    gap: 2px;
    font-size: 12px;
}

.template-grid.expanded .preview img {
    object-position: top;
    object-fit: cover;
    height: 95px; /* Force image height */
}

.list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 20px 10px 10px 10px;
    gap:10px;
    /* padding-top: 50px; */
    overflow-y: auto;
}

.section {
    display: flex;
    flex-flow: column;
    gap: 8px;
}
.section.wide {
    grid-column: 1 / span 2;
}
.section.wide.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
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
    transition: height 0.3s ease;
}
.preview img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Changed to contain to show full thumbnail */
    border-radius: 5px;
    transition: height 0.3s ease;
}

.footer-toggle {
    display: flex;
    justify-content: center;
    padding: 10px;
    position: relative;
    border-top: 1px solid var(--border);
    margin-top: auto; /* Push to bottom if parent is flex-col */
    min-height: 50px;
    flex-shrink: 0; /* Ensure footer doesn't shrink */
}

.delete-btn {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: var(--danger, #ff4444);
    cursor: pointer;
}
.delete-btn:hover {
    color: red;
}

.more-btn {
    background-color: var(--bg);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
}

.contentPage {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
