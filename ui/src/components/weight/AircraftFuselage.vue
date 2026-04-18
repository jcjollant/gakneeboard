<template>
    <div class="fuselage bt">
        <div class="header">
            <h3>Aircraft Load</h3>
        </div>
        <div class="fuselage-interior">
            <div v-for="(station, index) in filteredStations" :key="index" class="station-row">
                <!-- Cargo (Center) -->
                <div v-if="!isSideBySide(station)" class="station-dropzones single"
                     @dragover.prevent 
                     @dragenter.prevent
                     @drop="onDrop($event, station.originalIndex, 0)">
                     
                    <div v-if="getItemsForStation(station.originalIndex).length === 0" class="empty-slot placeholder">
                        {{ station.name }} ({{ station.posInch }}")
                    </div>
                    
                    <div v-for="item in getItemsForStation(station.originalIndex)" :key="item.id"
                         class="fuselage-item"
                         draggable="true"
                         @dragstart="onDragStart($event, item)">
                        <div class="icon"><font-awesome-icon :icon="item.isPerson ? 'fa-user' : 'fa-box'" /></div>
                        <div class="details">
                            <span class="name">{{ item.name }}</span>
                            <span class="weight">{{ item.weightLbs }} lbs</span>
                        </div>
                    </div>
                </div>

                <div v-else class="station-dropzones side-by-side">
                    <!-- Left Slot -->
                    <div class="dropzone-slot"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex, 0)">
                        <div v-if="!getItemInSlot(station.originalIndex, 0)" class="empty-slot">
                            {{ station.name }} (L) {{ station.posInch }}"
                        </div>
                        <div v-if="getItemInSlot(station.originalIndex, 0)" 
                             class="fuselage-item"
                             draggable="true"
                             @dragstart="onDragStart($event, getItemInSlot(station.originalIndex, 0)!)">
                            <div class="icon"><font-awesome-icon :icon="getItemInSlot(station.originalIndex, 0)!.isPerson ? 'fa-user' : 'fa-box'" /></div>
                            <div class="details">
                                <span class="name">{{ getItemInSlot(station.originalIndex, 0)!.name }}</span>
                                <span class="weight">{{ getItemInSlot(station.originalIndex, 0)!.weightLbs }} lbs</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Slot -->
                    <div class="dropzone-slot"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex, 1)">
                        <div v-if="!getItemInSlot(station.originalIndex, 1)" class="empty-slot">
                            {{ station.name }} (R) {{ station.posInch }}"
                        </div>
                        <div v-if="getItemInSlot(station.originalIndex, 1)" 
                             class="fuselage-item"
                             draggable="true"
                             @dragstart="onDragStart($event, getItemInSlot(station.originalIndex, 1)!)">
                            <div class="icon"><font-awesome-icon :icon="getItemInSlot(station.originalIndex, 1)!.isPerson ? 'fa-user' : 'fa-box'" /></div>
                            <div class="details">
                                <span class="name">{{ getItemInSlot(station.originalIndex, 1)!.name }}</span>
                                <span class="weight">{{ getItemInSlot(station.originalIndex, 1)!.weightLbs }} lbs</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FuelWorksheetData, LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

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
    emits('update', { tarmacItems: props.data.tarmacItems, aircraftItems: props.data.aircraftItems })
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

            if (source === 'tarmac') {
                // Move from tarmac to aircraft
                const tIndex = props.data.tarmacItems.findIndex((i: LoadItem) => i.id === item.id)
                if (tIndex !== -1) {
                    props.data.tarmacItems.splice(tIndex, 1)
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
}

.header {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.header h3 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: bold;
    color: #adb5bd;
    text-transform: uppercase;
}

.fuselage-interior {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    min-height: 48px;
}

.station-dropzones.single {
    width: 65%;
    background-color: rgba(255, 255, 255, 0.5);
    border: 2px dashed #ced4da;
    border-radius: 6px;
    padding: 0.5rem;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
}

.station-dropzones.side-by-side {
    width: 100%;
}

.dropzone-slot {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.5);
    border: 2px dashed #ced4da;
    border-radius: 6px;
    display: flex;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
}

.empty-slot {
    color: #adb5bd;
    font-size: 0.8rem;
    width: 100%;
    text-align: center;
    line-height: 1.2;
}

.empty-slot.placeholder {
    padding: 0.75rem 0;
}

.fuselage-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: white;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: grab;
    width: 100%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.1s;
}

.fuselage-item:active {
    cursor: grabbing;
}

.fuselage-item:hover {
    transform: translateY(-2px);
}

.icon {
    color: #6c757d;
    width: 20px;
    text-align: center;
}

.details {
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 0.85rem;
    font-weight: bold;
}

.weight {
    font-size: 0.75rem;
    color: #6c757d;
}
</style>
