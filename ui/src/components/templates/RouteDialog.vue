<template>
    <Dialog modal header="Route"
        :style="{ width: '50vw', maxWidth: '600px' }"
        :breakpoints="{ '960px': '75vw', '640px': '100%' }">
        <p style="margin-bottom: 1rem;">{{ message || defaultMessage }}</p>
        <div class="route-dialog">
            <AirportInput :code="route.dep || ''" label="Dep." :expanded="true" :large="true" @valid="(a) => route.dep = a.code" @invalid="route.dep = undefined" />
            <AirportInput :code="route.dst || ''" label="Dest." :expanded="true" :large="true" @valid="(a) => route.dst = a.code" @invalid="route.dst = undefined" />
            <AirportInput :code="route.alt || ''" label="Alter." :expanded="true" :large="true" @valid="(a) => route.alt = a.code" @invalid="route.alt = undefined" />
            <div class="dialog-actions">
                <Button label="Cancel" @click="$emit('cancel')" link />
                <Button label="Confirm" @click="onConfirm" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AirportInput from '../shared/AirportInput.vue'
import { Route } from '@gak/shared'

const props = defineProps<{
    modelValue: Route | undefined,
    message?: string
}>()

const emits = defineEmits(['cancel', 'confirm', 'update:modelValue'])
const defaultMessage = 'Set the departure, destination, and alternate airports to apply across the kneeboard.'
const route = ref<Route>({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
    route.value = { ...newVal }
}, { deep: true })

function onConfirm() {
    emits('confirm', { ...route.value })
}
</script>

<style scoped>
.route-dialog {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}
</style>
