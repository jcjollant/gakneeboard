<template>
    <div class="worksheet-checks">
        <div class="checks-list">
            <!-- Ramp Weight -->
            <div class="check-item" :class="statusClass(rampWeight <= (aircraft.data.maxRampWeight || 99999))">
                <div class="check-info">
                    <span class="check-label">Ramp Weight</span>
                    <span class="check-value">{{ rampWeight.toFixed(0) }} / {{ (aircraft.data.maxRampWeight || 0).toFixed(0) }} lbs</span>
                </div>
            </div>

            <!-- Takeoff Weight -->
            <div class="check-item" :class="statusClass(takeoffWeight <= (aircraft.data.maxTakeoffWeight || 99999))">
                <div class="check-info">
                    <span class="check-label">Takeoff Weight</span>
                    <span class="check-value">{{ takeoffWeight.toFixed(0) }} / {{ (aircraft.data.maxTakeoffWeight || 0).toFixed(0) }} lbs</span>
                </div>
            </div>

            <!-- Landing Weight -->
            <div class="check-item" :class="statusClass(landingWeight <= (aircraft.data.maxLandingWeight || 99999))">
                <div class="check-info">
                    <span class="check-label">Landing Weight</span>
                    <span class="check-value">{{ landingWeight.toFixed(0) }} / {{ (aircraft.data.maxLandingWeight || 0).toFixed(0) }} lbs</span>
                </div>
            </div>

            <!-- Required Fuel -->
            <div class="check-item" :class="statusClass(Number(fuelOnBoard.toFixed(1)) >= Number(totalRequiredFuel.toFixed(1)))">
                <div class="check-info">
                    <span class="check-label">Required Fuel</span>
                    <span class="check-value">{{ fuelOnBoard.toFixed(1) }} / {{ totalRequiredFuel.toFixed(1) }} gal</span>
                </div>
            </div>

            <!-- CG Envelope -->
            <div class="check-item" :class="statusClass(isCgValid)">
                <div class="check-info">
                    <span class="check-label">CG Envelope</span>
                    <span class="check-value">{{ isCgValid ? 'Within Limits' : 'Out of Limits' }}</span>
                </div>
            </div>

            <!-- Taxi Fuel -->
            <div class="check-item" :class="statusClass((data.taxiFuelGallons || 0) > 0)">
                <div class="check-info">
                    <span class="check-label">Taxi Fuel</span>
                    <span class="check-value">{{ (data.taxiFuelGallons || 0).toFixed(1) }} gal</span>
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

// --- Weights ---
const payloadWeight = computed(() => props.data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0))
const rampWeight = computed(() => props.aircraft.data.basicEmptyWeight + payloadWeight.value + (props.data.fuelGallons * 6))
const takeoffWeight = computed(() => rampWeight.value - (props.data.taxiFuelGallons * 6))

const tripFuelGal = computed(() => {
    return props.data.legs.reduce((sum, leg) => {
        const rate = leg.type === 'climb' ? props.aircraft.data.climbFuel 
                   : leg.type === 'descent' ? props.aircraft.data.descentFuel
                   : props.aircraft.data.cruiseFuel;
        return sum + (rate * (leg.durationMinutes / 60));
    }, 0);
})
const landingWeight = computed(() => takeoffWeight.value - (tripFuelGal.value * 6))

// --- Fuel ---
const fuelOnBoard = computed(() => props.data.fuelGallons || 0)
const alternateFuelGal = computed(() => (props.data.ifrAlternateMinutes / 60) * props.aircraft.data.cruiseFuel)
const bufferFuelGal = computed(() => (props.data.personalBufferMinutes / 60) * props.aircraft.data.cruiseFuel)
const legalReserveFuelGal = computed(() => {
    const cruiseRate = props.aircraft.data.cruiseFuel;
    if (props.data.flightRules === 'IFR') {
        return (45 / 60) * cruiseRate + alternateFuelGal.value;
    } else {
        const mins = props.data.vfrTime === 'Night' ? 45 : 30;
        return (mins / 60) * cruiseRate;
    }
})
const totalRequiredFuel = computed(() => (props.data.taxiFuelGallons || 0) + tripFuelGal.value + legalReserveFuelGal.value + bufferFuelGal.value)

// --- CG Validation ---
const isCgValid = computed(() => {
    // Simple verification: Check Takeoff, Landing, and Zero Fuel points
    return checkPoint(takeoff.value) && checkPoint(landing.value) && checkPoint(zeroFuel.value)
})

const payloadMoment = computed(() => {
    return props.data.aircraftItems.reduce((sum, item) => {
        const station = props.aircraft.data.stations[item.stationIndex]
        return sum + (item.weightLbs * (station?.posInch || 0))
    }, 0)
})

const fuelArm = computed(() => {
    const station = props.aircraft.data.stations.find(s => (s.type as string) === 'fuel' || s.name.toLowerCase().includes('fuel'))
    return station ? station.posInch : props.aircraft.data.basicEmptyCg
})

const zeroFuel = computed(() => {
    const weight = props.aircraft.data.basicEmptyWeight + payloadWeight.value
    const moment = (props.aircraft.data.basicEmptyWeight * props.aircraft.data.basicEmptyCg) + payloadMoment.value
    return { weight, arm: moment / (weight || 1) }
})

const takeoff = computed(() => {
    const fuelWeight = Math.max(0, props.data.fuelGallons - (props.data.taxiFuelGallons || 0)) * 6
    const weight = zeroFuel.value.weight + fuelWeight
    const moment = (zeroFuel.value.weight * zeroFuel.value.arm) + (fuelWeight * fuelArm.value)
    return { weight, arm: moment / (weight || 1) }
})

const landing = computed(() => {
    const tripWeight = tripFuelGal.value * 6
    const weight = takeoff.value.weight - tripWeight
    const moment = (takeoff.value.weight * takeoff.value.arm) - (tripWeight * fuelArm.value)
    return { weight, arm: moment / (weight || 1) }
})

function checkPoint(pt: { weight: number, arm: number }) {
    if (!props.aircraft.data.fwdCgLimits.length || !props.aircraft.data.aftCgLimits.length) return true
    
    const fwdLimit = interpolateLimit(pt.weight, props.aircraft.data.fwdCgLimits)
    const aftLimit = interpolateLimit(pt.weight, props.aircraft.data.aftCgLimits)
    
    return pt.arm >= fwdLimit && pt.arm <= aftLimit
}

function interpolateLimit(weight: number, limits: { weightLbs: number, posInch: number }[]) {
    // Exact match or outer bounds
    const sorted = [...limits].sort((a, b) => a.weightLbs - b.weightLbs)
    if (weight <= sorted[0].weightLbs) return sorted[0].posInch
    if (weight >= sorted[sorted.length - 1].weightLbs) return sorted[sorted.length - 1].posInch
    
    // Find segment
    for (let i = 0; i < sorted.length - 1; i++) {
        const p1 = sorted[i]
        const p2 = sorted[i+1]
        if (weight >= p1.weightLbs && weight <= p2.weightLbs) {
            const ratio = (weight - p1.weightLbs) / (p2.weightLbs - p1.weightLbs)
            return p1.posInch + ratio * (p2.posInch - p1.posInch)
        }
    }
    return sorted[0].posInch
}

// --- Status Classes ---
function statusClass(pass: boolean) {
    return pass ? 'status-pass' : 'status-fail'
}
</script>

<style scoped>
.worksheet-checks {
    padding: 0.4rem;
}

.checks-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
}

.check-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    cursor: default;
}

.check-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-color: #cbd5e1;
}

.check-info {
    display: flex;
    flex-direction: column;
}

.check-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.1rem;
}

.check-value {
    font-size: 0.8rem;
    color: #1e293b;
    font-weight: 600;
    font-feature-settings: "tnum";
}

.status-pass {
    border-left: 3px solid #10b981;
    background-color: #f0fdf4;
}

.status-fail {
    background-color: #fef2f2;
    border-left: 3px solid #ef4444;
}

.status-fail .check-value {
    color: #b91c1c;
}
</style>
