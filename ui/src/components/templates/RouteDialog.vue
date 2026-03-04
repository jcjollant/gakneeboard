<template>
    <Dialog modal header="Route"
        v-model:visible="visible"
        @hide="$emit('cancel')"
        :style="{ width: '50vw', maxWidth: '600px' }"
        :breakpoints="{ '960px': '75vw', '640px': '100%' }">
        <p class="routeMessage">{{ message || defaultMessage }}</p>
        <div class="route-dialog">
            <AirportInput :code="route.dep || ''" label="Dep." :showRecent="true" :large="true" @valid="(a) => route.dep = a.code" @invalid="route.dep = undefined" />
            <AirportInput :code="route.dst || ''" label="Dest." :showRecent="true" :large="true" @valid="(a) => route.dst = a.code" @invalid="route.dst = undefined" />
            <AirportInput :code="route.alt || ''" label="Alter." :showRecent="true" :large="true" @valid="(a) => route.alt = a.code" @invalid="route.alt = undefined" />
            <DialogActions :videoLink="UserUrl.routeFeature" applyLabel="Confirm" @cancel="$emit('cancel')" @apply="onConfirm" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DialogActions from '../shared/DialogActions.vue'
import AirportInput from '../shared/AirportInput.vue'
import { Route } from '@gak/shared'
import { UserUrl } from '../../lib/UserUrl'

const props = defineProps<{
    modelValue: Route | undefined,
    message?: string,
}>()

const visible = defineModel<boolean>('visible', { default: false })
const emits = defineEmits(['cancel', 'confirm', 'update:modelValue'])
const defaultMessage = 'Here you can pick route airports. Check the video link below to learn more.'
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

.routeMessage {
    margin-bottom: 3rem;
}
</style>
