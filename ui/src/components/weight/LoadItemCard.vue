<template>
    <div class="load-card" :class="{ 'in-hangar': inHangar }" draggable="true" @dragstart="onDragStart">
        <div class="icon">
            <font-awesome-icon :icon="item.isPerson ? 'user' : 'box'" />
        </div>
        <div class="details">
            <span class="name">{{ item.name }}</span>
            <span class="weight">{{ item.weightLbs }} lbs</span>
        </div>
        <div class="action-overlay" :class="inHangar ? 'delete' : 'eject'" @click.stop="emits('action', item)">
            <font-awesome-icon :icon="inHangar ? 'trash' : 'eject'" class="action-icon" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'

const props = defineProps<{
    item: LoadItem | AssignedLoadItem
    inHangar?: boolean
}>()

const emits = defineEmits(['dragstart', 'action'])

function onDragStart(event: DragEvent) {
    emits('dragstart', event)
}
</script>

<style scoped>
.load-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: white;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: grab;
    width: 95px;
    height: 50px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.1s, border-color 0.2s;
    position: relative;
    box-sizing: border-box;
    /* overflow: visible to allow action icon to pop out */
}

.load-card:active {
    cursor: grabbing;
}

.load-card:hover {
    transform: translateY(-2px);
    border-color: #0ea5e9;
}

.icon {
    color: #6c757d;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
}

.details {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.name {
    font-size: 0.85rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.weight {
    font-size: 0.75rem;
    color: #64748b;
}

.action-overlay {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    border: 1px solid white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.action-overlay.delete {
    background-color: #ef4444;
}

.action-overlay.eject {
    background-color: #3b82f6; /* blue */
}

.load-card:hover .action-overlay {
    display: flex;
}

.action-icon {
    font-size: 0.65rem;
    color: white;
}

.in-hangar {
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
}
</style>
