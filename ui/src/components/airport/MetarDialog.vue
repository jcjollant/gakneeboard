<template>
    <Dialog v-model:visible="visible" modal :header="headerTitle" :style="{ width: '50rem' }" :closable="true" @update:visible="onUpdateVisible">
        <MetarView v-if="metar" :metar="metar" />
        <div v-else>No METAR data available</div>
        <template #footer>
            <div class="dialog-footer">
                <Button label="Close" @click="closeDialog" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, PropType } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { Metar } from '@gak/shared';
import MetarView from './MetarView.vue';

const props = defineProps({
    visible: { type: Boolean, default: false },
    metar: { type: Object as PropType<Metar | null>, default: null },
    airportCode: { type: String, default: '' },
    airportName: { type: String, default: '' }
});

const emits = defineEmits(['update:visible', 'close']);

const visible = ref(props.visible);

watch(() => props.visible, (val) => {
    visible.value = val;
});

const headerTitle = computed(() => {
    if (props.airportName) {
        return `METAR for ${props.airportName} (${props.airportCode})`;
    }
    return `METAR for ${props.airportCode}`;
});

function onUpdateVisible(val: boolean) {
    emits('update:visible', val);
    if (!val) {
        emits('close');
    }
}

function closeDialog() {
    visible.value = false;
    emits('update:visible', false);
    emits('close');
}
</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
}
</style>
