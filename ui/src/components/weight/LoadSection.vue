<template>
    <div class="load-section-content">
        <Separator name="Hangar" />
        <HangarLoad class="hangar-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Aircraft" />
        <AircraftLoad class="aircraft-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Fuel" />
        <LoadFuel class="fuel-section" :data="data" :aircraft="aircraft" @update="emitUpdate" />
        
        <Separator name="Weight" />
        <LoadWeight class="weight-section" :data="data" :aircraft="aircraft" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import AircraftLoad from './AircraftLoad.vue'
import HangarLoad from './HangarLoad.vue'
import LoadFuel from './LoadFuel.vue'
import LoadWeight from './LoadWeight.vue'
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
.load-section-content {
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

:deep(.separator) {
    background-color: #f8f9fa;
    padding: 2px 0;
    margin: 0;
    flex: 0 0 auto;
}
</style>
