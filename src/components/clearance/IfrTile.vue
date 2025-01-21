<template>
    <div class="tile">
        <Header :title="getTitle()" :left="!displaySelection" :hideReplace="!displaySelection"
            @click="onMenuClick" @replace="emits('replace')"></Header>
        <DisplayModeSelection v-if="displaySelection" :modes="modesList" :activeMode="displayMode"
            @selection="changeMode" />
        <ApproachContent v-if="displayMode==DisplayMode.Approach" @click="cycleMode" />
        <DepartureContent v-else-if="displayMode==DisplayMode.Departure" @click="cycleMode" />
        <HoldingContent v-else-if="displayMode==DisplayMode.Hold" @click="cycleMode" />
        <CraftBoxedContent v-else @click="cycleMode" />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ApproachContent from './ApproachContent.vue';
import CraftBoxedContent from './CraftBoxedContent.vue';
import CraftContent from './CraftContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import HoldingContent from './HoldingContent.vue';
import DepartureContent from './DepartureContent.vue';

// Enum with display modes
enum DisplayMode {
    Approach = 'apch',
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft_deprecated = 'craft',
    Hold = 'hold',
}

const emits = defineEmits(['replace','update'])
const displayMode=ref(DisplayMode.Craft)
const modesList = ref([
    {label:'CRAFT Clearance', value:DisplayMode.BoxV},
    {label:'Approach', value:DisplayMode.Approach},
    {label:'Departure', value:DisplayMode.Departure},
    {label:'Hold', value:DisplayMode.Hold},
])
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)



function changeMode(newMode:DisplayMode) {
    displayMode.value = newMode;
    displaySelection.value = false;
    const params = {mode:newMode}
    emits('update', params)
}

function cycleMode() {
    // find index of current displayMode in modesList
    let index = modesList.value.findIndex((mode:any) => mode.value==displayMode.value) + 1
    if(index == modesList.value.length) index = 0
    // console.log('[ClearanceTile.cycleMode]', index)
    // change mode to the next in the list
    changeMode(modesList.value[index].value)
}

function getTitle() {
    if( displaySelection.value) return "IFR"
    if( displayMode.value==DisplayMode.Approach) return 'Approach @'
    if( displayMode.value==DisplayMode.Hold) return 'Hold @'
    if( displayMode.value==DisplayMode.Departure) return 'Depart @'
    return 'Clearance @'
}

function loadProps(props:any) {
    // console.log('[Clearance.loadProps]', JSON.stringify(props))
    if( props.params && props.params.mode) {
        // for compatibility with old versions
        if(props.params.mode==DisplayMode.BoxH_deprecated) props.params.mode = DisplayMode.BoxV;
        if(props.params.mode==DisplayMode.Craft_deprecated) props.params.mode = DisplayMode.BoxV;
        if(props.params.mode=="") props.params.mode = DisplayMode.BoxV;
        displayMode.value = props.params.mode
    } else {
        displayMode.value = DisplayMode.Craft
    }
}

function onMenuClick() {
    displaySelection.value = !displaySelection.value
}

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})
</script>

<style scoped>
</style>