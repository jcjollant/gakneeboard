<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        
        <RiskMitigation v-else-if="displayMode==DisplayModeEmergency.RiskMitigation" />

        <DistressCall v-else-if="displayMode==DisplayModeEmergency.DistressCall" />

        <LostProcedure v-else-if="displayMode==DisplayModeEmergency.LostProcedure" />

        <DecideModel v-else-if="displayMode==DisplayModeEmergency.Decide" />

        <TileModeDots 
            v-if="!displaySelection"
            v-model="displayMode" 
            :modes="displayModes" 
        />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeChoice, DisplayModeEmergency } from '../../models/DisplayMode.ts';
import { TileData } from '../../models/TileData.ts';
import { TileType } from '../../models/TileType.ts';

import Header from '../shared/Header.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import TileModeDots from '../shared/TileModeDots.vue';
import LostProcedure from '../emergencies/LostProcedure.vue';
import DistressCall from '../emergencies/DistressCall.vue';
import DecideModel from '../emergencies/DecideModel.vue';
import RiskMitigation from '../emergencies/RiskMitigation.vue';

// Enum with display modes

const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeEmergency.LostProcedure
const displayMode=ref(DisplayModeEmergency.Unknown)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    new DisplayModeChoice( 'Risk Mitigation', DisplayModeEmergency.RiskMitigation),
    new DisplayModeChoice( 'Lost Procedure', DisplayModeEmergency.LostProcedure),
    new DisplayModeChoice( 'Distress Call', DisplayModeEmergency.DistressCall),
    new DisplayModeChoice( 'Risk Assessment', DisplayModeEmergency.Decide)
]

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch( displayMode, (newValue, oldValue) => {
    if( newValue == oldValue || oldValue == DisplayModeEmergency.Unknown) return;
    displaySelection.value = false;
    saveConfig()
})

function loadProps(props:any) {
    displayMode.value = defaultMode
    if( props.params) {
         if( props.params.mode) {
                displayMode.value = props.params.mode
         } else {
            displaySelection.value = true
         }
    } else {
        displaySelection.value = true
    }
}

function saveConfig() {
    const params:any = {mode:displayMode.value}
    emits('update', new TileData( TileType.emergency, params))
}

function getTitle() {
    if( displaySelection.value) return "Emergency Tile Mode"
    let title:string;
    if( displayMode.value==DisplayModeEmergency.RiskMitigation) {
        title =  'Risk Mitigation'
    } else if( displayMode.value==DisplayModeEmergency.DistressCall) {
        title = 'Distress Call'
    } else if( displayMode.value==DisplayModeEmergency.LostProcedure) {
        title = 'Lost Procedure'
    } else if( displayMode.value==DisplayModeEmergency.Decide) {
        title = 'Risk Assessment'
    } else {
        title = 'Emergencies'
    }

    return title
}

</script>

<style scoped>
.placeholder {
    padding: 20px;
    text-align: center;
    color: #666;
}
</style>
