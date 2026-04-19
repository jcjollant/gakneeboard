<template>
    <div class="contentPage fuelPage" :class="{ fullpage: format === TemplateFormat.FullPage, landscape: format === TemplateFormat.FullPage }">

            
        <div v-if="!aircraft" class="p-4">
            No aircraft associated with this worksheet. 
            <br/><br/>
            Please create a new Fuel Worksheet from the Home Screen Aircraft list.
        </div>
        <div v-else class="worksheet-main">
            <!-- Col 1: Loading -->
            <LoadSection :data="pageData" :aircraft="aircraft" class="sr" @update="onDataUpdate" />

            <!-- Col 2: Flight -->
            <div class="right-col sr">
                <div class="column-header"><h3>FLIGHT</h3></div>
                <FlightSection class="flight-section-comp" :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
            </div>

            <!-- Col 3: Balance & Summary -->
            <div class="stats-col">
                <div class="column-header"><h3>ENVELOPPE</h3></div>
                <div class="envelope">
                    <CgEnvelope :data="pageData" :aircraft="aircraft" :showTitle="false" />
                </div>
                <div class="column-header"><h3>CHECKS</h3></div>
                <div class="checks bt">
                    <CheckFlags :data="pageData" :aircraft="aircraft" />
                </div>
                <div class="column-header"><h3>FUEL USAGE</h3></div>
                <div class="fuel-usage bt">
                    <CheckFuel :data="pageData" :aircraft="aircraft" @update="onDataUpdate" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import LoadSection from './LoadSection.vue'
import FlightSection from './FlightSection.vue'
import CgEnvelope from './CgEnvelope.vue'
import CheckFuel from './CheckFuel.vue'
import CheckFlags from './CheckFlags.vue'
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
        
        // Initialize fuel if missing
        if (aircraft.value && (pageData.value.fuelGallons === undefined || pageData.value.fuelGallons === null)) {
            pageData.value.fuelGallons = 0
        }

        // Initialize hangar items if this is a brand new worksheet
        if (pageData.value.hangarItems.length === 0 && pageData.value.aircraftItems.length === 0) {
            const cachedItems = LocalStoreService.getHangarItems()
            if (cachedItems && cachedItems.length > 0) {
                // Deep copy to avoid reference issues
                pageData.value.hangarItems = JSON.parse(JSON.stringify(cachedItems))
            }
        }
    }
}

onMounted(() => {
    loadAircraft()
})

function onDataUpdate(newData: Partial<FuelWorksheetData>) {
    pageData.value = { ...pageData.value, ...newData }
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
    background-color: white;
}

.column-header {
    padding: 0.25rem 0.5rem;
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

.fullpage.landscape .worksheet-main {
    grid-template-columns: 250px 1fr 350px;
}

.sr {
    border-right: 1px solid #dee2e6;
}

.right-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.flight-section-comp {
    flex: 1;
    min-height: 0;
}

.stats-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    background-color: white;
}

.envelope {
    padding: 0.25rem;
}

.fuel-usage, .checks {
    flex: 1;
}
</style>
