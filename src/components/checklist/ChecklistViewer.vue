<template>
    <div v-if="items.length > 0" v-for="(item, index) in items" 
        class="checklist">
        <div v-if="'s' in item" class="section"
            :class="getClassSection(item)">{{ item.s }}</div>
        <div v-else :class="getClassChallenge(item,index)">{{ item.c }}</div>
        <div v-if="'r' in item" :class="getClassResponse(item,index)">{{ item.r }}</div>
    </div>
    <PlaceHolder v-else title="No Items" />
</template>

<script setup>

import { onMounted, ref, watch } from 'vue'

import PlaceHolder from '../shared/PlaceHolder.vue';

const props = defineProps({
    items: { type: Object, default: [] },
    theme: { type: String, default: 'theme-yellow'},
    small: { type: Boolean, default : false},
})

const theme = ref('theme-yellow')
const small = ref(false)
const items = ref([])

// Use theme only when item is strong or line is event and theme is not blank
function getClassSection(item) {
    if( item.t=='strong') return theme.value+'-strong'
    else if( item.t=='emer') return 'emergent'
    else if( item.t=='blank') return ''
    return 'normal'
}

function getClassChallenge(item, index) {
//class="challenge" :class="{'smallFont': small, 'spanned':!('r' in item)}
    const output = ['challenge'];
    if(small.value) output.push('smallFont')
    if(!('r' in item)) output.push('spanned')
    if(index%2) output.push(theme.value)
    return output
}

function getClassResponse(item, index) {
//class="response" :class="{'smallFont': small}"
    const output = ['response']
    if(small.value) output.push('smallFont')
    if(index%2) output.push(theme.value)
    return output
}

function loadProps(newProps) {
    // console.log('[ChecklistViewer.loadProps]', JSON.stringify(newProps))
    if(!newProps) return;
    theme.value = newProps.theme;
    small.value = newProps.small;
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

.checklist {
    display: grid;
    grid-template-columns: 70% auto;
    line-height: 23px;
    /* border-bottom: 1px solid lightgrey; */
}

.normal {
    color: black;
    /* background: lightgray; */
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

.smallFont {
    font-size: 0.8rem;
    line-height: 23px;
    height: 22px;
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