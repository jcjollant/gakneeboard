<template>
    <div class="flight-section">

        <div class="flight-content">
            
            <div class="flight-settings">
                <div class="setting">
                    <label>Rules</label>
                    <EitherOr v-model="isVfr" either="VFR" or="IFR" :small="true" :embedded="true" />
                </div>
                
                <div v-if="data.flightRules === 'VFR'" class="setting">
                    <label>Time</label>
                    <EitherOr v-model="isDay" either="Day" or="Night" :small="true" :embedded="true" />
                </div>
                
                <div v-if="data.flightRules === 'IFR'" class="setting">
                    <label>Alternate (min)</label>
                    <InputNumber v-model="data.ifrAlternateMinutes" @value-change="emitUpdate" :min="0" class="p-inputtext-sm settings-input" />
                </div>
                
                <div class="setting">
                    <label>Taxi Fuel (gal)</label>
                    <InputNumber v-model="data.taxiFuelGallons" @value-change="emitUpdate" :min="0" class="p-inputtext-sm settings-input" />
                </div>
                
                <div class="setting">
                    <label>Personal Buffer (min)</label>
                    <InputNumber v-model="data.personalBufferMinutes" @value-change="emitUpdate" :min="0" class="p-inputtext-sm settings-input" />
                </div>
            </div>

            <div class="legs-table">
                <div class="legs-header bb">
                    <div class="col-type">Leg</div>
                    <div class="col-dur">Time</div>
                    <div class="col-flow">Flow</div>
                    <div class="col-burn">Burn</div>
                    <div class="col-actions"></div>
                </div>
                <div v-for="(leg, index) in data.legs" :key="leg.id" class="leg-row bb">
                    <div class="col-type" :class="leg.type">
                        <i class="pi" :class="legIcon(leg.type)"></i>
                    </div>
                    <div class="col-dur">
                        <InputNumber v-model="leg.durationMinutes" @value-change="emitUpdate" :min="0" class="p-inputtext-sm compact-input" />
                        <span class="unit">min</span>
                    </div>
                    <div class="col-flow">
                        {{ getFuelRate(leg).toFixed(1) }} <span class="unit">gph</span>
                    </div>
                    <div class="col-burn">
                        {{ calcLegFuel(leg).toFixed(1) }} <span class="unit">g</span>
                    </div>
                    <div class="col-actions">
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="removeLeg(index)" />
                    </div>
                </div>
            </div>

            <div class="add-leg mt-2">
                <Button label="Climb" icon="pi pi-arrow-up-right" class="p-button-text p-button-sm" @click="addLeg('climb')" />
                <Button label="Cruise" icon="pi pi-arrow-right" class="p-button-text p-button-sm" @click="addLeg('cruise')" />
                <Button label="Descent" icon="pi pi-arrow-down-right" class="p-button-text p-button-sm" @click="addLeg('descent')" />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData, FlightLeg } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import Separator from '../shared/Separator.vue'
import EitherOr from '../shared/EitherOr.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

const isVfr = computed({
    get: () => props.data.flightRules === 'VFR',
    set: (val: boolean) => { 
        props.data.flightRules = val ? 'VFR' : 'IFR'
        emitUpdate()
    }
})

const isDay = computed({
    get: () => (props.data.vfrTime || 'Day') === 'Day',
    set: (val: boolean) => { 
        props.data.vfrTime = val ? 'Day' : 'Night'
        emitUpdate()
    }
})

function emitUpdate() {
    emits('update', { 
        flightRules: props.data.flightRules,
        vfrTime: props.data.vfrTime,
        ifrAlternateMinutes: props.data.ifrAlternateMinutes,
        personalBufferMinutes: props.data.personalBufferMinutes,
        taxiFuelGallons: props.data.taxiFuelGallons,
        legs: props.data.legs
    })
}

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

function addLeg(type: 'climb' | 'cruise' | 'descent') {
    props.data.legs.push({
        id: generateId(),
        type,
        durationMinutes: type === 'climb' ? 10 : (type === 'descent' ? 15 : 60)
    })
    emitUpdate()
}

function removeLeg(index: number) {
    props.data.legs.splice(index, 1)
    emitUpdate()
}

function getFuelRate(leg: FlightLeg) {
    return leg.type === 'climb' ? props.aircraft.data.climbFuel 
         : leg.type === 'descent' ? props.aircraft.data.descentFuel
         : props.aircraft.data.cruiseFuel;
}

function calcLegFuel(leg: FlightLeg) {
    const rate = getFuelRate(leg);
    return rate * (leg.durationMinutes / 60)
}

function legIcon(type: string) {
    if (type === 'climb') return 'pi-arrow-up-right'
    if (type === 'descent') return 'pi-arrow-down-right'
    return 'pi-arrow-right'
}
</script>

<style scoped>
.flight-section {
    background-color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.flight-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    flex: 1;
}

.flight-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed #ced4da;
}

.setting {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.setting label {
    font-size: 0.75rem;
    font-weight: bold;
    color: #6c757d;
}

.legs-table {
    display: flex;
    flex-direction: column;
}

.legs-header {
    display: flex;
    font-size: 0.75rem;
    font-weight: bold;
    color: #adb5bd;
    padding-bottom: 0.25rem;
}

.leg-row {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
}

.col-type { width: 30px; text-align: center; }
.col-dur { flex: 1; display: flex; align-items: center; gap: 0.25rem; }
.col-flow { width: 80px; text-align: right; }
.col-burn { width: 80px; text-align: right; font-weight: bold; }
.col-actions { width: 40px; text-align: right; }

.col-type.climb { color: #991b1b; } /* Dark Red */
.col-type.cruise { color: #1e40af; } /* Dark Blue */
.col-type.descent { color: #166534; } /* Dark Green */

.unit {
    font-size: 0.75rem;
    color: #adb5bd;
    font-weight: normal;
}

.compact-input :deep(.p-inputtext),
.settings-input :deep(.p-inputtext) {
    width: 60px;
}
</style>


