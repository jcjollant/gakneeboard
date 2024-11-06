<template>
    <div class="tile">
        <Header :title="'Clearance @'" :left="true" :hideReplace="!settingMode"
            @click="onMenuClick" @replace="emits('replace')"></Header>
        <div v-if="settingMode" class="settingsList">
            <Button label="Just CRAFT" @click="changeMode('craft')"></Button>
            <Button label="Vertical Boxes" @click="changeMode('boxV')"></Button>
            <Button label="Horizontal Boxes" @click="changeMode('boxH')"></Button>
        </div>
        <div v-else-if="displayMode=='craft'" class="tileContent modeCraft" @click="cycleMode">
            <div class="craftWatermark">C</div>
            <div class="craftWatermark">R</div>
            <div class="craftWatermark">A</div>
            <div class="craftWatermark">F</div>
            <div class="craftWatermark">T</div>
        </div>
        <div v-else-if="displayMode=='boxV'" class="tileContent clearance" @click="cycleMode">
            <div class="boxCleared box">
                <div class="label">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="boxRouteV box">
                <div class="label">Route</div>
                <div class="watermrk">R</div>
            </div>
            <div class="boxAltitudeV box">
                <div class="label">Altitude</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxFrequencyV box">
                <div class="label">Freq.</div>
                <div class="watermrk">F</div>
            </div>
            <div class="boxTransponder box">
                <div class="label">Xpdr</div>
                <div class="watermrk">T</div>
            </div>
        </div>
        <div v-else class="tileContent clearance" @click="cycleMode">
            <div class="boxCleared box">
                <div class="label">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="boxRouteH box">
                <div class="label">Route</div>
                <div class="watermrk">R</div>
            </div>
            <div class="boxAltitudeH box">
                <div class="label">Altitude</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxExpectH box">
                <div class="label">Exp.</div>
            </div>
            <div class="boxFrequencyH box">
                <div class="label">Freq.</div>
                <div class="watermrk">F</div>
            </div>
            <div class="boxTransponder box">
                <div class="label">Xpdr</div>
                <div class="watermrk">T</div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Header from '../shared/Header.vue';

const emits = defineEmits(['replace','update'])
const displayMode=ref('craft')
const props = defineProps({
    params: { type: Object, default: null},
})
const settingMode=ref(false)

function changeMode(newMode:string) {
    displayMode.value = newMode;
    settingMode.value = false;
    const params = {mode:newMode}
    emits('update', params)
}

function cycleMode() {
    if( displayMode.value=='craft') {
         changeMode('boxV');
    } else if( displayMode.value=='boxV') {
        changeMode('boxH');
    } else {
        changeMode('craft');
    }
}

function loadProps(props:any) {
    // console.log('[Clearance.loadProps]', JSON.stringify(props))
    if( props.params && props.params.mode) {
        displayMode.value = props.params.mode
    } else {
        displayMode.value = 'craft'
    }
}

function onMenuClick() {
    settingMode.value = !settingMode.value
}

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

</script>
<style scoped>
.label {
  position: absolute;
  left: 3px;
  top: 0;
  font-size: 10px;
}
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
    grid-template-rows: 60px 60px 60px 59px;
}
.modeCraft {
    line-height: 3rem;
    font-weight:600;
    font-size: 30px;
    opacity: 0.2;
    text-align: left;
    padding-left: 5px;
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
.settingsList {
    display: grid;
    padding: 10px;
    gap: 10px;
    grid-template-rows: repeat( 3, 3rem);
}

</style>