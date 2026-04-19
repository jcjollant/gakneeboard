<template>
    <div class="left-col">
        <div class="column-header"><h3>LOAD</h3></div>
        
        <Separator name="Aircraft" />
        <AircraftFuselage :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Hangar" />
        <HangarComponent :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Fuel" />
        <FuelSection :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Weight" />
        <div class="weight-summary-box">
            <div class="weight-value">{{ totalWeight.toFixed(1) }} <span class="unit">lbs</span></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import AircraftFuselage from './AircraftFuselage.vue'
import HangarComponent from './HangarComponent.vue'
import FuelSection from './FuelSection.vue'
import Separator from '../shared/Separator.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

function emitUpdate(newData: any) {
    emits('update', newData)
}

const totalWeight = computed(() => {
    if (!props.aircraft) return 0
    const emptyWeight = props.aircraft.data.basicEmptyWeight || 0
    const payload = props.data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0)
    const fuel = (props.data.fuelGallons || 0) * 6
    return emptyWeight + payload + fuel
})
</script>

<style scoped>
.left-col {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.column-header {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    text-align: left;
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
}

.weight-summary-box {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.weight-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #495057;
}

.weight-value .unit {
    font-size: 0.9rem;
    color: #adb5bd;
    font-weight: normal;
}
</style>
