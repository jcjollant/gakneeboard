<script setup>
import { onMounted, ref, watch } from 'vue'

import { PageType } from '../assets/sheetData'

import ChecklistPage from './checklist/ChecklistPage.vue'
import CoverPage from './cover/CoverPage.vue'
import NavlogPage from './navlog/NavlogPage.vue'
import SelectionPage from './SelectionPage.vue'
import TilePage from './tiles/TilePage.vue'

const emits = defineEmits(['toast','update'])

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

const type = ref('tiles')
const pageData = ref(null)

// Page must be replaced with new type
function onReplace(type) {
    let newData = {}
    if(type == 'tiles') {
        // create 6 empty tiles
        newData = []
        for(let index = 0; index<6; index++) {
            newData.push({id:index,name:'',data:{}})
        }
    }
    const newPageData = {type:type,data:newData}
    // console.log('[Page.onReplace]', JSON.stringify(newPageData))
    emits('update', newPageData)
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

<template>
    <ChecklistPage v-if="type==PageType.checklist" :data="pageData" @update="onUpdate" />
    <CoverPage v-else-if="type==PageType.cover" :data="pageData" @replace="onReplace" @update="onUpdate" />
    <SelectionPage v-else-if="type==PageType.selection" @replace="onReplace" />
    <NavlogPage v-else-if="type==PageType.navLog" @replace="onReplace" />
    <TilePage v-else :data="pageData" @toast="onToast" @update="onUpdate" />
</template>

<style scoped>
</style>