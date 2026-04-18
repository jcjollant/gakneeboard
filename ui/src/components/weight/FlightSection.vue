<template>
    <div class="flight-section">
        <div class="header">
            <h3>Flight Plan</h3>
        </div>
        <div class="flight-content">
            
            <div class="flight-settings">
                <div class="setting-group">
                    <label>Flight Rules</label>
                    <SelectButton v-model="data.flightRules" :options="['VFR', 'IFR']" @change="emitUpdate" />
                </div>
                
                <div v-if="data.flightRules === 'VFR'" class="setting-group">
                    <label>Time of Day</label>
                    <SelectButton v-model="vfrTimeComputed" :options="['Day', 'Night']" @change="emitUpdate" />
                </div>
                
                <div v-if="data.flightRules === 'IFR'" class="setting-group">
                    <label>Alternate (min)</label>
                    <InputNumber v-model="data.ifrAlternateMinutes" @value-change="emitUpdate" :min="0" />
                </div>
                
                <div class="setting-group">
                    <label>Buffer (min)</label>
                    <InputNumber v-model="data.personalBufferMinutes" @value-change="emitUpdate" :min="0" />
                </div>

                <div class="setting-group">
                    <label>Taxi Fuel (gal)</label>
                    <InputNumber v-model="data.taxiFuelGallons" @value-change="emitUpdate" :min="0" />
                </div>
            </div>

            <Separator name="Flight Legs" />

            <div class="legs-list">
                <div v-for="(leg, index) in data.legs" :key="leg.id" class="leg-card">
                    <div class="leg-header">
                        <span class="leg-type" :class="leg.type">
                            <i class="pi" :class="legIcon(leg.type)"></i> {{ leg.type.toUpperCase() }}
                        </span>
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="removeLeg(index)" />
                    </div>
                    <div class="leg-details">
                        <div class="leg-field">
                            <label>Duration (min)</label>
                            <InputNumber v-model="leg.durationMinutes" @value-change="emitUpdate" :min="0" class="p-inputtext-sm" />
                        </div>
                        <div class="leg-fuel-calc">
                            Est. Burn: <strong>{{ calcLegFuel(leg).toFixed(1) }} gal</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="add-leg mt-2">
                <Button label="Climb" icon="pi pi-arrow-up-right" class="p-button-outlined p-button-sm mr-2" @click="addLeg('climb')" />
                <Button label="Cruise" icon="pi pi-arrow-right" class="p-button-outlined p-button-sm mr-2" @click="addLeg('cruise')" />
                <Button label="Descent" icon="pi pi-arrow-down-right" class="p-button-outlined p-button-sm" @click="addLeg('descent')" />
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

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

const vfrTimeComputed = computed({
    get: () => props.data.vfrTime || 'Day',
    set: (val: 'Day' | 'Night') => { props.data.vfrTime = val }
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

function calcLegFuel(leg: FlightLeg) {
    const rate = leg.type === 'climb' ? props.aircraft.data.climbFuel 
               : leg.type === 'descent' ? props.aircraft.data.descentFuel
               : props.aircraft.data.cruiseFuel;
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
    border: 3px solid #dee2e6;
    border-radius: 8px;
    background-color: white;
    display: flex;
    flex-direction: column;
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

.flight-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.flight-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.setting-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.setting-group label {
    font-size: 0.9rem;
    font-weight: bold;
    color: #495057;
}

.legs-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.leg-card {
    border: 1px solid #ced4da;
    border-radius: 6px;
    background-color: #f8f9fa;
    width: 200px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.leg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.5rem 0.25rem 1rem;
    border-bottom: 1px solid #ced4da;
    background-color: white;
}

.leg-type {
    font-weight: bold;
    font-size: 0.85rem;
}

.leg-type.climb { color: #f59e0b; }
.leg-type.cruise { color: #0ea5e9; }
.leg-type.descent { color: #10b981; }

.leg-details {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.leg-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.leg-field label {
    font-size: 0.8rem;
    color: #6c757d;
}

.leg-fuel-calc {
    font-size: 0.9rem;
    background-color: rgba(3, 105, 161, 0.1);
    color: #0369a1;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
}
</style>


