<template>
    <ChecklistPage v-if="type==PageType.checklist" :data="pageData" 
        @replace="onReplace" @update="onUpdate" :version="version" />
    <CoverPage v-else-if="type==PageType.cover" :data="pageData" 
        @replace="onReplace" @update="onUpdate" />
    <NavlogPage v-else-if="type==PageType.navLog" :data="pageData"
        @replace="onReplace" @update="onUpdate" @toast="onToast" />
    <TilePage v-else-if="type==PageType.tiles" :data="pageData" 
        @update="onUpdate" @toast="onToast" />
    <NotesPage v-else-if="type==PageType.notes" @replace="onReplace(PageType.selection)" />
    <ApproachPage v-else-if="type==PageType.approach" :data="pageData"
        @update="onUpdate" @replace="onReplace" @toast="onToast" />
    <DiagramPage v-else-if="type==PageType.diagram" :data="pageData"
        @update="onUpdate" @replace="onReplace" @toast="onToast" />
    <SelectionPage v-else @replace="onReplace" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { PageType } from '../../assets/Templates'

import ApproachPage from '../charts/ApproachPage.vue'
import ChecklistPage from '../checklist/ChecklistPage.vue'
import CoverPage from '../cover/CoverPage.vue'
import DiagramPage from '../charts/DiagramPage.vue'
import NavlogPage from '../navlog/NavlogPage.vue'
import NotesPage from '../notes/NotesPage.vue'
import SelectionPage from './SelectionPage.vue'
import TilePage from '../tiles/TilePage.vue'

import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const emits = defineEmits(['toast','update'])
const pageData = ref(null)
const pageIndex = ref(null)
const type = ref(PageType.tiles)
const version = ref(0)

const props = defineProps({
    data: { type: Object, default: null},
    index: { type: Number},
    ver: { type: Number, default: 0},
})

function loadProps(props) {
    // console.log('[Page.loadProps]', JSON.stringify(props.data))
    if(!props.data) return
    pageData.value = props.data.data ? props.data.data : null
    type.value = props.data.type ? props.data.type : null
    pageIndex.value = props.index;
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
        let newData = {}
        if(newType == PageType.tiles) {
            // create 6 empty tiles
            newData = []
            for(let index = 0; index<6; index++) {
                newData.push({id:index,name:'',data:{}})
            }
        }
        const newPageData = {type:newType,data:newData, index:pageIndex.value}
        // console.log('[Page.onReplace]', JSON.stringify(newPageData))
        emits('update', newPageData)
    } else {
        // confirm and show page selection
        confirm.require({
            message: 'Do you want to replace the current page and its settings?',
            header: 'Replace Page',
            rejectLabel: 'No',
            acceptLabel: 'Yes, Replace',
            accept: () => {
                type.value = PageType.selection
            }
        })
    }
}

function onToast(data) {
  emits('toast', data)
}

function onUpdate( newData) {
    // console.log('[Page.onUpdate]', JSON.stringify(newData))
    // enrich page data with type and index
    const newPageData = {type:type.value,data:newData,index:pageIndex.value}
    emits('update', newPageData)
}

</script>
