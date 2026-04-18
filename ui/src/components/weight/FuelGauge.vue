<template>
    <div class="fuel-gauge-container">
        <div class="header">
            <h3>Fuel Gauge</h3>
        </div>
        <div class="gauge-content">
            <div class="gauge-info">
                <div><strong>Max Usable:</strong> {{ maxUsable }} gal</div>
                <div><strong>Required:</strong> {{ totalRequired.toFixed(1) }} gal</div>
                <div v-if="fuelLimitedByWeight < maxUsable" class="text-danger">
                    <strong>Weight Limited Max:</strong> {{ fuelLimitedByWeight.toFixed(1) }} gal 
                    ({{ limitingFactor }})
                </div>
            </div>

            <div class="gauge-wrapper">
                <!-- Limit Markers -->
                <div v-if="mtowLimitGal < maxUsable" class="limit-marker mtow" :style="{ left: percent(mtowLimitGal) }">
                    <span>MTOW</span>
                </div>
                <div v-if="mldwLimitGal < maxUsable" class="limit-marker mldw" :style="{ left: percent(mldwLimitGal) }">
                    <span>MLDW</span>
                </div>

                <!-- Main Gauge Bar -->
                <div class="gauge-bar">
                    <div class="segment taxi" :style="{ width: percent(taxiFuel) }" title="Taxi Fuel"></div>
                    <div class="segment flight" :style="{ width: percent(flightFuel) }" title="Flight Fuel"></div>
                    <div class="segment alternate" :style="{ width: percent(alternateFuel) }" title="Alternate Fuel"></div>
                    <div class="segment buffer" :style="{ width: percent(bufferFuel) }" title="Buffer Fuel"></div>
                </div>

                <!-- Ticks -->
                <div class="gauge-ticks">
                    <div class="tick">0</div>
                    <div class="tick">{{ (maxUsable / 2).toFixed(1) }}</div>
                    <div class="tick">{{ maxUsable.toFixed(1) }}</div>
                </div>
            </div>

            <div class="gauge-legend">
                <div class="legend-item"><span class="swatch taxi"></span> Taxi ({{ taxiFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch flight"></span> Flight ({{ flightFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch alternate"></span> Alternate ({{ alternateFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch buffer"></span> Buffer ({{ bufferFuel.toFixed(1) }})</div>
            </div>
            
            <div v-if="totalRequired > fuelLimitedByWeight" class="p-message p-component p-message-error mt-3">
                <div class="p-message-wrapper">
                    <span class="p-message-icon pi pi-exclamation-triangle"></span>
                    <div class="p-message-text">Required fuel exceeds weight limitations. Reduce payload or planned fuel.</div>
                </div>
            </div>
            <div v-else-if="totalRequired > maxUsable" class="p-message p-component p-message-error mt-3">
                <div class="p-message-wrapper">
                    <span class="p-message-icon pi pi-exclamation-triangle"></span>
                    <div class="p-message-text">Required fuel exceeds maximum usable fuel capacity.</div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const maxUsable = computed(() => props.aircraft.data.maxUsableFuel || 1)

const taxiFuel = computed(() => props.data.taxiFuelGallons || 0)
const flightFuel = computed(() => {
    return props.data.legs.reduce((sum, leg) => {
        const rate = leg.type === 'climb' ? props.aircraft.data.climbFuel 
                   : leg.type === 'descent' ? props.aircraft.data.descentFuel
                   : props.aircraft.data.cruiseFuel;
        return sum + (rate * (leg.durationMinutes / 60));
    }, 0);
})
const alternateFuel = computed(() => (props.data.ifrAlternateMinutes / 60) * props.aircraft.data.cruiseFuel)
const bufferFuel = computed(() => (props.data.personalBufferMinutes / 60) * props.aircraft.data.cruiseFuel)

const totalRequired = computed(() => taxiFuel.value + flightFuel.value + alternateFuel.value + bufferFuel.value)

// Weight calculations for finding limits
const payloadWeight = computed(() => {
    return props.data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0)
})
const zeroFuelWeight = computed(() => props.aircraft.data.basicEmptyWeight + payloadWeight.value)

// Max Takeoff limit to fuel
const mtowLimitGal = computed(() => {
    if (!props.aircraft.data.maxTakeoffWeight) return 9999
    // ActualFuelOnBoard <= MaxTakeoffWeight - ZeroFuelWeight + TaxiFuel
    return ((props.aircraft.data.maxTakeoffWeight - zeroFuelWeight.value) / 6) + taxiFuel.value
})

const mldwLimitGal = computed(() => {
    if (!props.aircraft.data.maxLandingWeight) return 9999
    // ActualFuelOnBoard <= MaxLandingWeight - ZeroFuelWeight + TaxiFuel + FlightFuel
    return ((props.aircraft.data.maxLandingWeight - zeroFuelWeight.value) / 6) + taxiFuel.value + flightFuel.value
})

const fuelLimitedByWeight = computed(() => Math.min(maxUsable.value, mtowLimitGal.value, mldwLimitGal.value))
const limitingFactor = computed(() => {
    if (fuelLimitedByWeight.value === mldwLimitGal.value && mldwLimitGal.value < maxUsable.value) return 'MLDW'
    if (fuelLimitedByWeight.value === mtowLimitGal.value && mtowLimitGal.value < maxUsable.value) return 'MTOW'
    return 'Capacity'
})

function percent(amount: number) {
    return (Math.min(amount, maxUsable.value) / maxUsable.value * 100) + '%'
}
</script>

<style scoped>
.fuel-gauge-container {
    background-color: white;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.header h3 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: bold;
    color: #adb5bd;
    text-transform: uppercase;
}

.gauge-content {
    padding: 1rem;
}

.gauge-info {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
}

.text-danger {
    color: #ef4444;
}

.gauge-wrapper {
    position: relative;
    margin: 2rem 0 1rem 0;
}

.gauge-bar {
    height: 30px;
    background-color: #e9ecef;
    border-radius: 15px;
    display: flex;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.segment {
    height: 100%;
}
.segment.taxi { background-color: #f59e0b; }
.segment.flight { background-color: #0ea5e9; }
.segment.alternate { background-color: #8b5cf6; }
.segment.buffer { background-color: #10b981; }

.limit-marker {
    position: absolute;
    top: -25px;
    width: 2px;
    height: 55px;
    background-color: #ef4444;
    z-index: 10;
}

.limit-marker span {
    position: absolute;
    top: -15px;
    left: -15px;
    font-size: 0.75rem;
    font-weight: bold;
    color: #ef4444;
    white-space: nowrap;
}

.gauge-ticks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #6c757d;
    padding: 0 10px;
}

.gauge-legend {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-top: 1.5rem;
    font-size: 0.85rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: inline-block;
}

.swatch.taxi { background-color: #f59e0b; }
.swatch.flight { background-color: #0ea5e9; }
.swatch.alternate { background-color: #8b5cf6; }
.swatch.buffer { background-color: #10b981; }

.p-message {
    padding: 1rem;
    border-radius: 6px;
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #f87171;
}

.p-message-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.p-message-icon {
    font-size: 1.25rem;
}
</style>
