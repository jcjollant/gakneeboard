<template>
    <div class="fuel-gauge-container">

        <div class="gauge-content">

            
            <div class="gauge-wrapper">

                <!-- Manual Fuel Marker -->
                <div v-if="data.fuelGallons !== undefined" class="limit-marker actual" :style="{ left: percent(data.fuelGallons) }">
                    <span>TANK</span>
                </div>


                <!-- Main Gauge Bar -->
                <div class="gauge-bar">
                    <div class="segment reserve" :style="{ width: percent(legalReserveFuel) }" title="Legal Reserve"></div>
                    <div class="segment buffer" :style="{ width: percent(bufferFuel) }" title="Personal Buffer"></div>
                    <div class="segment flight" :style="{ width: percent(flightFuel) }" title="Flight Fuel"></div>
                    <div class="segment taxi" :style="{ width: percent(taxiFuel) }" title="Taxi Fuel"></div>
                </div>

                <!-- Ticks -->
                <div class="gauge-ticks">
                    <div class="tick">0</div>
                    <div class="tick">{{ (maxUsable / 2).toFixed(1) }}</div>
                    <div class="tick">{{ maxUsable.toFixed(1) }}</div>
                </div>
            </div>

            <div class="gauge-legend">
                <div class="legend-item"><span class="swatch reserve"></span> Legal Res. ({{ legalReserveFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch buffer"></span> Personal Res. ({{ bufferFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch flight"></span> Flight ({{ flightFuel.toFixed(1) }})</div>
                <div class="legend-item"><span class="swatch taxi"></span> Taxi ({{ taxiFuel.toFixed(1) }})</div>
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

const emits = defineEmits(['update'])



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

const legalReserveFuel = computed(() => {
    const cruiseRate = props.aircraft.data.cruiseFuel;
    if (props.data.flightRules === 'IFR') {
        // IFR: 45min cruise + Alternate Time
        return (45 / 60) * cruiseRate + alternateFuel.value;
    } else {
        // VFR: Day 30min, Night 45min
        const mins = props.data.vfrTime === 'Night' ? 45 : 30;
        return (mins / 60) * cruiseRate;
    }
})

const totalRequired = computed(() => taxiFuel.value + flightFuel.value + legalReserveFuel.value + bufferFuel.value)

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
    padding: 0.5rem;
}



.weight-limit-info {
    font-size: 0.85rem;
}

.text-danger {
    color: #ef4444;
}

.gauge-wrapper {
    position: relative;
    margin: 2rem 0 1rem 0;
}

.gauge-bar {
    height: 14px;
    background-color: #e9ecef;
    border-radius: 7px;
    display: flex;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.segment {
    height: 100%;
}
.segment.taxi { background-color: #4b5563; } /* Dark Grey for Taxi */
.segment.flight { background-color: #0ea5e9; }
.segment.reserve { background-color: #f43f5e; } /* Rose/Red for Legal Reserve */
.segment.buffer { background-color: #fbbf24; } /* Amber for Personal Buffer */

.limit-marker {
    position: absolute;
    top: -25px;
    width: 2px;
    height: 43px;
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

.limit-marker.actual {
    background-color: #0ea5e9;
}

.limit-marker.actual span {
    color: #0ea5e9;
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 1rem;
    justify-items: start;
    margin-top: 0.75rem;
    font-size: 0.75rem;
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

.swatch.taxi { background-color: #4b5563; }
.swatch.flight { background-color: #0ea5e9; }
.swatch.reserve { background-color: #f43f5e; }
.swatch.buffer { background-color: #fbbf24; }

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
