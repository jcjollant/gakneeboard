<template>
    <div class="left-col">
        <div class="column-header"><h3>LOAD</h3></div>
        
        <Separator name="Hangar" />
        <HangarLoad class="hangar-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />

        <Separator name="Aircraft" />
        <AircraftLoad class="aircraft-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Fuel" />
        <FuelLoad class="fuel-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Weight" />
        <WeightLoad class="weight-section" :data="data" :aircraft="aircraft" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import AircraftLoad from './AircraftLoad.vue'
import HangarLoad from './HangarLoad.vue'
import FuelLoad from './FuelLoad.vue'
import WeightLoad from './WeightLoad.vue'
import Separator from '../shared/Separator.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

function emitUpdate(newData: any) {
    emits('update', newData)
}

</script>

<style scoped>
.left-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.aircraft-section, .fuel-section, .weight-section {
    flex: 0 0 auto;
}

.hangar-section {
    flex: 1;
    min-height: 0;
}

.column-header {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    text-align: left;
    flex: 0 0 auto;
}

.column-header h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: bold;
    color: #495057;
    letter-spacing: 0.05em;
}

:deep(.separator) {
    background-color: #f8f9fa;
    padding: 4px 0;
    margin: 0;
    flex: 0 0 auto;
}

</style>
