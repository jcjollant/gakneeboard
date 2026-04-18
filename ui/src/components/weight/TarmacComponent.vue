<template>
    <div class="tarmac">
        <div class="header">
            <h3>Tarmac</h3>
            <div class="actions">
                <Button icon="pi pi-user-plus" class="p-button-sm p-button-outlined" title="Add Person" @click="addPerson" />
                <Button icon="pi pi-box" class="p-button-sm p-button-outlined ml-2" title="Add Item" @click="addItem" />
            </div>
        </div>
        
        <div class="tarmac-dropzone" 
             @dragover.prevent 
             @dragenter.prevent
             @drop="onDrop">
             
            <div v-if="data.tarmacItems.length === 0" class="empty-state">
                No items on tarmac. Click + to add.
            </div>
            
            <div v-for="item in data.tarmacItems" :key="item.id" 
                 class="tarmac-item" 
                 draggable="true" 
                 @dragstart="onDragStart($event, item)">
                 
                <div class="icon">
                    <font-awesome-icon :icon="item.isPerson ? 'fa-user' : 'fa-box'" />
                </div>
                <div class="details">
                    <InputText v-model="item.name" class="p-inputtext-sm item-name" placeholder="Name" @change="emitUpdate" />
                    <InputNumber v-model="item.weightLbs" class="p-inputtext-sm item-weight" suffix=" lbs" placeholder="Weight" @value-change="emitUpdate" />
                </div>
                <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-danger p-button-sm delete-btn" @click="removeItem(item.id)" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FuelWorksheetData, LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

function emitUpdate() {
    emits('update', { tarmacItems: props.data.tarmacItems, aircraftItems: props.data.aircraftItems })
}

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

function addPerson() {
    props.data.tarmacItems.push({
        id: generateId(),
        name: 'Passenger',
        weightLbs: 170, // Standard FAA average weight
        isPerson: true
    })
    emitUpdate()
}

function addItem() {
    props.data.tarmacItems.push({
        id: generateId(),
        name: 'Baggage',
        weightLbs: 50,
        isPerson: false
    })
    emitUpdate()
}

function removeItem(id: string) {
    const index = props.data.tarmacItems.findIndex(i => i.id === id)
    if (index !== -1) {
        props.data.tarmacItems.splice(index, 1)
        emitUpdate()
    }
}

function onDragStart(event: DragEvent, item: LoadItem) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify({ item, source: 'tarmac' }))
        event.dataTransfer.effectAllowed = 'move'
    }
}

function onDrop(event: DragEvent) {
    const dataStr = event.dataTransfer?.getData('application/json')
    if (dataStr) {
        try {
            const { item, source } = JSON.parse(dataStr)
            
            // If it came from the aircraft, we move it back to tarmac
            if (source === 'aircraft') {
                const acIndex = props.data.aircraftItems.findIndex((i: AssignedLoadItem) => i.id === item.id)
                if (acIndex !== -1) {
                    props.data.aircraftItems.splice(acIndex, 1)
                    
                    // Convert back to regular LoadItem by stripping stationIndex
                    const { stationIndex, ...loadItem } = item
                    props.data.tarmacItems.push(loadItem as LoadItem)
                    
                    emitUpdate()
                }
            }
        } catch(e) {
            console.error('Drop parsing error', e)
        }
    }
}
</script>

<style scoped>
.tarmac {
    background-color: white;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.tarmac-dropzone {
    flex: 1;
    min-height: 100px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.empty-state {
    color: #adb5bd;
    font-style: italic;
    text-align: center;
    padding-top: 2rem;
}

.tarmac-item {
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 0.25rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: grab;
    position: relative;
}

.tarmac-item .icon {
    position: absolute;
    top: 5px;
    left: 5px;
    font-size: 0.8rem;
    opacity: 0.3;
}

.tarmac-item .details {
    display: flex;
    flex-direction: column;
}

.tarmac-item .delete-btn {
    position: absolute;
    top: 0;
    right: 0;
}

.item-name {
    width: 100%;
    margin-bottom: 2px;
}

.item-weight {
    width: 100%;
}
</style>
