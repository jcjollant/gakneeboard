<template>
    <div>
        <div v-if="items.length > 0" v-for="(item, index) in items" 
            class="item">
            <div v-if="'s' in item" class="section"
                :class="getClassSection(item)">{{ item.s }}</div>
            <div v-else :class="getClassChallenge(item,index)">{{ item.c }}</div>
            <div v-if="'r' in item" :class="getClassResponse(item,index)">{{ item.r }}</div>
        </div>
        <PlaceHolder v-else title="No Items" />
    </div>
</template>

<script setup>

import { onMounted, ref, watch } from 'vue'

import PlaceHolder from '../shared/PlaceHolder.vue';

const props = defineProps({
    items: { type: Object, default: [] },
    theme: { type: String, default: 'theme-yellow'},
    size: { type: Number, default: 1 },
})

const theme = ref('theme-yellow')
const size = ref(1)
const items = ref([])

// Use theme only when item is strong or line is event and theme is not blank
function getClassSection(item) {
    if( item.t=='strong') return theme.value+'-strong'
    else if( item.t=='emer') return 'emergent'
    else if( item.t=='blank') return ''
    return 'normal'
}

function getClassChallenge(item, index) {
    const output = ['challenge'];
    if(size.value > 1) output.push('size' + size.value)
    if(!('r' in item)) output.push('spanned')
    if(index%2) output.push(theme.value)
    return output
}

function getClassResponse(item, index) {
    const output = ['response']
    if(size.value > 1) output.push('size' + size.value)
    if(index%2) output.push(theme.value)
    return output
}

function loadProps(newProps) {
    // console.log('[ChecklistViewer.loadProps]', JSON.stringify(newProps))
    if(!newProps) return;
    theme.value = newProps.theme;
    size.value = newProps.size;
    items.value = newProps.items;
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
    height: 23px;
}

.item {
    display: grid;
    grid-template-columns: 70% auto;
    line-height: 23px;
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

.size2 {
    font-size: 0.8rem;
    line-height: 23px;
    height: 22px;
}

.size3 {
    font-size: 0.7rem;
    line-height: 19px;
    height: 19px;
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