<template>
    <div class="check-flags">
        <div class="checks-list">
            <!-- Ramp Weight -->
            <div class="check-item" :class="statusClass(Number(rampWeight.toFixed(0)) <= (aircraft.data.maxRampWeight ? Number(aircraft.data.maxRampWeight.toFixed(0)) : 999999))"
                @click="openDetails('ramp', 'Ramp Weight Details')">
                <div class="check-info">
                    <span class="check-label">Ramp Weight</span>
                    <span class="check-value">{{ Formatter.weightStatus(rampWeight, aircraft.data.maxRampWeight || 0) }}</span>
                </div>
            </div>

            <!-- Takeoff Weight -->
            <div class="check-item" :class="statusClass(Number(takeoffWeight.toFixed(0)) <= (aircraft.data.maxTakeoffWeight ? Number(aircraft.data.maxTakeoffWeight.toFixed(0)) : 999999))"
                @click="openDetails('takeoff', 'Takeoff Weight Details')">
                <div class="check-info">
                    <span class="check-label">Takeoff Weight</span>
                    <span class="check-value">{{ Formatter.weightStatus(takeoffWeight, aircraft.data.maxTakeoffWeight || 0) }}</span>
                </div>
            </div>

            <!-- Landing Weight -->
            <div class="check-item" :class="statusClass(Number(landingWeight.toFixed(0)) <= (aircraft.data.maxLandingWeight ? Number(aircraft.data.maxLandingWeight.toFixed(0)) : 999999))"
                @click="openDetails('landing', 'Landing Weight Details')">
                <div class="check-info">
                    <span class="check-label">Landing Weight</span>
                    <span class="check-value">{{ Formatter.weightStatus(landingWeight, aircraft.data.maxLandingWeight || 0) }}</span>
                </div>
            </div>

            <!-- Required Fuel -->
            <div class="check-item" :class="statusClass(Number(fuelOnBoard.toFixed(1)) >= Number(totalRequiredFuel.toFixed(1)))"
                @click="openDetails('fuel', 'Required Fuel Details')">
                <div class="check-info">
                    <span class="check-label">Required Fuel</span>
                    <span class="check-value">{{ fuelOnBoard.toFixed(1) }} / {{ totalRequiredFuel.toFixed(1) }} gal</span>
                </div>
            </div>

            <!-- CG Envelope -->
            <div class="check-item" :class="statusClass(isCgValid)"
                @click="openDetails('cg', 'CG Envelope Details')">
                <div class="check-info">
                    <span class="check-label">CG Envelope</span>
                    <span class="check-value">{{ isCgValid ? 'Within Limits' : 'Out of Limits' }}</span>
                </div>
            </div>

            <!-- Taxi Fuel -->
            <div class="check-item" :class="statusClass((data.taxiFuelGallons || 0) > 0)"
                @click="openDetails('taxi', 'Taxi Fuel Details')">
                <div class="check-info">
                    <span class="check-label">Taxi Fuel</span>
                    <span class="check-value">{{ (data.taxiFuelGallons || 0).toFixed(1) }} gal</span>
                </div>
            </div>

            <!-- Front Seat -->
            <div class="check-item" :class="statusClass(isFrontSeatOccupied)"
                @click="openDetails('seats', 'Front Seat Validation')">
                <div class="check-info">
                    <span class="check-label">Front Seat(s)</span>
                    <span class="check-value">{{ isFrontSeatOccupied ? 'Occupied' : 'Empty' }}</span>
                </div>
            </div>

            <!-- Flight Legs -->
            <div class="check-item" :class="statusClass(data.legs.length > 0)"
                @click="openDetails('legs', 'Flight Legs Details')">
                <div class="check-info">
                    <span class="check-label">Flight Legs</span>
                    <span class="check-value">{{ data.legs.length }} Leg{{ data.legs.length === 1 ? '' : 's' }}</span>
                </div>
            </div>

            <!-- Station Weights -->
            <div v-for="s in stationWeightStatus" :key="s.name" class="check-item" :class="statusClass(s.ok)"
                @click="openDetails('station', s.name + ' Details', { station: s })">
                <div class="check-info">
                    <span class="check-label">{{ s.name }}</span>
                    <span class="check-value">{{ Formatter.weightStatus(s.weight, s.max) }}</span>
                </div>
            </div>
        </div>

        <CheckDetailsDialog v-model:visible="showDetails" :selectedCheck="selectedCheck" :data="data" :aircraft="aircraft" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import CheckDetailsDialog from './CheckDetailsDialog.vue'
import { Formatter } from '../../lib/Formatter'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const showDetails = ref(false)
const selectedCheck = ref<any>(null)

function openDetails(type: string, title: string, extra: any = {}) {
    selectedCheck.value = { type, title, ...extra }
    showDetails.value = true
}

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

// --- Occupancy Validation ---
const isFrontSeatOccupied = computed(() => {
    if (!props.aircraft.data.stations.length) return true
    
    // Find all seat-like stations (exclude fuel and cargo)
    const seats = props.aircraft.data.stations
        .map((s, index) => ({ ...s, index }))
        .filter(s => {
            const lower = (s.name || '').toLowerCase()
            const isFuel = lower.includes('fuel') || (s.type as string) === 'fuel'
            const isCargo = lower.includes('cargo') || lower.includes('baggage')
            return !isFuel && !isCargo
        })
    
    if (seats.length === 0) return true

    // Find the minimum arm among seats (the front-most seats)
    const minArm = Math.min(...seats.map(s => s.posInch))
    
    // Find indices of all front seats
    const frontSeatIndices = seats
        .filter(s => Math.abs(s.posInch - minArm) < 0.1)
        .map(s => s.index)
        
    // Check if any item is assigned to these stations with weight > 0
    return props.data.aircraftItems.some(item => 
        frontSeatIndices.includes(item.stationIndex) && item.weightLbs > 0
    )
})

const stationWeightStatus = computed(() => {
    return props.aircraft.data.stations.map((station, index) => {
        if (station.maxWeightLbs === undefined || station.maxWeightLbs <= 0) return { name: station.name, ok: true, max: 0, weight: 0 };
        
        let weight = 0;
        let isOk = true;
        let displayWeight = 0;

        if (station.type === 'fuel') {
            return { name: station.name, ok: true, weight: 0, max: 0 };
        } else if (station.type === 'twin') {
            const leftWeight = props.data.aircraftItems
                .filter(i => i.stationIndex === index && i.slotIndex === 0)
                .reduce((sum, i) => sum + i.weightLbs, 0);
            const rightWeight = props.data.aircraftItems
                .filter(i => i.stationIndex === index && i.slotIndex === 1)
                .reduce((sum, i) => sum + i.weightLbs, 0);
            
            isOk = leftWeight <= station.maxWeightLbs && rightWeight <= station.maxWeightLbs;
            displayWeight = Math.max(leftWeight, rightWeight);
        } else {
            weight = props.data.aircraftItems
                .filter(i => i.stationIndex === index)
                .reduce((sum, i) => sum + i.weightLbs, 0);
            isOk = weight <= station.maxWeightLbs;
            displayWeight = weight;
        }

        return { name: station.name, ok: isOk, weight: displayWeight, max: station.maxWeightLbs };
    }).filter(s => s.max > 0);
})

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
.check-flags {
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
    cursor: pointer;
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
    font-size: 0.8rem;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.05rem;
}

.check-value {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 500;
    font-feature-settings: "tnum";
    text-align: left;
}

.status-pass .check-label {
    color: #047857;
}

.status-pass {
    border-left: 3px solid #047857;
    background-color: #f0fdf4;
}

.status-fail .check-label {
    color: #dc2626;
}

.status-fail {
    background-color: #fef2f2;
    border-left: 3px solid #ef4444;
    animation: shake-red 0.4s ease-in-out;
}

@keyframes shake-red {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); background-color: #fee2e2; }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
}

.status-fail .check-value {
    color: #ef4444;
    font-weight: 500;
}
</style>
