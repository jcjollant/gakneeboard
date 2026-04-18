<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="aircraft ? aircraft.tailNumber : 'Aircraft Action'" :style="{ width: '500px' }">
        <div class="choice-container" v-if="aircraft">
            <div class="choice-item" @click="onEdit">
                <div class="choice-icon"><font-awesome-icon icon="fa-pen-to-square" /></div>
                <div class="choice-text">
                    <div class="choice-title">Edit Aircraft Data</div>
                    <div class="choice-desc">Modify performance and weight & balance</div>
                </div>
            </div>
            <div class="choice-item" @click="onCreateFuelWorksheet">
                <div class="choice-icon"><font-awesome-icon icon="fa-scale-balanced" /></div>
                <div class="choice-text">
                    <div class="choice-title">Create New Fuel Worksheet</div>
                    <div class="choice-desc">Start a new kneeboard with this aircraft</div>
                </div>
            </div>
            <div class="choice-item delete-choice" @click="onDelete">
                <div class="choice-icon"><font-awesome-icon icon="fa-trash" /></div>
                <div class="choice-text">
                    <div class="choice-title">Delete Aircraft</div>
                    <div class="choice-desc">Permanently remove this aircraft</div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { useConfirm } from 'primevue/useconfirm'
import { Aircraft } from '@gak/shared'

const props = defineProps<{
    visible: boolean
    aircraft: Aircraft | null
}>()

const emits = defineEmits(['update:visible', 'edit', 'create-fuel-worksheet', 'delete'])

const confirm = useConfirm()

function onEdit() {
    emits('update:visible', false)
    emits('edit', props.aircraft)
}

function onCreateFuelWorksheet() {
    emits('update:visible', false)
    emits('create-fuel-worksheet', props.aircraft)
}

function onDelete() {
    confirm.require({
        message: `Are you sure you want to delete aircraft ${props.aircraft?.tailNumber}?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            emits('update:visible', false)
            emits('delete', props.aircraft)
        }
    })
}
</script>

<style scoped>
.choice-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
}

.choice-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.choice-item:hover {
    background-color: #f8f9fa;
    border-color: var(--bg, #0369a1);
}

.choice-item.delete-choice:hover {
    border-color: #dc3545;
}
.choice-item.delete-choice:hover .choice-icon {
    color: #dc3545;
}

.choice-icon {
    font-size: 2rem;
    color: var(--bg, #0369a1);
    width: 3rem;
    text-align: center;
    transition: color 0.2s;
}

.choice-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.choice-desc {
    font-size: 0.9rem;
    color: #6c757d;
}
</style>
