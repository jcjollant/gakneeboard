<template>
    <div class="fuel-section">

        
        <div class="fuel-controls">
            <div class="slider-row">
                <Slider v-model="fuelValue" :min="0" :max="maxUsable" :step="0.5" class="fuel-slider" @change="onFuelChange" />
            </div>
            
            <div class="input-row">
                <div class="input-group">
                    <label>Fuel Load</label>
                    <button v-if="!isEditing" class="fuel-value-btn" @click="startEdit">
                        {{ fuelValue.toFixed(1) }} gal
                    </button>
                    <InputNumber v-else ref="inputRef" v-model="fuelValue" :min="0" :max="maxUsable" 
                                :minFractionDigits="1" :maxFractionDigits="1" 
                                suffix=" gal" class="p-inputtext-sm" 
                                @value-change="onFuelChange" @blur="isEditing = false" @keydown.enter="isEditing = false" />
                </div>
                <div class="info-group">
                    <label>Max Ramp</label>
                    <button class="max-ramp-btn" @click="applySuggestedFuel" title="Set to Max Ramp Weight limit">
                        {{ suggestedFuel.toFixed(1) }} gal
                    </button>
                </div>
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
    fuelValue.value = newVal
})

function onFuelChange() {
    emits('update', { fuelGallons: fuelValue.value })
}

function applySuggestedFuel() {
    fuelValue.value = Number(suggestedFuel.value.toFixed(1))
    onFuelChange()
}
</script>

<style scoped>
.fuel-section {
    background-color: white;
    display: flex;
    flex-direction: column;
}





.fuel-controls {
    padding: 0.5rem 0.75rem 0.75rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.slider-row {
    padding: 0 0.5rem;
}

.fuel-slider :deep(.p-slider-handle) {
    background: #0ea5e9;
    border-color: #0ea5e9;
}

.fuel-slider :deep(.p-slider-range) {
    background: #0ea5e9;
}

.input-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.input-group, .info-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    align-items: center;
}



.input-group label, .info-group label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #6c757d;
    text-transform: uppercase;
}

.max-ramp-btn, .fuel-value-btn {
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
    width: 100%;
}
</style>
