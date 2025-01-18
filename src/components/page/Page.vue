<template>
    <ChecklistPage v-if="type==PageType.checklist" :data="pageData" 
        @replace="onReplace" @update="onUpdate" :version="version" />
    <CoverPage v-else-if="type==PageType.cover" :data="pageData" 
        @replace="onReplace" @update="onUpdate" />
    <NavlogPage v-else-if="type==PageType.navLog" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <TilePage v-else-if="type==PageType.tiles" :data="pageData" 
        @update="onUpdate" />
    <NotesPage v-else-if="type==PageType.notes" 
        @replace="onReplace(PageType.selection)" />
    <ApproachPage v-else-if="type==PageType.approach" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <DiagramPage v-else-if="type==PageType.diagram" :data="pageData"
        @replace="onReplace" @update="onUpdate"  />
    <LoadingPage v-else-if="type==PageType.loading" />
    <FlightNotesPage v-else-if="type==PageType.flightNotes" 
        @replace="onReplace" />
    <StripPage v-else-if="type==PageType.strips" :data="pageData"
        @replace="onReplace" @update="onUpdate" />
    <SelectionPage v-else @replace="onReplace" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { PageType } from '@/assets/PageType'

import ApproachPage from '../charts/ApproachPage.vue'
import ChecklistPage from '../checklist/ChecklistPage.vue'
import CoverPage from '../cover/CoverPage.vue'
import DiagramPage from '../charts/DiagramPage.vue'
import FlightNotesPage from '../clearance/FlightNotesPage.vue'
import NavlogPage from '../navlog/NavlogPage.vue'
import NotesPage from '../notes/NotesPage.vue'
import SelectionPage from './SelectionPage.vue'
import StripPage from '../strips/StripPage.vue'
import TilePage from '../tiles/TilePage.vue'

import { useConfirm } from 'primevue/useconfirm'
import LoadingPage from './LoadingPage.vue'

const confirm = useConfirm()
const emits = defineEmits(['update'])
const pageData = ref(null)
const type = ref(PageType.tiles)
const version = ref(0)

const props = defineProps({
    data: { type: Object, default: null},
    ver: { type: Number, default: 0},
})

function loadProps(props) {
    // console.log('[Page.loadProps]', JSON.stringify(props.data))
    if(!props.data) return
    pageData.value = props.data.data ? props.data.data : null
    type.value = props.data.type ? props.data.type : null
    version.value = props.ver;
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


// Page must be replaced with new type
function onReplace(newType=undefined) {
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
function onUpdate( newData) {
    // console.log('[Page.onUpdate]', JSON.stringify(newData))
    // enrich page data with type and index
    const newPageData = {type:type.value,data:newData}
    emits('update', newPageData)
}

function onUpdateType( newType) {
    pageData.value = {}
    type.value = newType
    const newPageData = {type:newType,data:{}}

    emits('update', newPageData)
}

</script>
