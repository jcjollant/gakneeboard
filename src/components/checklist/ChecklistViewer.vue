<script setup>

import { onMounted, ref, watch } from 'vue'

const props = defineProps({
    items: { type: Object, default: [] },
    theme: { type: String, default: 'theme-yellow'},
    small: { type: Boolean, default : false},
})

const theme = ref('theme-yellow')
const small = ref(false)
const items = ref([])

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

<template>
    <div v-if="items.length > 0" v-for="(item, index) in items" class="checklist"
        :class="(index % 2) ? theme : ''">
        <div v-if="'s' in item" class="section spanned" :class="{'emergent': item.t =='emer','strong': item.t=='strong'}" >{{ item.s }}</div>
        <div v-else class="challenge" :class="{'smallFont': small, 'spanned':!('r' in item)}">{{ item.c }}</div>
        <div v-if="'r' in item" class="response" :class="{'smallFont': small}">{{ item.r }}</div>
    </div>
    <div v-else class="placeHolder" :class="{'smallPlaceHolder':small}">There are no items in this list yet<br>Click the header to customize</div>
</template>

<style scoped>
.challenge {
    text-align: left;
    padding-left: 10px;
    border-right: 1px solid lightgrey;
    height: 1.6rem;
}

.checklist {
    display: grid;
    grid-template-columns: 70% auto;
    line-height: 1.6rem;
    border-bottom: 1px solid lightgrey;
}

.placeHolder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.response {
    font-weight: bold;
}

.section {
    font-weight: bolder;
    color: darkgrey;
    background: white;
    grid-column: 1 / span 2;

}

.emergent {
    color: white;
    background: red;
}

.smallFont {
    font-size: 0.8rem;
    line-height: 1.5rem;
    height: 1.5rem;
}

.smallPlaceHolder {
    font-size: 0.8rem;
}

.spanned {
    grid-column: 1 / span 2
}

.strong {
    color:white;
}
.theme-yellow {
    background: lightyellow;
}
.theme-yellow .strong {
    background: darkorange;
}
.theme-blue {
    background: #b4c6e7;
}
.theme-blue .strong{
    background: blue;
}
.theme-green {
    background: #c6e0b4;
}
.theme-green .strong{
    background: darkgreen;
}
.theme-grey {
    background: #e9e9e9;
}
.theme-grey .strong {
    background: #666;
}

</style>