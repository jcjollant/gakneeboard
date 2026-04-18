<template>
    <div class="fuselage">
        <div class="header">
            <h3>Aircraft Fuselage</h3>
        </div>
        <div class="fuselage-interior">
            <div v-for="(station, index) in filteredStations" :key="index" class="station-row">
                <div class="station-label">
                    <span class="station-name">{{ station.name }}</span>
                    <span class="station-arm">{{ station.posInch }}"</span>
                </div>
                
                <!-- Cargo (Center) -->
                <div v-if="!isSideBySide(station)" class="station-dropzones single"
                     @dragover.prevent 
                     @dragenter.prevent
                     @drop="onDrop($event, station.originalIndex)">
                     
                    <div v-if="getItemsForStation(station.originalIndex).length === 0" class="empty-slot placeholder">
                        Drop items here
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

                <!-- Seats (Side By Side) -->
                <div v-else class="station-dropzones side-by-side">
                    <!-- Left Slot -->
                    <div class="dropzone-slot"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex)">
                        <div v-if="getItemsForStation(station.originalIndex).length === 0" class="empty-slot">
                            L Seat
                        </div>
                        <div v-for="item in getItemsForStation(station.originalIndex).slice(0, 1)" :key="item.id"
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
                    
                    <!-- Right Slot -->
                    <div class="dropzone-slot"
                         @dragover.prevent 
                         @dragenter.prevent
                         @drop="onDrop($event, station.originalIndex)">
                        <div v-if="getItemsForStation(station.originalIndex).length <= 1" class="empty-slot">
                            R Seat
                        </div>
                        <div v-for="item in getItemsForStation(station.originalIndex).slice(1, 2)" :key="item.id"
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
        .filter(s => s.type !== 'fuel')
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

function onDragStart(event: DragEvent, item: AssignedLoadItem) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify({ item, source: 'aircraft' }))
        event.dataTransfer.effectAllowed = 'move'
    }
}

function onDrop(event: DragEvent, targetStationIndex: number) {
    const dataStr = event.dataTransfer?.getData('application/json')
    if (dataStr) {
        try {
            const { item, source } = JSON.parse(dataStr)
            
            // Checking if slot is full for side-by-side seats
            const targetStation = props.aircraft.data.stations[targetStationIndex]
            if (isSideBySide(targetStation)) {
                if (getItemsForStation(targetStationIndex).length >= 2) {
                    // It's full, cannot drop!
                    console.log('Cannot drop, seats are full.')
                    return;
                }
            }

            if (source === 'tarmac') {
                // Move from tarmac to aircraft
                const tIndex = props.data.tarmacItems.findIndex((i: LoadItem) => i.id === item.id)
                if (tIndex !== -1) {
                    props.data.tarmacItems.splice(tIndex, 1)
                    const assignedItem: AssignedLoadItem = { ...item, stationIndex: targetStationIndex }
                    props.data.aircraftItems.push(assignedItem)
                }
            } else if (source === 'aircraft') {
                // Move from one station to another inside aircraft
                const aIndex = props.data.aircraftItems.findIndex((i: AssignedLoadItem) => i.id === item.id)
                if (aIndex !== -1) {
                    // Update index
                    props.data.aircraftItems[aIndex].stationIndex = targetStationIndex
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
    border: 3px solid #dee2e6;
    border-radius: 8px;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: white;
    border-radius: 6px 6px 0 0;
}

.header h3 {
    margin: 0;
    color: #495057;
}

.fuselage-interior {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: #e9ecef; /* slightly darker to look like inside */
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.station-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.station-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    font-weight: bold;
    color: #495057;
}

.station-arm {
    color: #6c757d;
    font-weight: normal;
}

.station-dropzones {
    display: flex;
    gap: 1rem;
    min-height: 60px;
}

.station-dropzones.single {
    background-color: rgba(255, 255, 255, 0.5);
    border: 2px dashed #ced4da;
    border-radius: 6px;
    padding: 0.5rem;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
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
    font-size: 0.9rem;
    width: 100%;
    text-align: center;
}

.empty-slot.placeholder {
    padding: 1rem 0;
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
