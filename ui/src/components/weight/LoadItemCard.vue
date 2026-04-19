<template>
    <div class="load-card" 
         :class="{ 'in-hangar': inHangar, 'is-person': item.isPerson }" 
         draggable="true" 
         @dragstart="onDragStart">
        <div class="details">
            <span class="name">{{ item.name }}</span>
            <div class="info-row">
                <font-awesome-icon :icon="item.isPerson ? 'user' : 'box'" class="item-icon" />
                <span class="weight">{{ (item.weightLbs || 0).toFixed(0) }} lbs</span>
            </div>
        </div>
        <div class="action-overlay" :class="inHangar ? 'delete' : 'eject'" 
             :title="inHangar ? 'Remove from Hangar' : 'Eject from Aircraft'"
             @click.stop="emits('action', item)">
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
    flex-direction: column;
    justify-content: center;
    background-color: white;
    padding: 0.4rem 0.5rem;
    border: 2px solid #f59e0b; /* Yellow/Amber for items - matches WeightLoad */
    border-radius: 4px;
    cursor: grab;
    width: 95px;
    height: 50px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.1s, border-color 0.2s;
    position: relative;
    box-sizing: border-box;
}

.load-card:active {
    cursor: grabbing;
}

.load-card:hover {
    transform: translateY(-2px);
    border-color: #d97706; /* Darker amber on hover */
}

.load-card.is-person:not(.in-hangar) {
    border-color: #166534; /* Dark green for people in aircraft */
}

.load-card.is-person:not(.in-hangar):hover {
    border-color: #15803d;
}

.item-icon {
    color: #94a3b8;
    font-size: 0.65rem;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.details {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    flex: 1;
    overflow: hidden;
    gap: 2px;
}

.name {
    font-size: 0.85rem;
    font-weight: bold;
    color: #1e293b;
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
    border: 1px dashed #94a3b8; /* Darker grey for hangar items */
}

.in-hangar:hover {
    border-color: #64748b;
    border-style: solid;
}
</style>
