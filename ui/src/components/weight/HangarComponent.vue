<template>
    <div class="hangar">
        <div class="header">
            <h3>Hangar</h3>
            <div class="actions">
                <Button icon="pi pi-user-plus" class="p-button-sm p-button-outlined" title="Add Person" @click="addPerson" />
                <Button icon="pi pi-box" class="p-button-sm p-button-outlined ml-2" title="Add Item" @click="addItem" />
            </div>
        </div>
        
        <div class="hangar-dropzone" 
             @dragover.prevent 
             @dragenter.prevent
             @drop="onDrop">
             
            <div v-if="data.hangarItems.length === 0" class="empty-state">
                No items in hangar. Click + to add.
            </div>
            
            <div v-for="item in data.hangarItems" :key="item.id">
                <LoadItemCard :item="item" inHangar @dragstart="onDragStart($event, item)" @action="removeItem(item.id)" />
            </div>
        </div>

        <Dialog v-model:visible="showDialog" :header="newItem.isPerson ? 'Add Person' : 'Add Item'" modal :style="{ width: '350px' }">
            <div class="p-fluid">
                <div class="p-field mb-3">
                    <label for="name" class="block text-sm font-bold mb-1">Name</label>
                    <InputText id="name" v-model="newItem.name" autofocus @keyup.enter="confirmAdd" />
                </div>
                <div class="p-field mb-3">
                    <label for="weight" class="block text-sm font-bold mb-1">Weight (lbs)</label>
                    <InputNumber id="weight" v-model="newItem.weightLbs" suffix=" lbs" :min="0" @keyup.enter="confirmAdd" />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-content-end gap-2 mt-2">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="showDialog = false" />
                    <Button label="Add to Hangar" icon="pi pi-check" class="p-button-primary" @click="confirmAdd" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FuelWorksheetData, LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import LoadItemCard from './LoadItemCard.vue'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const emits = defineEmits(['update'])

function emitUpdate() {
    emits('update', { hangarItems: props.data.hangarItems, aircraftItems: props.data.aircraftItems })
}

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

const showDialog = ref(false)
const newItem = reactive({
    name: '',
    weightLbs: 0,
    isPerson: false
})

function addPerson() {
    newItem.isPerson = true
    newItem.name = 'Passenger'
    newItem.weightLbs = 170
    showDialog.value = true
}

function addItem() {
    newItem.isPerson = false
    newItem.name = 'Baggage'
    newItem.weightLbs = 50
    showDialog.value = true
}

function confirmAdd() {
    props.data.hangarItems.push({
        id: generateId(),
        name: newItem.name,
        weightLbs: newItem.weightLbs,
        isPerson: newItem.isPerson
    })
    showDialog.value = false
    emitUpdate()
}

function removeItem(id: string) {
    const index = props.data.hangarItems.findIndex(i => i.id === id)
    if (index !== -1) {
        props.data.hangarItems.splice(index, 1)
        emitUpdate()
    }
}

function onDragStart(event: DragEvent, item: LoadItem) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify({ item, source: 'hangar' }))
        event.dataTransfer.effectAllowed = 'move'
    }
}

function onDrop(event: DragEvent) {
    const dataStr = event.dataTransfer?.getData('application/json')
    if (dataStr) {
        try {
            const { item, source } = JSON.parse(dataStr)
            
            // If it came from the aircraft, we move it back to hangar
            if (source === 'aircraft') {
                const acIndex = props.data.aircraftItems.findIndex((i: AssignedLoadItem) => i.id === item.id)
                if (acIndex !== -1) {
                    props.data.aircraftItems.splice(acIndex, 1)
                    
                    // Convert back to regular LoadItem by stripping station assignment info
                    const { stationIndex, slotIndex, ...loadItem } = item
                    props.data.hangarItems.push(loadItem as LoadItem)
                    
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
.hangar {
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

.hangar-dropzone {
    flex: 1;
    min-height: 100px;
    padding: 0.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-content: flex-start;
}

.empty-state {
    color: #adb5bd;
    font-style: italic;
    text-align: center;
    padding-top: 2rem;
}
</style>
