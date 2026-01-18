<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        <div v-else-if="displayMode==DisplayModeRegulations.Night">
            <ImageContent src="nights.png"/>
            <RegLink :regs="nightRegs" />
        </div>
        <div v-else-if="displayMode==DisplayModeRegulations.Oxygen">
            <ImageContent src="oxygen-requirements.png"/>
            <RegLink :regs="oxygenRegs" />
        </div>
        <div v-else-if="displayMode==DisplayModeRegulations.MinSafeAltitudes">
            <ImageContent src="safe-altitudes.png"/>
            <RegLink :regs="msaRegs" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeChoice, DisplayModeRegulations } from '../../models/DisplayMode.ts'
import { TileData } from '../../models/TileData.ts'
import { TileType } from '../../models/TileType.ts'
import { Regulation } from '../../models/Regulation.ts'

import Header from '../shared/Header.vue'
import ImageContent from '../shared/ImageContent.vue'
import DisplayModeSelection from '../shared/DisplayModeSelection.vue'
import RegLink from './RegLink.vue'

const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeRegulations.Night
const displayMode = ref(DisplayModeRegulations.Unknown)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection = ref(false)
const displayModes = [
    new DisplayModeChoice('Definitions of Night', DisplayModeRegulations.Night),
    new DisplayModeChoice('Supplemental Oxygen', DisplayModeRegulations.Oxygen),
    new DisplayModeChoice('Minimum Safe Altitudes', DisplayModeRegulations.MinSafeAltitudes),
]
const nightRegs = ref([Regulation.RecentFlightExperiencePic, Regulation.Far1_1, Regulation.AircraftLights])
const oxygenRegs = ref([Regulation.SupplementalOxygen])
const msaRegs = ref([Regulation.MinimumSafeAltitudes])

onMounted(() => {   
    loadProps(props)
})

watch(props, async() => {
    loadProps(props)
})

watch(displayMode, (newValue, oldValue) => {
    if( newValue != oldValue && displaySelection.value) {
        saveConfig()
    }
    displaySelection.value = false;
})

function loadProps(props: any) {
    if(props.params && props.params.mode) {
        displayMode.value = props.params.mode
    } else {
        displayMode.value = DisplayModeRegulations.Unknown
        displaySelection.value = true
    }
}

function saveConfig() {
    const params = {mode: displayMode.value}
    emits('update', new TileData(TileType.regulations, params))
}

function getTitle() {
    if(displaySelection.value) return "Regulations Mode"
    if(displayMode.value == DisplayModeRegulations.Night) {
        return 'Definitions of Night'
    } else if(displayMode.value == DisplayModeRegulations.Oxygen) {
        return 'Supplemental Oxygen'
    } else if(displayMode.value == DisplayModeRegulations.MinSafeAltitudes) {
        return 'Minimum Safe Altitudes'
    } else {
        return 'Regulations'
    }
}
</script>