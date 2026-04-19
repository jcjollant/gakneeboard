<template>
    <div class="cg-envelope" :class="{ 'no-border': !showTitle }">
        <div v-if="showTitle" class="header">
            <h3>CG Envelope</h3>
        </div>
        <div class="svg-container">
            <svg v-if="isValidEnvelope" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                 
                 <!-- Grid Lines (Optional) -->
                 <line x1="40" y1="260" x2="360" y2="260" stroke="#ced4da" stroke-width="1" />
                 <line x1="40" y1="40" x2="40" y2="260" stroke="#ced4da" stroke-width="1" />

                 <!-- Envelope Polygon -->
                 <polygon :points="envelopePointsStr" fill="rgba(3, 105, 161, 0.2)" stroke="#0369a1" stroke-width="2" stroke-linejoin="round" />
                 
                 <template v-if="props.data">
                    <!-- Path line between Zero Fuel and Takeoff -->
                    <line :x1="mapX(zeroFuel.arm)" :y1="mapY(zeroFuel.weight)" :x2="mapX(takeoff.arm)" :y2="mapY(takeoff.weight)" 
                        stroke="#6c757d" stroke-width="1.5" stroke-dasharray="5,5" />
                    <!-- Zero Fuel CG -->
                    <circle :cx="mapX(zeroFuel.arm)" :cy="mapY(zeroFuel.weight)" r="5" fill="#ef4444" />
                    
                    <!-- Takeoff CG -->
                    <circle :cx="mapX(takeoff.arm)" :cy="mapY(takeoff.weight)" r="5" fill="#10b981" />
                    
                    <!-- Landing CG -->
                    <circle :cx="mapX(landing.arm)" :cy="mapY(landing.weight)" r="5" fill="#3b82f6" />
                 </template>

            </svg>
            <div v-else class="invalid-envelope">
                Not enough CG limits defined in aircraft data to draw envelope.
            </div>
        </div>
        <div v-if="props.data" class="plot-legend">
            <div class="legend-item"><span class="swatch zero"></span> Zero Fuel</div>
            <div class="legend-item"><span class="swatch takeoff"></span> Take Off</div>
            <div class="legend-item"><span class="swatch landing"></span> Landing</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

const props = withDefaults(defineProps<{
    data?: FuelWorksheetData
    aircraft: Aircraft
    showTitle?: boolean
}>(), {
    showTitle: true
})

// SVG Constants
const SVG_WIDTH = 400
const SVG_HEIGHT = 300
const PADDING = 40

const isValidEnvelope = computed(() => {
    return props.aircraft.data.fwdCgLimits.length > 0 && props.aircraft.data.aftCgLimits.length > 0
})

// Boundings for scaling
const minX = computed(() => {
    const limits = [...props.aircraft.data.fwdCgLimits, ...props.aircraft.data.aftCgLimits]
    const minArm = Math.min(...limits.map(l => l.posInch))
    if (props.data) {
        return Math.min(minArm - 2, zeroFuel.value.arm - 2)
    }
    return minArm - 2
})
const maxX = computed(() => {
    const limits = [...props.aircraft.data.fwdCgLimits, ...props.aircraft.data.aftCgLimits]
    const maxArm = Math.max(...limits.map(l => l.posInch))
    if (props.data) {
        return Math.max(maxArm + 2, zeroFuel.value.arm + 2)
    }
    return maxArm + 2
})
const minY = computed(() => {
    const limits = [...props.aircraft.data.fwdCgLimits, ...props.aircraft.data.aftCgLimits]
    const minW = Math.min(...limits.map(l => l.weightLbs))
    if (props.data) {
        return Math.min(minW - 200, zeroFuel.value.weight - 200)
    }
    return minW - 200
})
const maxY = computed(() => {
    const maxLimitWeight = Math.max(...props.aircraft.data.aftCgLimits.map(l=>l.weightLbs), ...props.aircraft.data.fwdCgLimits.map(l=>l.weightLbs))
    return (props.aircraft.data.maxTakeoffWeight || maxLimitWeight) + 100
})

function mapX(arm: number) {
    const range = (maxX.value - minX.value) || 1
    return PADDING + ((arm - minX.value) / range) * (SVG_WIDTH - 2 * PADDING)
}

function mapY(weight: number) {
    const range = (maxY.value - minY.value) || 1
    return SVG_HEIGHT - PADDING - ((weight - minY.value) / range) * (SVG_HEIGHT - 2 * PADDING)
}

const envelopePointsStr = computed(() => {
    if (!isValidEnvelope.value) return ''
    
    // Sort fwds bottom to top
    const fwds = [...props.aircraft.data.fwdCgLimits].sort((a,b) => a.weightLbs - b.weightLbs)
    // Sort afts top to bottom
    const afts = [...props.aircraft.data.aftCgLimits].sort((a,b) => b.weightLbs - a.weightLbs)
    
    const combined = [...fwds, ...afts]
    return combined.map(pt => `${mapX(pt.posInch)},${mapY(pt.weightLbs)}`).join(' ')
})

// --- Physics Calculations ---
const payloadWeight = computed(() => {
    if (!props.data) return 0
    return props.data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0)
})
const payloadMoment = computed(() => {
    if (!props.data) return 0
    return props.data.aircraftItems.reduce((sum, item) => {
        const station = props.aircraft.data.stations[item.stationIndex]
        return sum + (item.weightLbs * (station?.posInch || 0))
    }, 0)
})

const zeroFuelWeight = computed(() => props.aircraft.data.basicEmptyWeight + payloadWeight.value)
const zeroFuelMoment = computed(() => (props.aircraft.data.basicEmptyWeight * props.aircraft.data.basicEmptyCg) + payloadMoment.value)
const zeroFuelArm = computed(() => zeroFuelMoment.value / (zeroFuelWeight.value || 1))

const fuelArm = computed(() => {
    const station = props.aircraft.data.stations.find(s => (s.type as string) === 'fuel' || s.name.toLowerCase().includes('fuel'))
    return station ? station.posInch : props.aircraft.data.basicEmptyCg // Safe fallback
})

const flightLegsFuelGal = computed(() => {
    if (!props.data) return 0
    return props.data.legs.reduce((sum, leg) => {
        const rate = leg.type === 'climb' ? props.aircraft.data.climbFuel 
                   : leg.type === 'descent' ? props.aircraft.data.descentFuel
                   : props.aircraft.data.cruiseFuel;
        return sum + (rate * (leg.durationMinutes / 60));
    }, 0);
})

const alternateFuelGal = computed(() => {
    if (!props.data) return 0
    return (props.data.ifrAlternateMinutes / 60) * props.aircraft.data.cruiseFuel
})
const bufferFuelGal = computed(() => {
    if (!props.data) return 0
    return (props.data.personalBufferMinutes / 60) * props.aircraft.data.cruiseFuel
})

const legalReserveFuelGal = computed(() => {
    const cruiseRate = props.aircraft.data.cruiseFuel;
    if (props.data) {
        if (props.data.flightRules === 'IFR') {
            return (45 / 60) * cruiseRate + alternateFuelGal.value;
        } else {
            const mins = props.data.vfrTime === 'Night' ? 45 : 30;
            return (mins / 60) * cruiseRate;
        }
    }
    return 0
})

const fuelAtTakeoffGal = computed(() => {
    if (props.data && props.data.fuelGallons !== undefined) {
        return Math.max(0, props.data.fuelGallons - (props.data.taxiFuelGallons || 0))
    }
    return flightLegsFuelGal.value + legalReserveFuelGal.value + bufferFuelGal.value
})
const fuelAtTakeoffWeight = computed(() => fuelAtTakeoffGal.value * 6)
const fuelAtTakeoffMoment = computed(() => fuelAtTakeoffWeight.value * fuelArm.value)

const flightLegsFuelWeight = computed(() => flightLegsFuelGal.value * 6)
const flightLegsFuelMoment = computed(() => flightLegsFuelWeight.value * fuelArm.value)

// Export Points
const zeroFuel = computed(() => {
    if (!props.data) return { weight: 0, arm: 0 }
    return {
        weight: zeroFuelWeight.value,
        arm: zeroFuelArm.value
    }
})

const takeoff = computed(() => {
    if (!props.data) return { weight: 0, arm: 0 }
    return {
        weight: zeroFuelWeight.value + fuelAtTakeoffWeight.value,
        arm: (zeroFuelMoment.value + fuelAtTakeoffMoment.value) / ((zeroFuelWeight.value + fuelAtTakeoffWeight.value) || 1)
    }
})

const landing = computed(() => {
    if (!props.data) return { weight: 0, arm: 0 }
    return {
        weight: takeoff.value.weight - flightLegsFuelWeight.value,
        arm: ((takeoff.value.weight * takeoff.value.arm) - flightLegsFuelMoment.value) / ((takeoff.value.weight - flightLegsFuelWeight.value) || 1)
    }
})
</script>

<style scoped>
.cg-envelope {
    background-color: white;
    display: flex;
    flex-direction: column;
}

.cg-envelope.no-border {
    border: none;
}

.header {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
    border-radius: 6px 6px 0 0;
}

.header h3 {
    margin: 0;
    color: #495057;
}

.svg-container {
    flex: 1;
    min-height: 180px;
    padding: 0.25rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.invalid-envelope {
    color: #adb5bd;
    font-style: italic;
    text-align: center;
}

.plot-label {
    font-size: 10px;
    fill: #495057;
    font-weight: bold;
}

.plot-legend {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.25rem;
    border-top: 1px solid #dee2e6;
    background-color: #f8f9fa;
    font-size: 0.7rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
}

.swatch.zero { background-color: #ef4444; }
.swatch.takeoff { background-color: #10b981; }
.swatch.landing { background-color: #3b82f6; }
</style>
