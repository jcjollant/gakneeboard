<template>
    <div class="contentPage fuelPage">
        <Header title="Fuel Worksheet" :page="true" :displayMode="false" leftButton=""
            @replace="emits('replace')"></Header>
            
        <div v-if="!aircraft" class="p-4">
            No aircraft associated with this worksheet. 
            <br/><br/>
            Please create a new Fuel Worksheet from the Home Screen Aircraft list.
        </div>
        <div v-else class="fuel-content">
            <LoadSection :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
            <FlightSection :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
            <FuelGauge :data="pageData" :aircraft="aircraft" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Header from '../shared/Header.vue'
import LoadSection from './LoadSection.vue'
import FlightSection from './FlightSection.vue'
import FuelGauge from './FuelGauge.vue'
import { LocalStoreService } from '../../services/LocalStoreService'
import { Aircraft } from '@gak/shared'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'

const props = defineProps({
    data: { type: Object, default: () => ({}) }
})

const emits = defineEmits(['replace', 'update'])

const pageData = ref<FuelWorksheetData>(props.data as FuelWorksheetData)
const aircraft = ref<Aircraft | null>(null)

watch(() => props.data, (newVal) => {
    pageData.value = newVal as FuelWorksheetData
    loadAircraft()
}, { deep: true })

function loadAircraft() {
    if (pageData.value && pageData.value.aircraftTailNumber) {
        const aircrafts = LocalStoreService.getAircrafts()
        const found = aircrafts.find((a: Aircraft) => a.tailNumber === pageData.value.aircraftTailNumber)
        aircraft.value = found || null
    }
}

onMounted(() => {
    loadAircraft()
})

function onDataUpdate(newData: Partial<FuelWorksheetData>) {
    Object.assign(pageData.value, newData)
    emits('update', pageData.value)
}
</script>

<style scoped>
.fuel-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
}
</style>
