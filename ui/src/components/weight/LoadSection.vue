<template>
    <div class="load-section flex-row">
        <div class="left-col">
            <AircraftFuselage :data="data" :aircraft="aircraft" @update="emits('update', $event)" />
            <TarmacComponent :data="data" :aircraft="aircraft" @update="emits('update', $event)" />
        </div>
        <div class="right-col">
            <CgEnvelope :data="data" :aircraft="aircraft" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import TarmacComponent from './TarmacComponent.vue'
import AircraftFuselage from './AircraftFuselage.vue'
import CgEnvelope from './CgEnvelope.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])
</script>

<style scoped>
.flex-row {
    display: flex;
    gap: 1rem;
}
.left-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.right-col {
    flex: 1;
}
</style>
