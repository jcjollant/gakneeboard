<template>
    <div class="fuselage">
        <div class="fuselage-interior">
            <div v-for="(station, index) in filteredStations" :key="index" class="station-row">
                <!-- Cargo (Center) -->
                <div v-if="!isSideBySide(station)" class="station-dropzones single"
                     :class="{ filled: getItemsForStation(station.originalIndex).length > 0 }"
                     @dragover.prevent 
                     @dragenter.prevent
                     @drop="onDrop($event, station.originalIndex, 0)">
                     
                    <div v-if="getItemsForStation(station.originalIndex).length === 0" class="empty-slot placeholder">
                        {{ station.name }} ({{ station.posInch }}")
                    </div>
                    
                    <div v-for="item in getItemsForStation(station.originalIndex)" :key="item.id">
                        <LoadItemCard :item="item" @dragstart="onDragStart($event, item)" @action="ejectItem" />
                    </div>
                </div>

                <div v-else class="station-dropzones side-by-side">
                    <!-- Left Slot -->
                    <div class="dropzone-slot"
                         :class="{ filled: !!getItemInSlot(station.originalIndex, 0) }"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex, 0)">
                        <div v-if="!getItemInSlot(station.originalIndex, 0)" class="empty-slot">
                            {{ station.name }} (L) {{ station.posInch }}"
                        </div>
                        <div v-if="getItemInSlot(station.originalIndex, 0)">
                             <LoadItemCard :item="getItemInSlot(station.originalIndex, 0)!" @dragstart="onDragStart($event, getItemInSlot(station.originalIndex, 0)!)" @action="ejectItem" />
                        </div>
                    </div>
                    
                    <!-- Right Slot -->
                    <div class="dropzone-slot"
                         :class="{ filled: !!getItemInSlot(station.originalIndex, 1) }"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex, 1)">
                        <div v-if="!getItemInSlot(station.originalIndex, 1)" class="empty-slot">
                            {{ station.name }} (R) {{ station.posInch }}"
                        </div>
                        <div v-if="getItemInSlot(station.originalIndex, 1)">
                             <LoadItemCard :item="getItemInSlot(station.originalIndex, 1)!" @dragstart="onDragStart($event, getItemInSlot(station.originalIndex, 1)!)" @action="ejectItem" />
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <button 
            v-if="data.aircraftItems.length > 0"
            class="eject-all-btn" 
            @click="ejectAll"
            title="Send everything back to hangar"
        >
            <font-awesome-icon icon="eject" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData, LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import LoadItemCard from './LoadItemCard.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

const filteredStations = computed(() => {
    return props.aircraft.data.stations.map((s, index) => ({ ...s, originalIndex: index }))
        .filter(s => (s.type as string) !== 'fuel')
        .sort((a, b) => a.posInch - b.posInch)
})

function emitUpdate() {
    emits('update', { hangarItems: props.data.hangarItems, aircraftItems: props.data.aircraftItems })
}

function isSideBySide(station: any): boolean {
    if (station && station.type) {
        return station.type === 'twin'
    }
    const stationName = station?.name || ''
    const lower = stationName.toLowerCase()
    return lower.includes('pilot') || lower.includes('passenger') || lower.includes('seat')
}

function getItemsForStation(stationIndex: number) {
    return props.data.aircraftItems.filter(i => i.stationIndex === stationIndex)
}

function getItemInSlot(stationIndex: number, slotIndex: number) {
    return props.data.aircraftItems.find(i => i.stationIndex === stationIndex && i.slotIndex === slotIndex)
}

function ejectItem(item: AssignedLoadItem) {
    const aIndex = props.data.aircraftItems.findIndex(i => i.id === item.id)
    if (aIndex !== -1) {
        props.data.aircraftItems.splice(aIndex, 1)
        const { stationIndex, slotIndex, ...loadItem } = item
        props.data.hangarItems.push(loadItem as LoadItem)
        emitUpdate()
    }
}

function ejectAll() {
    // Collect all items to move
    const itemsToMove = props.data.aircraftItems.map(item => {
        const { stationIndex, slotIndex, ...loadItem } = item
        return loadItem as LoadItem
    })
    
    // Clear aircraft items and add to hangar
    props.data.aircraftItems.splice(0, props.data.aircraftItems.length)
    props.data.hangarItems.push(...itemsToMove)
    
    emitUpdate()
}

function onDragStart(event: DragEvent, item: AssignedLoadItem) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify({ item, source: 'aircraft' }))
        event.dataTransfer.effectAllowed = 'move'
    }
}

function onDrop(event: DragEvent, targetStationIndex: number, slotIndex: number = 0) {
    const dataStr = event.dataTransfer?.getData('application/json')
    if (dataStr) {
        try {
            const { item, source } = JSON.parse(dataStr)
            
            // Checking if specific slot is full for side-by-side seats
            const targetStation = props.aircraft.data.stations[targetStationIndex]
            if (isSideBySide(targetStation)) {
                if (getItemInSlot(targetStationIndex, slotIndex)) {
                    // It's full, cannot drop!
                    console.log('Cannot drop, seat is full.')
                    return;
                }
            }

            if (source === 'hangar') {
                // Move from hangar to aircraft
                const tIndex = props.data.hangarItems.findIndex((i: LoadItem) => i.id === item.id)
                if (tIndex !== -1) {
                    props.data.hangarItems.splice(tIndex, 1)
                    const assignedItem: AssignedLoadItem = { ...item, stationIndex: targetStationIndex, slotIndex }
                    props.data.aircraftItems.push(assignedItem)
                }
            } else if (source === 'aircraft') {
                // Move from one station to another inside aircraft
                const aIndex = props.data.aircraftItems.findIndex((i: AssignedLoadItem) => i.id === item.id)
                if (aIndex !== -1) {
                    // Update index and slot
                    props.data.aircraftItems[aIndex].stationIndex = targetStationIndex
                    props.data.aircraftItems[aIndex].slotIndex = slotIndex
                }
            }
            
            emitUpdate()
        } catch(e) {
            console.error('Drop parsing error', e)
        }
    }
}
</script>

<style scoped>
.fuselage {
    background-color: white;
    display: flex;
    flex-direction: column;
    position: relative;
}

.aircraft-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.75rem;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.aircraft-header .label {
    font-size: 0.65rem;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.eject-all-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 20;
    opacity: 0.6;
}

.eject-all-btn:hover {
    background-color: #2563eb;
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.eject-all-btn:active {
    transform: scale(0.95);
}

.fuselage-interior {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    background-color: white;
}

.station-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
}

.station-dropzones {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.station-dropzones.single {
    width: 95px;
    height: 50px;
    background-color: rgba(248, 250, 252, 0.8);
    border: 2px dashed #ced4da;
    border-radius: 6px;
    padding: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}

.station-dropzones.side-by-side {
    width: 100%;
}

.dropzone-slot {
    width: 95px;
    height: 50px;
    background-color: rgba(248, 250, 252, 0.8);
    border: 2px dashed #ced4da;
    border-radius: 6px;
    display: flex;
    padding: 0;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    transition: all 0.2s;
}

.station-dropzones.filled, .dropzone-slot.filled {
    border-color: transparent;
    background-color: transparent;
    height: auto;
    min-height: 50px;
}

.empty-slot {
    color: #adb5bd;
    font-size: 0.7rem;
    width: 100%;
    text-align: center;
    line-height: 1.2;
    padding: 0 4px;
    box-sizing: border-box;
}

.empty-slot.placeholder {
    padding: 0.75rem 0;
}
</style>
