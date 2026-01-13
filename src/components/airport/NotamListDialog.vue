<template>
    <Dialog v-model:visible="visible" modal :header="headerTitle" :style="{ width: '50rem' }" :closable="true" @update:visible="onUpdateVisible">
        <div class="notam-list">
            <div v-if="notams.length === 0">No NOTAMs found.</div>
            <div v-for="(notam, index) in notams" :key="index" class="notam-item">
                {{ notam.text }}
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <a href="https://notams.aim.faa.gov/notamSearch/nsapp.html#/" target="_blank" class="faa-link">Official FAA Notam Search</a>
                <Button label="Close" @click="closeDialog" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { Notam } from '../../models/Notam';

const props = defineProps({
    visible: { type: Boolean, default: false },
    notams: { type: Array as () => Notam[], default: () => [] },
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
        return `NOTAMs for ${props.airportName} (${props.airportCode})`;
    }
    return `NOTAMs for ${props.airportCode}`;
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
.notam-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 60vh;
    overflow-y: auto;
}

.notam-item {
    padding: 10px;
    border-bottom: 1px solid #ccc;
}

.notam-item:last-child {
    border-bottom: none;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.faa-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9em;
}

.faa-link:hover {
    text-decoration: underline;
}
</style>
