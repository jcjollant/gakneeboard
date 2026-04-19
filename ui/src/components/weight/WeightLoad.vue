<template>
    <div class="weight-summary-box" @click="showDetails = true">
        <div class="weight-display" :class="{ 'over-weight': isOverWeight }">
            <div class="weight-value">
                <i class="pi pi-search magnifier"></i>
                {{ totalWeight.toFixed(0) }} 
                <span class="unit">lbs</span>
            </div>
            <div class="weight-label" v-if="!isOverWeight">TOTAL WEIGHT</div>
            <div class="weight-label warning" v-else>
                {{ weightOverLimit.toFixed(0) }} lbs OVER ({{ fuelOverLimitGal }} gal fuel)
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
import Dialog from 'primevue/dialog'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const showDetails = ref(false)

const emptyWeight = computed(() => props.aircraft?.data.basicEmptyWeight || 0)
const payloadWeight = computed(() => props.data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0))
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

const fuelOverLimitGal = computed(() => (weightOverLimit.value / 6).toFixed(1))
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
    color: #adb5bd;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
