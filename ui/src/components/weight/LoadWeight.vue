<template>
    <div class="weight-summary-box" @click="showDetails = true">
        <div class="weight-display" :class="{ 'over-weight': isOverWeight }">
            <div class="load-bar-container" v-if="maxWeight > 0">
                <div class="load-bar-track">
                    <div class="bar-segment people" :style="{ width: barPeopleWidth + '%' }" title="People"></div>
                    <div class="bar-segment items" :style="{ width: barItemsWidth + '%' }" title="Cargo/Items"></div>
                    <div class="bar-segment fuel" :style="{ width: barFuelWidth + '%' }" title="Fuel"></div>
                    <div class="max-marker"></div>
                </div>
            </div>

            <div class="weight-value">
                <i class="pi pi-search magnifier"></i>
                {{ totalWeight.toFixed(0) }} 
                <span class="unit">lbs</span>
            </div>
            
            <div class="weight-label" v-if="!isOverWeight">
                <template v-if="aircraft.data.maxRampWeight">
                    {{ weightRemaining.toFixed(0) }} lbs REMAINING
                </template>
                <template v-else>
                    TOTAL WEIGHT
                </template>
            </div>
            <div class="weight-label warning" v-else>
                {{ weightOverLimit.toFixed(0) }} lbs OVER
            </div>
        </div>

        <Dialog v-model:visible="showDetails" modal header="Weight Calculation" :style="{ width: '380px' }">
            <div class="weight-details">
                <div class="detail-row">
                    <span class="label">Basic Empty Weight</span>
                    <span class="value">{{ emptyWeight.toFixed(0) }} lbs</span>
                </div>

                <div class="detail-section">
                    <div class="detail-row main">
                        <span class="label">Assigned Payload</span>
                        <span class="value">{{ payloadWeight.toFixed(0) }} lbs</span>
                    </div>
                    <div class="payload-list">
                        <div v-for="item in data.aircraftItems" :key="item.id" class="detail-row sub">
                            <span class="label">{{ item.name }}</span>
                            <span class="value">{{ item.weightLbs.toFixed(0) }} lbs</span>
                        </div>
                        <div v-if="data.aircraftItems.length === 0" class="detail-row sub empty">
                            <span>(No items assigned)</span>
                        </div>
                    </div>
                </div>

                <div class="detail-row">
                    <span class="label">Fuel ({{ (data.fuelGallons || 0).toFixed(1) }} gal)</span>
                    <span class="value">{{ fuelWeight.toFixed(0) }} lbs</span>
                </div>

                <div class="total-row">
                    <span>Total Ramp Weight</span>
                    <span :class="{ 'text-danger': isOverWeight }">{{ totalWeight.toFixed(0) }} lbs</span>
                </div>

                <div v-if="aircraft.data.maxRampWeight" class="limit-row">
                    <span>Max Ramp Weight</span>
                    <span>{{ aircraft.data.maxRampWeight.toFixed(0) }} lbs</span>
                </div>

                <div v-if="isOverWeight" class="warning-row">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>Exceeds Max Ramp Weight</span>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import { FuelWorksheetMath } from '../../services/FuelWorksheetMath'
import Dialog from 'primevue/dialog'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const showDetails = ref(false)

const emptyWeight = computed(() => props.aircraft?.data.basicEmptyWeight || 0)
const payloadWeight = computed(() => FuelWorksheetMath.computePayloadWeight(props.data))
const fuelWeight = computed(() => (props.data.fuelGallons || 0) * 6)
const totalWeight = computed(() => Math.round(emptyWeight.value + payloadWeight.value + fuelWeight.value))

const isOverWeight = computed(() => {
    const max = props.aircraft?.data.maxRampWeight
    return max ? totalWeight.value > max : false
})

const weightOverLimit = computed(() => {
    const max = props.aircraft?.data.maxRampWeight || 0
    return Math.max(0, totalWeight.value - max)
})

const weightRemaining = computed(() => {
    const max = props.aircraft?.data.maxRampWeight || 0
    return Math.max(0, max - totalWeight.value)
})

const peopleWeight = computed(() => props.data.aircraftItems.filter(i => i.isPerson).reduce((sum, item) => sum + item.weightLbs, 0))
const itemsWeight = computed(() => props.data.aircraftItems.filter(i => !i.isPerson).reduce((sum, item) => sum + item.weightLbs, 0))
const maxWeight = computed(() => props.aircraft?.data.maxRampWeight || 0)
const usefulLoadCapacity = computed(() => Math.max(0, maxWeight.value - emptyWeight.value))

const barPeopleWidth = computed(() => usefulLoadCapacity.value ? (peopleWeight.value / usefulLoadCapacity.value) * 100 : 0)
const barItemsWidth = computed(() => usefulLoadCapacity.value ? (itemsWeight.value / usefulLoadCapacity.value) * 100 : 0)
const barFuelWidth = computed(() => usefulLoadCapacity.value ? (fuelWeight.value / usefulLoadCapacity.value) * 100 : 0)

</script>

<style scoped>
.weight-summary-box {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
}

.weight-summary-box:hover {
    background-color: #f8f9fa;
}

.weight-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
}

.load-bar-container {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    margin-bottom: 6px;
}

.load-bar-track {
    height: 4px;
    background-color: #f1f5f9;
    display: flex;
    position: relative;
    border-radius: 2px;
    width: 100%; /* 100% of track = Max Weight */
}

.bar-segment {
    height: 100%;
    flex-shrink: 0;
    transition: width 0.3s ease;
}

.bar-segment.people { background-color: #166534; }
.bar-segment.items { background-color: #f59e0b; }
.bar-segment.fuel { background-color: #0ea5e9; }

.max-marker {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: 100%;
    width: 2px;
    background-color: #dc3545;
    z-index: 10;
}

.weight-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #212529;
    letter-spacing: -0.02em;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.magnifier {
    font-size: 0.9rem;
    color: #adb5bd;
    opacity: 0.3;
    transition: all 0.2s ease;
}

.weight-summary-box:hover .magnifier {
    opacity: 1;
    color: #3b82f6;
    transform: scale(1.1);
}

.over-weight .weight-value {
    color: #dc3545;
}

.weight-label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
}

.weight-label.warning {
    color: #dc3545;
}

.weight-value .unit {
    font-size: 0.9rem;
    color: #adb5bd;
    font-weight: normal;
}

.weight-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.9rem;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    color: #495057;
}

.detail-row.main {
    font-weight: 600;
}

.payload-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0 0.5rem 1rem;
    border-left: 2px solid #f1f3f5;
    margin-bottom: 0.25rem;
}

.detail-row.sub {
    font-size: 0.8rem;
    color: #868e96;
}

.detail-row.sub.empty {
    font-style: italic;
    color: #adb5bd;
}

.total-row {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #212529;
    padding-top: 0.75rem;
    border-top: 1px dashed #dee2e6;
    margin-top: 0.25rem;
}

.limit-row {
    display: flex;
    justify-content: space-between;
    font-style: italic;
    font-size: 0.8rem;
    color: #6c757d;
}

.warning-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc3545;
    font-size: 0.8rem;
    font-weight: bold;
    margin-top: 0.5rem;
    justify-content: center;
}

.text-danger {
    color: #dc3545;
}
</style>
