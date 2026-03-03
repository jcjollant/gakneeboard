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
            <div class="dialog-actions">
                <font-awesome-icon :icon="['fas', 'video']" class="video-link"
                    @click="UserUrl.open(UserUrl.routeVideo)" title="Watch a video on this feature"></font-awesome-icon>
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 3rem;
    align-items: center;
}
.video-link {
    margin-right: auto;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
    color: var(--bg);
    transition: color 0.2s;
}
.video-link:hover {
    color: var(--bg-hover);
}
.routeMessage {
    margin-bottom: 3rem;
}
</style>
