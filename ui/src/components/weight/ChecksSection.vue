<template>
    <div class="checks-section-content">
        <Separator name="Envelope" />
        <div class="envelope">
            <CgEnvelope :data="data" :aircraft="aircraft" :showTitle="false" />
        </div>
        
        <Separator name="Flags" />
        <div class="checks bt">
            <CheckFlags :data="data" :aircraft="aircraft" />
        </div>
        
        <Separator name="Fuel Allocation" />
        <div class="fuel-allocation bt">
            <CheckFuel :data="data" :aircraft="aircraft" @update="onUpdate" />
        </div>
    </div>
</template>

<script setup lang="ts">
import CgEnvelope from './CgEnvelope.vue'
import CheckFuel from './CheckFuel.vue'
import CheckFlags from './CheckFlags.vue'
import Separator from '../shared/Separator.vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

function onUpdate(newData: Partial<FuelWorksheetData>) {
    emits('update', newData)
}
</script>

<style scoped>
.checks-section-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.envelope {
    padding: 0 0.25rem;
    height: 280px;
    flex-shrink: 0;
}

.fuel-allocation {
    height: 150px;
    flex-shrink: 0;
}

.checks {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.bt {
    border-top: 1px solid #f1f5f9;
}
</style>
