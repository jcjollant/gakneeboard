<script setup>
import { ref } from 'vue'

import { PageType } from '../assets/Templates'

import Header from '../components/shared/Header.vue'

import Button from 'primevue/button'

const emits = defineEmits(['replace'])


const knownPages = ref([
    {'name':'Tiles','type':PageType.tiles, 'tooltip':'A 2x3 grid of customizable tiles like Airport, ATIS, Radios, ...'},
    {'name':'Checklist','type':PageType.checklist, 'tooltip':'A checklist you can customize'},
    {'name':'Cover','type':PageType.cover, 'tooltip':'A cover page for your stylish templates'},
    {'name':'NavLog','type':PageType.navLog, 'tooltip':'A Navigation Log with checkpoints and headings'},
])

function replacePage(type) {
    // console.log('[SelectionPage.replacePage]', type)
    emits('replace',type)
}


</script>

<template>
    <div class="contentPage">
        <Header :title="'Page Selection'" :clickable="false"></Header>
        <!-- <div class="widgetTitle">Tile Selection</div> -->
        <div class="list">
            <Button v-for="page in knownPages" :label="page.name" :title="page.tooltip"
                @click="replacePage(page.type)"></Button>
        </div>
    </div>
</template>

<style>
.list {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap:10px;
    padding-top: 50px;
}

</style>