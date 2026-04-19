<template>
    <Dialog v-model:visible="visible" header="Time Calculator" modal :style="{ width: '320px' }">
        <div class="calculator-body">
            <div class="field">
                <label>Distance (nm)</label>
                <InputNumber v-model="distance" :min="0" :maxFractionDigits="1" autofocus class="p-inputtext-sm" @keyup.enter="apply" />
            </div>
            
            <div class="field">
                <label>Ground Speed (kts)</label>
                <InputNumber v-model="speed" :min="1" :maxFractionDigits="0" class="p-inputtext-sm" @keyup.enter="apply" />
            </div>

            <div class="result mt-4">
                <div class="result-label">Calculated Time</div>
                <div class="result-value">
                    <span class="number">{{ calculatedTime }}</span>
                    <span class="unit">min</span>
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

const props = defineProps<{
    initialSpeed?: number
}>()

const visible = defineModel<boolean>('visible')
const emit = defineEmits(['apply'])

const distance = ref<number | null>(null)
const speed = ref<number>(props.initialSpeed || 100)

watch(() => props.initialSpeed, (newVal) => {
    if (newVal) speed.value = newVal
}, { immediate: true })

const calculatedTime = computed(() => {
    if (!distance.value || !speed.value) return 0
    return Math.round((distance.value / speed.value) * 60)
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

:deep(.p-inputnumber) {
    width: 100%;
}
</style>
