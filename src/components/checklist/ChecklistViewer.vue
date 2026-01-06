<template>
    <div>
        <div v-if="items.length > 0" v-for="(item, index) in items" 
            class="item">
            <div v-if="item.section.length" class="section"
                :class="getClassSection(item)" :style="getStyleSection(item)">{{ item.section }}</div>
            <div v-else :class="getClassChallenge(item,index)" :style="getStyleChallenge(item, index)">{{ item.challenge }}</div>
            <div v-if="item.response.length" :class="getClassResponse(item,index)" :style="getStyleResponse(item, index)">{{ item.response }}</div>
        </div>
        <PlaceHolder v-else title="No Items" />
    </div>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import { ChecklistFont, ChecklistItem, ChecklistItemType, ChecklistTheme, ChecklistThemeColors } from '../../models/Checklist'

import PlaceHolder from '../shared/PlaceHolder.vue';
import { ChecklistView } from '../../models/ChecklistView';

const props = defineProps({
    view: { type: ChecklistView, required: true },
})

const font = ref('font-'+ChecklistFont.medium)
const theme = ref<ChecklistTheme>(ChecklistTheme.yellow)
// const items = ref<ChecklistItem[]>([])
const items = ref<ChecklistItem[]>([])

// Use theme only when item is strong or line is event and theme is not blank
function getClassSection(item:ChecklistItem) {
    const output = [font.value];
    if( item.type==ChecklistItemType.strong) output.push('strong-section') // Changed from theme.value+'-strong'
    else if( item.type==ChecklistItemType.emergent) output.push('emergent')
    else if( item.type!=ChecklistItemType.blank) output.push('normal')
    return output
}

function getStyleSection(item: ChecklistItem) {
    if (item.type == ChecklistItemType.strong) {
        const colors = ChecklistThemeColors[theme.value];
        return {
            backgroundColor: colors.strong,
            color: colors.textStrong,
            textShadow: theme.value === ChecklistTheme.red ? '2px 2px black' : 'none' 
        }
    }
    return {}
}

function getClassChallenge(item:ChecklistItem, index:number) {
    const output = ['challenge', font.value];
    if(item.response == '') output.push('spanned')
    if(item.type==ChecklistItemType.emergent) output.push('important')
    return output
}

function getStyleChallenge(item: ChecklistItem, index: number) {
    // Every other item has the theme
    if(index % 2 && item.type != ChecklistItemType.blank) {
        return { backgroundColor: ChecklistThemeColors[theme.value].light }
    }
    return {}
}

function getClassResponse(item:ChecklistItem, index:number) {
    const output = ['response', font.value]
    if(item.type==ChecklistItemType.emergent) output.push('important')
    return output
}

function getStyleResponse(item: ChecklistItem, index: number) {
    // Every other item has the theme
    if(index % 2) {
        return { backgroundColor: ChecklistThemeColors[theme.value].light }
    }
    return {}
}

function loadProps(newProps:any) {
    // console.debug('[ChecklistViewer.loadProps]', newProps)
    const view:ChecklistView = newProps.view
    if(!view) return;
    font.value = 'font-'+view.font;
    items.value = view.items;
    theme.value = view.theme;
    // console.debug('[ChecklistViewer.loadProps] theme', theme.value, 'from', view.theme)
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



</style>