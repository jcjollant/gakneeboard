<template>
    <ChecklistPage v-if="type==PageType.checklist" :data="pageData" 
        @replace="onReplace" @update="onUpdate" />
    <CoverPage v-else-if="type==PageType.cover" :data="pageData" 
        @replace="onReplace" @update="onUpdate" />
    <NavlogPage v-else-if="type==PageType.navLog" :data="pageData"
        @replace="onReplace" @update="onUpdate" @toast="onToast" />
    <TilePage v-else-if="type==PageType.tiles" :data="pageData" 
        @update="onUpdate" @toast="onToast" />
    <NotesPage v-else-if="type==PageType.notes" @replace="onReplace(PageType.selection)" />
    <SelectionPage v-else @replace="onReplace" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { PageType } from '../assets/Templates'

import ChecklistPage from './checklist/ChecklistPage.vue'
import CoverPage from './cover/CoverPage.vue'
import NavlogPage from './navlog/NavlogPage.vue'
import SelectionPage from './SelectionPage.vue'
import TilePage from './tiles/TilePage.vue'

import { useConfirm } from 'primevue/useconfirm'
import NotesPage from './notes/NotesPage.vue'

const confirm = useConfirm()
const emits = defineEmits(['toast','update'])
const pageData = ref(null)
const type = ref(PageType.tiles)

const props = defineProps({
    data: { type: Object, default: null},
})

function loadProps(props) {
//   console.log('[Page.loadProps]', JSON.stringify(props.data))
    if(!props.data) return
  pageData.value = props.data.data ? props.data.data : null
  type.value = props.data.type ? props.data.type : null
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
    if(newType) {
        let newData = {}
        if(newType == PageType.tiles) {
            // create 6 empty tiles
            newData = []
            for(let index = 0; index<6; index++) {
                newData.push({id:index,name:'',data:{}})
            }
        }
        const newPageData = {type:newType,data:newData}
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
    // enrich with page type
    const newPageData = {type:type.value,data:newData}
    emits('update', newPageData)
}

</script>