<template>
    <div class="contentPage fuelPage" :class="{ fullpage: format === TemplateFormat.FullPage, landscape: format === TemplateFormat.FullPage }">
        <Header title="Fuel Worksheet" :page="true" :displayMode="false" leftButton=""
            @replace="emits('replace')"></Header>
            
        <div v-if="!aircraft" class="p-4">
            No aircraft associated with this worksheet. 
            <br/><br/>
            Please create a new Fuel Worksheet from the Home Screen Aircraft list.
        </div>
        <div v-else class="worksheet-main">
            <!-- Col 1: Loading -->
            <div class="left-col br">
                <AircraftFuselage :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
                <Separator name="Tarmac" />
                <TarmacComponent :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
            </div>

            <!-- Col 2: Flight -->
            <div class="right-col br">
                <FlightSection :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
            </div>

            <!-- Col 3: Balance & Summary -->
            <div class="stats-col">
                <div class="envelope-summary">
                    <CgEnvelope :data="pageData" :aircraft="aircraft" :showTitle="true" />
                </div>
                <div class="gauge-summary bt">
                    <FuelGauge :data="pageData" :aircraft="aircraft" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Header from '../shared/Header.vue'
import AircraftFuselage from './AircraftFuselage.vue'
import TarmacComponent from './TarmacComponent.vue'
import FlightSection from './FlightSection.vue'
import CgEnvelope from './CgEnvelope.vue'
import FuelGauge from './FuelGauge.vue'
import Separator from '../shared/Separator.vue'
import { LocalStoreService } from '../../services/LocalStoreService'
import { Aircraft, TemplateFormat } from '@gak/shared'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'

const props = defineProps({
    data: { type: Object, default: () => ({}) },
    format: { type: String, default: TemplateFormat.Kneeboard }
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
.fuelPage {
    display: flex;
    flex-direction: column;
}

.worksheet-main {
    display: grid;
    grid-template-columns: 180px 1fr;
    flex: 1;
    overflow: hidden;
}

.fullpage.landscape .worksheet-main {
    grid-template-columns: 250px 1fr 350px;
}

.left-col {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.right-col {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.stats-col {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: white;
}

.envelope-summary {
    padding: 0;
}

.gauge-summary {
    flex: 1;
}
</style>
