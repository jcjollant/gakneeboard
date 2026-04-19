<template>
    <Dialog v-model:visible="visible" header="Time Calculator" modal :style="{ width: '340px' }">
        <div class="calculator-body">
            <div class="field">
                <label>Distance (nm)</label>
                <InputNumber v-model="distance" :min="0" :maxFractionDigits="1" autofocus class="p-inputtext-sm" @keyup.enter="apply" />
            </div>
            
            <div class="field">
                <label>Heading (deg)</label>
                <InputNumber v-model="heading" :min="0" :max="360" :maxFractionDigits="0" class="p-inputtext-sm" @keyup.enter="apply" />
            </div>

            <div class="field">
                <label>True Air Speed (kts)</label>
                <InputNumber v-model="speed" :min="1" :maxFractionDigits="0" class="p-inputtext-sm" @keyup.enter="apply" />
            </div>

            <div class="field-row">
                <div class="field">
                    <label>Wind Dir</label>
                    <InputNumber v-model="windDir" :min="0" :max="360" :maxFractionDigits="0" class="p-inputtext-sm" @keyup.enter="apply" />
                </div>
                <div class="field">
                    <label>Wind Speed</label>
                    <InputNumber v-model="windSpeed" :min="0" :maxFractionDigits="0" class="p-inputtext-sm" @keyup.enter="apply" />
                </div>
            </div>

            <div class="result mt-4">
                <div class="result-label">Calculated Time</div>
                <div class="result-value">
                    <span class="number">{{ calculatedTime }}</span>
                    <span class="unit">min</span>
                </div>
                <div class="gs-hint mt-2">
                    Used Ground Speed: <strong>{{ groundSpeed.toFixed(0) }} kts</strong>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Cancel" @click="visible = false" link class="p-button-sm" />
                <Button label="Apply" icon="pi pi-check" @click="apply" :disabled="!calculatedTime" class="p-button-sm" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { NavMath } from '../../../../shared/src/services/NavMath'

const props = defineProps<{
    initialSpeed?: number
}>()

const visible = defineModel<boolean>('visible')
const emit = defineEmits(['apply'])

const activeLegIndex = ref<number | null>(null)
const distance = ref<number | null>(null)
const speed = ref<number>(props.initialSpeed || 100)
const heading = ref<number>(0)
const windDir = ref<number>(0)
const windSpeed = ref<number>(0)

watch(() => props.initialSpeed, (newVal) => {
    if (newVal) speed.value = newVal
}, { immediate: true })

watch(visible, (isNowVisible) => {
    if (isNowVisible && props.initialSpeed) {
        speed.value = props.initialSpeed
    }
})

const groundSpeed = computed(() => {
    return NavMath.calculateGroundSpeed(
        speed.value || 0,
        heading.value || 0,
        windDir.value || 0,
        windSpeed.value || 0
    )
})

const calculatedTime = computed(() => {
    if (!distance.value || !groundSpeed.value) return 0
    return Math.round((distance.value / groundSpeed.value) * 60)
})

function apply() {
    if (!calculatedTime.value) return
    emit('apply', calculatedTime.value)
    visible.value = false
}
</script>

<style scoped>
.calculator-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
}

.field-row .field {
    min-width: 0;
}

.field label {
    font-size: 0.75rem;
    font-weight: bold;
    color: #64748b;
    text-transform: uppercase;
}

.result {
    padding: 1rem;
    background-color: #f0f9ff;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #bae6fd;
}

.gs-hint {
    font-size: 0.75rem;
    color: #64748b;
    font-style: italic;
}

.result-label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #0369a1;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
}

.result-value {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.result-value .number {
    font-size: 2rem;
    font-weight: 800;
    color: #0ea5e9;
    line-height: 1;
}

.result-value .unit {
    font-size: 0.9rem;
    font-weight: bold;
    color: #0ea5e9;
}

:deep(.p-inputnumber),
:deep(.p-inputnumber .p-inputtext) {
    width: 100% !important;
    min-width: 0;
}
</style>
