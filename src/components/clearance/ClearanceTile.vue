<template>
    <div class="tile">
        <Header :title="getTitle()" :left="true" :hideReplace="!displaySelection"
            @click="onMenuClick" @replace="emits('replace')"></Header>
        <DisplayModeSelection v-if="displaySelection" :modes="modesList" @selection="changeMode" />
        <div v-else-if="displayMode==DisplayMode.BoxV" class="tileContent clearance" @click="cycleMode">
            <div class="boxCleared box">
                <div class="tileBoxLabel">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="boxRouteV box">
                <div class="tileBoxLabel">Route</div>
                <div class="watermrk">R</div>
            </div>
            <div class="boxAltitudeV box">
                <div class="tileBoxLabel">Altitude</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxFrequencyV box">
                <div class="tileBoxLabel">Freq.</div>
                <div class="watermrk">F</div>
            </div>
            <div class="boxTransponder box">
                <div class="tileBoxLabel">Xpdr</div>
                <div class="watermrk">T</div>
            </div>
        </div>
        <DepartureContent v-else-if="displayMode==DisplayMode.Departure" @click="cycleMode" />
        <HoldingContent v-else-if="displayMode==DisplayMode.Hold" @click="cycleMode" />
        <CraftContent v-else @click="cycleMode"/>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CraftContent from './CraftContent.vue';
import DisplayModeSelection from '@/components/shared/DisplayModeSelection.vue';
import Header from '@/components/shared/Header.vue';
import HoldingContent from './HoldingContent.vue';
import DepartureContent from './DepartureContent.vue';

// Enum with display modes
enum DisplayMode {
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft = 'craft',
    Hold = 'hold',
}

const emits = defineEmits(['replace','update'])
const displayMode=ref(DisplayMode.Craft)
const modesList = ref([
    {label:'C R A F T', value:DisplayMode.Craft},
    {label:'Departure', value:DisplayMode.Departure},
    {label:'Vertical Boxes', value:DisplayMode.BoxV},
    {label:'Holding', value:DisplayMode.Hold},
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
    if( displayMode.value==DisplayMode.Hold) return 'Hold @'
    if( displayMode.value==DisplayMode.Departure) return 'Depart @'
    return 'Clearance @'
}

function loadProps(props:any) {
    // console.log('[Clearance.loadProps]', JSON.stringify(props))
    if( props.params && props.params.mode) {
        // for compatibility with old versions
        if(props.params.mode==DisplayMode.BoxH_deprecated) props.params.mode = DisplayMode.BoxV;
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
.box {
  position: relative;
}

.boxCleared {
    grid-column: 1;
    border-bottom: 1px dashed darkgrey;
    border-right: 1px dashed darkgrey;
}
.boxRouteV {
    grid-column: 1;
    grid-row: 2 / span 3;
    border-right: 1px dashed darkgrey;
}
.boxRouteH {
    grid-column: 1 / span 2;
    border-bottom: 1px dashed darkgrey;
}
.boxAltitudeV {
    grid-row: 1 / span 2;
    grid-column: 2;
    border-bottom: 1px dashed darkgrey;
}
.boxAltitudeH {
    grid-row: 3;
    grid-column: 1;
    border-bottom: 1px dashed darkgrey;
}
.boxExpectH {
    grid-row: 3;
    grid-column: 2;
    border-bottom: 1px dashed darkgrey;
}
.boxFrequencyV {
    grid-row: 3;
    grid-column: 2;
    border-bottom: 1px dashed darkgrey;
}
.boxFrequencyH {
    grid-row: 4;
    grid-column: 1;
    border-right: 1px dashed darkgrey;
}
.boxTransponder {
    grid-row: 4;
    grid-column: 2;
}

.clearance {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(4, 1fr);
}
.tileContent {
    cursor: pointer;
}

.watermrk {
    line-height: 1;
    font-weight:600;
    font-size: 30px;
    position:absolute;
    left: 2px;
    bottom: 2px;
    opacity: 0.2;
}
</style>