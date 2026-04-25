<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="selectedCheck?.title" modal class="check-details-dialog" :draggable="false" :dismissableMask="true" :style="{ width: '400px' }">
        <div v-if="selectedCheck?.type === 'ramp'" class="details-content">
            <div class="detail-row"><span>Basic Empty Weight</span><span>{{ aircraft.data.basicEmptyWeight }} lbs</span></div>
            <div class="detail-row"><span>Payload (Items)</span><span>+ {{ payloadWeight }} lbs</span></div>
            <div class="detail-row"><span>Fuel ({{ data.fuelGallons }} gal)</span><span>+ {{ (data.fuelGallons * 6).toFixed(0) }} lbs</span></div>
            <div class="detail-separator"></div>
            <div class="detail-row total"><span>Total Ramp Weight</span><span>{{ rampWeight.toFixed(0) }} lbs</span></div>
            <template v-if="aircraft.data.maxRampWeight">
                <div class="detail-row limit"><span>Maximum Allowed</span><span>{{ aircraft.data.maxRampWeight }} lbs</span></div>
                <div class="detail-separator"></div>
                <div class="detail-row diff" :class="{ 'overweight': rampWeight > aircraft.data.maxRampWeight }">
                    <span>{{ rampWeight > aircraft.data.maxRampWeight ? 'Overweight By' : 'Remaining Capacity' }}</span>
                    <span>{{ Math.abs(aircraft.data.maxRampWeight - rampWeight).toFixed(0) }} lbs</span>
                </div>
                <div class="detail-row fuel-eq">
                    <span>Equivalent in Fuel</span>
                    <span>{{ (Math.abs(aircraft.data.maxRampWeight - rampWeight) / 6).toFixed(1) }} gal</span>
                </div>
            </template>
        </div>

        <div v-if="selectedCheck?.type === 'takeoff'" class="details-content">
            <div class="detail-row"><span>Ramp Weight</span><span>{{ rampWeight.toFixed(0) }} lbs</span></div>
            <div class="detail-row"><span>Taxi Fuel ({{ data.taxiFuelGallons }} gal)</span><span>- {{ (data.taxiFuelGallons * 6).toFixed(0) }} lbs</span></div>
            <div class="detail-separator"></div>
            <div class="detail-row total"><span>Total Takeoff Weight</span><span>{{ takeoffWeight.toFixed(0) }} lbs</span></div>
            <template v-if="aircraft.data.maxTakeoffWeight">
                <div class="detail-row limit"><span>Maximum Allowed</span><span>{{ aircraft.data.maxTakeoffWeight }} lbs</span></div>
                <div class="detail-separator"></div>
                <div class="detail-row diff" :class="{ 'overweight': takeoffWeight > aircraft.data.maxTakeoffWeight }">
                    <span>{{ takeoffWeight > aircraft.data.maxTakeoffWeight ? 'Overweight By' : 'Remaining Capacity' }}</span>
                    <span>{{ Math.abs(aircraft.data.maxTakeoffWeight - takeoffWeight).toFixed(0) }} lbs</span>
                </div>
                <div class="detail-row fuel-eq">
                    <span>Equivalent in Fuel</span>
                    <span>{{ (Math.abs(aircraft.data.maxTakeoffWeight - takeoffWeight) / 6).toFixed(1) }} gal</span>
                </div>
            </template>
        </div>

        <div v-if="selectedCheck?.type === 'landing'" class="details-content">
            <div class="detail-row"><span>Takeoff Weight</span><span>{{ takeoffWeight.toFixed(0) }} lbs</span></div>
            <div class="detail-row"><span>Trip Fuel ({{ tripFuelGal.toFixed(1) }} gal)</span><span>- {{ (tripFuelGal * 6).toFixed(0) }} lbs</span></div>
            <div class="detail-separator"></div>
            <div class="detail-row total"><span>Total Landing Weight</span><span>{{ landingWeight.toFixed(0) }} lbs</span></div>
            <template v-if="aircraft.data.maxLandingWeight">
                <div class="detail-row limit"><span>Maximum Allowed</span><span>{{ aircraft.data.maxLandingWeight }} lbs</span></div>
                <div class="detail-separator"></div>
                <div class="detail-row diff" :class="{ 'overweight': landingWeight > aircraft.data.maxLandingWeight }">
                    <span>{{ landingWeight > aircraft.data.maxLandingWeight ? 'Overweight By' : 'Remaining Capacity' }}</span>
                    <span>{{ Math.abs(aircraft.data.maxLandingWeight - landingWeight).toFixed(0) }} lbs</span>
                </div>
                <div class="detail-row fuel-eq">
                    <span>Equivalent in Fuel</span>
                    <span>{{ (Math.abs(aircraft.data.maxLandingWeight - landingWeight) / 6).toFixed(1) }} gal</span>
                </div>
            </template>
        </div>

        <div v-if="selectedCheck?.type === 'fuel'" class="details-content">
            <div class="detail-row"><span>Taxi Fuel</span><span>{{ data.taxiFuelGallons.toFixed(1) }} gal</span></div>
            <div class="detail-row"><span>Trip Fuel</span><span>+ {{ tripFuelGal.toFixed(1) }} gal</span></div>
            <div class="detail-row"><span>Legal Reserve ({{ data.flightRules }} {{ data.vfrTime }})</span><span>+ {{ legalReserveFuelGal.toFixed(1) }} gal</span></div>
            <div v-if="data.ifrAlternateMinutes > 0" class="detail-row indent"><span>Alternate ({{ data.ifrAlternateMinutes }} min)</span><span>(incl. in reserve)</span></div>
            <div class="detail-row"><span>Personal Buffer ({{ data.personalBufferMinutes }} min)</span><span>+ {{ bufferFuelGal.toFixed(1) }} gal</span></div>
            <div class="detail-separator"></div>
            <div class="detail-row total"><span>Total Required Fuel</span><span>{{ totalRequiredFuel.toFixed(1) }} gal</span></div>
            <div class="detail-row limit"><span>Fuel On Board</span><span>{{ fuelOnBoard.toFixed(1) }} gal</span></div>
        </div>

        <div v-if="selectedCheck?.type === 'cg'" class="details-content">
            <div class="detail-row header"><span>Condition</span><span>Weight</span><span>Arm</span></div>
            <div class="detail-row"><span>Zero Fuel</span><span>{{ zeroFuel.weight.toFixed(0) }} lbs</span><span>{{ zeroFuel.arm.toFixed(2) }}"</span></div>
            <div class="detail-row"><span>Takeoff</span><span>{{ takeoff.weight.toFixed(0) }} lbs</span><span>{{ takeoff.arm.toFixed(2) }}"</span></div>
            <div class="detail-row"><span>Landing</span><span>{{ landing.weight.toFixed(0) }} lbs</span><span>{{ landing.arm.toFixed(2) }}"</span></div>
            <div class="detail-separator"></div>
            <div class="cg-info">
                All points must be within the forward and aft CG limits defined for this aircraft.
            </div>
        </div>

        <div v-if="selectedCheck?.type === 'taxi'" class="details-content">
            <p>Taxi fuel is the amount of fuel expected to be consumed before takeoff (engine start, taxi, run-up).</p>
            <div class="detail-row"><span>Entered Value</span><span>{{ (data.taxiFuelGallons || 0).toFixed(1) }} gal</span></div>
        </div>

        <div v-if="selectedCheck?.type === 'seats'" class="details-content">
            <p>Ensures that at least one person is seated in the front-most seats (pilot/co-pilot stations).</p>
            <div class="detail-row"><span>Status</span><span>{{ isFrontSeatOccupied ? 'Valid (Occupied)' : 'Invalid (Empty)' }}</span></div>
        </div>

        <div v-if="selectedCheck?.type === 'legs'" class="details-content">
            <div v-if="data.legs.length === 0">No legs defined.</div>
            <div v-else>
                <div class="detail-row header"><span>Leg Type</span><span>Duration</span><span>Fuel</span></div>
                <div v-for="(leg, idx) in data.legs" :key="idx" class="detail-row">
                    <span class="capitalize">{{ leg.type }}</span>
                    <span>{{ leg.durationMinutes }} min</span>
                    <span>{{ ((leg.type === 'climb' ? aircraft.data.climbFuel : leg.type === 'descent' ? aircraft.data.descentFuel : aircraft.data.cruiseFuel) * (leg.durationMinutes / 60)).toFixed(1) }} gal</span>
                </div>
            </div>
        </div>

        <div v-if="selectedCheck?.type === 'station'" class="details-content">
            <div class="detail-row"><span>Station Name</span><span>{{ selectedCheck.station.name }}</span></div>
            <div class="detail-row"><span>Current Weight</span><span>{{ selectedCheck.station.weight.toFixed(1) }} lbs</span></div>
            <div class="detail-row limit"><span>Max Allowed</span><span>{{ selectedCheck.station.max.toFixed(1) }} lbs</span></div>
            <div class="detail-separator"></div>
            <div class="detail-row diff" :class="{ 'overweight': selectedCheck.station.weight > selectedCheck.station.max }">
                <span>{{ selectedCheck.station.weight > selectedCheck.station.max ? 'Overweight By' : 'Remaining Capacity' }}</span>
                <span>{{ Math.abs(selectedCheck.station.max - selectedCheck.station.weight).toFixed(1) }} lbs</span>
            </div>
            <div class="detail-row fuel-eq">
                <span>Equivalent in Fuel</span>
                <span>{{ (Math.abs(selectedCheck.station.max - selectedCheck.station.weight) / 6).toFixed(1) }} gal</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import Dialog from 'primevue/dialog'

const props = defineProps<{
    visible: boolean
    selectedCheck: any
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

defineEmits(['update:visible'])

// --- Calculations (Replicated from CheckFlags for consistency) ---
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

const isFrontSeatOccupied = computed(() => {
    if (!props.aircraft.data.stations.length) return true
    const seats = props.aircraft.data.stations
        .map((s, index) => ({ ...s, index }))
        .filter(s => {
            const lower = (s.name || '').toLowerCase()
            const isFuel = lower.includes('fuel') || (s.type as string) === 'fuel'
            const isCargo = lower.includes('cargo') || lower.includes('baggage')
            return !isFuel && !isCargo
        })
    if (seats.length === 0) return true
    const minArm = Math.min(...seats.map(s => s.posInch))
    const frontSeatIndices = seats
        .filter(s => Math.abs(s.posInch - minArm) < 0.1)
        .map(s => s.index)
    return props.data.aircraftItems.some(item => 
        frontSeatIndices.includes(item.stationIndex) && item.weightLbs > 0
    )
})
</script>

<style scoped>

.details-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #475569;
}

.detail-row.header {
    font-weight: 700;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
}

.detail-row.header span {
    flex: 1;
}

.detail-row.header span:last-child {
    text-align: right;
}

.detail-row.header span:nth-child(2) {
    text-align: center;
}

.detail-row span:nth-child(2) {
    font-weight: 600;
}

.detail-separator {
    height: 1px;
    background-color: #e2e8f0;
    margin: 0.25rem 0;
}

.detail-row.total {
    font-weight: 700;
    color: #0f172a;
    font-size: 1rem;
}

.detail-row.limit {
    font-size: 0.8rem;
    color: #64748b;
    font-style: italic;
}

.detail-row.indent {
    padding-left: 1rem;
    font-size: 0.8rem;
    color: #94a3b8;
}

.cg-info {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.4;
}

.capitalize {
    text-transform: capitalize;
}

.detail-row.diff {
    font-weight: 600;
    color: #047857;
}

.detail-row.diff.overweight {
    color: #dc2626;
}

.detail-row.fuel-eq {
    font-size: 0.8rem;
    color: #64748b;
    font-style: italic;
}
</style>
