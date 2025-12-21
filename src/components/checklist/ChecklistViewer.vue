<template>
    <div>
        <div v-if="items.length > 0" v-for="(item, index) in items" 
            class="item">
            <div v-if="item.section.length" class="section"
                :class="getClassSection(item)">{{ item.section }}</div>
            <div v-else :class="getClassChallenge(item,index)">{{ item.challenge }}</div>
            <div v-if="item.response.length" :class="getClassResponse(item,index)">{{ item.response }}</div>
        </div>
        <PlaceHolder v-else title="No Items" />
    </div>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import { Checklist, ChecklistItem } from '../../models/Checklist'

import PlaceHolder from '../shared/PlaceHolder.vue';

const props = defineProps({
    font: { type: String, default: 'font-medium'},
    list: { type: Checklist, required: true },
    theme: { type: String, default: 'theme-yellow'},
    // size: { type: Number, default: 1 },
})

const font = ref('font-medium')
const theme = ref('theme-yellow')
const items = ref<ChecklistItem[]>([])

// Use theme only when item is strong or line is event and theme is not blank
function getClassSection(item:ChecklistItem) {
    const output = [font.value];
    if( item.type=='strong') output.push(theme.value+'-strong')
    else if( item.type=='emer') output.push('emergent')
    else if( item.type!='blank') output.push('normal')
    return output
}

function getClassChallenge(item:ChecklistItem, index:number) {
    const output = ['challenge', font.value];
    if(item.response == '') output.push('spanned')
    if(item.type=='emer') output.push('important')
    // Every other item has the theme
    if(index%2 && item.type!='blank') output.push(theme.value)

    return output
}

function getClassResponse(item:ChecklistItem, index:number) {
    const output = ['response', font.value]
    if(item.type=='emer') output.push('important')
    // Every other item has the theme
    if(index%2) output.push(theme.value)
    return output
}

function loadProps(newProps:any) {
    // console.log('[ChecklistViewer.loadProps]', newProps)
    if(!newProps) return;
    font.value = newProps.font;
    theme.value = newProps.theme;
    items.value = newProps.list?.items;
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

</script>

<style scoped>
.challenge {
    text-align: left;
    padding-left: 10px;
}

.challenge.important, .response.important {
    color: red;
}

.item {
    display: grid;
    grid-template-columns: 70% auto;
}

.normal {
    color: black;
    border-top: 1px solid lightgrey;
    border-bottom: 1px solid lightgrey;
}

.response {
    font-weight: bold;
    border-left: 1px solid lightgrey;
}

.section {
    font-weight: bolder;
    grid-column: 1 / span 2;
    height: 23px;
    line-height: 21px;
}

.emergent {
    color: white;
    background: red;
    text-shadow: 2px 2px black;
}

.font-medium {
    line-height: 23px;
    height: 22px;
}

.font-small {
    line-height: 21px;
    height: 20px;
}

.font-smaller {
    line-height: 19px;
    height: 18px;
}

.font-large {
    line-height: 25px;
    height: 25px;

}

.font-larger {
    line-height: 28px;
    height: 28px;
}

.spanned {
    grid-column: 1 / span 2
}

.theme-blue {
    background: #b4c6e7;
}
.theme-blue-strong{
    color:white;
    background: blue;
}
.theme-green {
    background: #c6e0b4;
}
.theme-green-strong{
    color:white;
    background: darkgreen;
}
.theme-grey {
    background: #e9e9e9;
}
.theme-grey-strong {
    color:white;
    background: #666;
}
.theme-purple {
    background: #E9E;
}
.theme-purple-strong {
    color:white;
    background: purple;
}
.theme-red {
    background: pink;
}
.theme-red-strong {
    color:white;
    background: red;
    text-shadow: 2px 2px black;
}
.theme-yellow {
    background: lightyellow;
}
.theme-yellow-strong {
    color:white;
    background: darkorange;
}

</style>