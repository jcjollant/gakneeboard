<template>
    <BlankPage v-if="type==PageType.none" @replace="onReplace(PageType.selection)" />
    <ChecklistPage v-else-if="type==PageType.checklist" :data="pageData" :format="format"
        @replace="onReplace" @update="onUpdate" />
    <CoverPage v-else-if="type==PageType.cover" :data="pageData" 
        @replace="onReplace" @update="onUpdate" />
    <NavlogPage v-else-if="type==PageType.navLog" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <PaperNavlogPage v-else-if="type==PageType.paperNavlog" :data="pageData" :format="format"
        @replace="onReplace" @update="onUpdate" />
    <TilePage v-else-if="type==PageType.tiles" :data="pageData" :format="format"
        @update="onUpdate" />
    <NotesPage v-else-if="type==PageType.notes" 
        @replace="onReplace(PageType.selection)" />
    <ApproachPage v-else-if="type==PageType.approach" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <DiagramPage v-else-if="type==PageType.diagram" :data="pageData"
        @replace="onReplace" @update="onUpdate"  />
    <LoadingPage v-else-if="type==PageType.loading" :format="format" />
    <FlightDebriefPage v-else-if="type==PageType.flightDebrief" :data="pageData"
        @replace="onReplace" @update="onUpdate"  />
    <FlightNotesPage v-else-if="type==PageType.flightNotes" 
        @replace="onReplace" />
    <PersonalMinimumsPage v-else-if="type==PageType.minimums" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <StripPage v-else-if="type==PageType.strips" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <SelectionPage v-else @replace="onReplace" @load="onLoad" :format="format" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { PageType } from '../../assets/PageType'
import { TemplateFormat } from '../../models/TemplateFormat'
import { useConfirm } from 'primevue/useconfirm'

import ApproachPage from '../charts/ApproachPage.vue'
import BlankPage from './BlankPage.vue'
import ChecklistPage from '../checklist/ChecklistPage.vue'
import CoverPage from '../cover/CoverPage.vue'
import DiagramPage from '../charts/DiagramPage.vue'
import FlightDebriefPage from '../notes/FlightDebriefPage.vue'
import FlightNotesPage from '../clearance/FlightNotesPage.vue'
import LoadingPage from './LoadingPage.vue'
import NavlogPage from '../navlog/NavlogPage.vue'
import NotesPage from '../notes/NotesPage.vue'
import PaperNavlogPage from '../navlog/PaperNavlogPage.vue'
import PersonalMinimumsPage from './PersonalMinimumsPage.vue'
import SelectionPage from './SelectionPage.vue'
import StripPage from '../strips/StripPage.vue'
import TilePage from '../tiles/TilePage.vue'
import { DemoData } from '../../assets/DemoData'

const confirm = useConfirm()
const emits = defineEmits(['update'])
const pageData = ref({})
const type = ref(PageType.tiles)

const props = defineProps({
    data: { type: Object, default: null},
    format: { type: String, default: TemplateFormat.Kneeboard},
})

function loadProps(props:any) {
    // console.log('[Page.loadProps]', JSON.stringify(props.data))
    if(!props.data) {
        type.value = PageType.none
    } else {
        pageData.value = props.data.data ? props.data.data : null
        type.value = props.data.type ? props.data.type : null
    }
    // console.log('[Page.loadProps] version', props.ver)
}

onMounted(() => {
    // console.log('Tile mounted')
    loadProps(props)
})

watch( props, async(newP, oldP) => {
    // console.log('[Page.watch]', newP, oldP);
    loadProps(props)
})

function onLoad(index:number) {
    const newPageData = DemoData.getPage(index)
    emits('update', newPageData)
}


// Page must be replaced with new type
function onReplace(newType:string|undefined=undefined) {
    // console.log('[Page.onReplace]', newType)
    if(newType) {
        onUpdateType(newType)
    } else {
        // confirm and show page selection
        confirm.require({
            message: 'Do you want to replace the current page and its settings?',
            header: 'Replace Page',
            rejectLabel: 'No',
            acceptLabel: 'Yes, Replace',
            accept: () => {
                onUpdateType(PageType.selection)
            }
        })
    }
}

/**
 * Page Data has been updated
 * @param newData 
 */
function onUpdate( newData:any) {
    // console.debug('[Page.onUpdate]', JSON.stringify(newData))
    // enrich page data with type and index
    const newPageData = {type:type.value,data:newData}
    emits('update', newPageData)
}

function onUpdateType( newType:string) {
    pageData.value = {}
    type.value = newType
    const newPageData = {type:newType,data:{}}

    emits('update', newPageData)
}

</script>
