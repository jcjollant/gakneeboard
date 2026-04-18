<template>
    <div class="fuel-section bt">
        <div class="header">
            <h3>Fuel</h3>
            <div class="fuel-summary">
                <span class="value">{{ data.fuelGallons.toFixed(1) }}</span>
                <span class="unit">gal</span>
            </div>
        </div>
        
        <div class="fuel-controls">
            <div class="slider-row">
                <Slider v-model="fuelValue" :min="0" :max="maxUsable" :step="0.1" class="fuel-slider" @change="onFuelChange" />
            </div>
            
            <div class="input-row">
                <div class="input-group">
                    <label>Fuel Load</label>
                    <InputNumber v-model="fuelValue" :min="0" :max="maxUsable" :minFractionDigits="1" :maxFractionDigits="1" 
                                suffix=" gal" class="p-inputtext-sm" @value-change="onFuelChange" />
                </div>
                <div class="info-group">
                    <label>Max Usable</label>
                    <div class="static-val">{{ maxUsable.toFixed(1) }} gal</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const fuelValue = ref(props.data.fuelGallons || 0)

watch(() => props.data.fuelGallons, (newVal) => {
    fuelValue.value = newVal
})

function onFuelChange() {
    emits('update', { fuelGallons: fuelValue.value })
}
</script>

<style scoped>
.fuel-section {
    background-color: white;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.fuel-summary {
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.fuel-summary .value {
    font-size: 0.9rem;
    font-weight: bold;
    color: #0ea5e9;
}

.fuel-summary .unit {
    font-size: 0.7rem;
    color: #adb5bd;
}

.fuel-controls {
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
}

.input-group label, .info-group label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #6c757d;
    text-transform: uppercase;
}

.static-val {
    font-size: 0.9rem;
    color: #495057;
    padding: 0.4rem 0;
}

:deep(.p-inputnumber-input) {
    width: 100%;
}
</style>
