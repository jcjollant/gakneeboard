<template>
    <div class="fuel-section">

        
        <div class="fuel-controls">
            <div class="main-row">
                <Slider v-model="fuelValue" :min="0" :max="maxUsable" :step="0.5" class="fuel-slider" />
                <div class="fuel-value-wrapper">
                    <button v-if="!isEditing" class="fuel-value-btn" @click="startEdit">
                        {{ fuelValue.toFixed(1) }} 
                    </button>
                    <InputNumber v-else ref="inputRef" v-model="fuelValue" :min="0" :max="maxUsable" 
                                :minFractionDigits="1" :maxFractionDigits="1" 
                                class="p-inputtext-sm compact-input" 
                                @blur="isEditing = false" @keydown.enter="isEditing = false" />
                    <span class="unit">gal</span>
                </div>
            </div>
            
            <div class="max-ramp-row">
                <label>Max Ramp Fuel</label>
                <button class="max-ramp-btn" @click="applySuggestedFuel" title="Set to Max Ramp Weight limit">
                    {{ suggestedFuel.toFixed(1) }} gal
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import { FuelWorksheetData } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

const maxUsable = computed(() => props.aircraft.data.maxUsableFuel || 0)
const payloadWeight = computed(() => props.data.aircraftItems.reduce((sum, item) => sum + (item.weightLbs || 0), 0))
const emptyWeight = computed(() => props.aircraft.data.basicEmptyWeight || 0)
const maxRampWeight = computed(() => props.aircraft.data.maxRampWeight || props.aircraft.data.maxTakeoffWeight || 0)

const maxFuelByWeight = computed(() => {
    const remaining = maxRampWeight.value - emptyWeight.value - payloadWeight.value
    return Math.max(0, remaining / 6)
})

const suggestedFuel = computed(() => Math.min(maxUsable.value, maxFuelByWeight.value))

const fuelValue = ref(props.data.fuelGallons || 0)
const isEditing = ref(false)
const inputRef = ref<any>(null)

function startEdit() {
    isEditing.value = true
    nextTick(() => {
        if (inputRef.value) {
            const el = inputRef.value.$el.querySelector('input')
            if (el) el.focus()
        }
    })
}

watch(() => props.data.fuelGallons, (newVal) => {
    if (newVal !== fuelValue.value) {
        fuelValue.value = newVal
    }
})

watch(fuelValue, (newVal) => {
    if (newVal !== props.data.fuelGallons) {
        onFuelChange()
    }
})

function onFuelChange() {
    emits('update', { fuelGallons: fuelValue.value })
}

function applySuggestedFuel() {
    fuelValue.value = Number(suggestedFuel.value.toFixed(1))
}
</script>

<style scoped>
.fuel-section {
    background-color: white;
    display: flex;
    flex-direction: column;
}





.fuel-controls {
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.main-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.fuel-slider {
    flex: 1;
}

.fuel-value-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 60px;
    justify-content: flex-end;
}

.fuel-value-wrapper .unit {
    font-size: 0.75rem;
    color: #94a3b8;
}

.max-ramp-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.25rem;
    border-top: 1px solid #f1f5f9;
}

.max-ramp-row label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.fuel-value-btn, .max-ramp-btn {
    font-size: 0.9rem;
    color: #0ea5e9;
    background-color: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.25rem 0.4rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;
    width: fit-content;
}

.max-ramp-btn:hover, .fuel-value-btn:hover {
    background-color: #f0f9ff;
    border-color: #0ea5e9;
}

.max-ramp-btn:active, .fuel-value-btn:active {
    background-color: #e0f2fe;
}

:deep(.p-inputnumber-input) {
    width: 65px;
    text-align: center;
    padding: 0.25rem;
}
</style>
