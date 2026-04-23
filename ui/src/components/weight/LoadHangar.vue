<template>
    <div class="hangar">
        <div class="hangar-dropzone" 
             @dragover.prevent 
             @dragenter.prevent
             @drop="onDrop">
             
            <button class="add-button" :class="{ 'bounce-invitation': isCompletelyEmpty }" @click="openAddDialog" title="Add Item">
                <i class="pi pi-plus"></i>
                <span v-if="isCompletelyEmpty" class="btn-label">START HERE</span>
            </button>
             
            <div v-if="isCompletelyEmpty" class="start-here">
                <span class="subtext">Add people or cargo to get started</span>
            </div>
            <div v-else-if="data.hangarItems.length === 0" class="empty-state">
                No items in hangar. Click + to add.
            </div>
            
            <div v-for="item in data.hangarItems" :key="item.id">
                <LoadItemCard :item="item" inHangar @dragstart="onDragStart($event, item)" @action="removeItem(item.id)" />
            </div>
        </div>

        <div class="hangar-footer-links">
            <Button link class="footer-link-btn" @click="UserUrl.open(UserUrl.fuelWorksheetVideo)" title="Watch Introduction Video">
                <font-awesome-icon :icon="['fab', 'youtube']" />
            </Button>
            <Button link class="footer-link-btn" @click="UserUrl.open(UserUrl.fuelWorksheetGuide)" title="Open Guide">
                <font-awesome-icon :icon="['fas', 'question']" />
            </Button>
        </div>

        <Dialog v-model:visible="showDialog" header="Add to Hangar" modal :style="{ width: '400px' }">
            <div class="p-fluid" style="padding: 0.75rem 0.5rem">
                <div class="flex justify-content-center" style="margin-bottom: 2rem">
                    <EitherOr v-model="newItem.isPerson" either="Passenger" or="Cargo" embedded />
                </div>
                
                <div class="flex mb-2" style="gap: 1rem">
                    <div class="p-field flex-1">
                        <div class="block text-sm font-bold" style="margin-bottom: 0.5rem">Name</div>
                        <InputText id="name" v-model="newItem.name" autofocus @keyup.enter="confirmAdd" class="p-inputtext-sm" />
                    </div>
                    
                    <div class="p-field">
                        <div class="block text-sm font-bold" style="margin-bottom: 0.5rem;">Weight (lbs)</div>
                        <InputNumber id="weight" v-model="newItem.weightLbs" :min="0" :maxFractionDigits="0" @keyup.enter="confirmAdd" class="p-inputtext-sm" />
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-content-end gap-2" style="padding-top: 0.5rem; padding-bottom: 0.25rem">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="showDialog = false" />
                    <Button label="Add to Hangar" icon="pi pi-check" class="p-button-primary" @click="confirmAdd" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { FuelWorksheetData, LoadItem, AssignedLoadItem } from '../../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'
import { UserUrl } from '../../lib/UserUrl'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import EitherOr from '../shared/EitherOr.vue'
import Dialog from 'primevue/dialog'
import LoadItemCard from './LoadItemCard.vue'
import { LocalStoreService } from '../../services/LocalStoreService'

const props = defineProps<{
    data: FuelWorksheetData
    aircraft: Aircraft
}>()

const isCompletelyEmpty = computed(() => props.data.hangarItems.length === 0 && props.data.aircraftItems.length === 0)


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

function openAddDialog() {
    newItem.isPerson = true
    newItem.name = 'Pax'
    newItem.weightLbs = 170
    showDialog.value = true
}

watch(() => newItem.isPerson, (isPerson) => {
    if (isPerson) {
        newItem.name = 'Pax'
        newItem.weightLbs = 170
    } else {
        newItem.name = 'Bag'
        newItem.weightLbs = 50
    }
})

function confirmAdd() {
    const addedItem = {
        id: generateId(),
        name: newItem.name,
        weightLbs: newItem.weightLbs,
        isPerson: newItem.isPerson
    }
    props.data.hangarItems.push(addedItem)
    // Persist the new item to localstore so it's remembered across worksheets
    LocalStoreService.saveHangarItems([...props.data.hangarItems, ...props.data.aircraftItems])
    showDialog.value = false
    emitUpdate()
}

function removeItem(id: string) {
    const index = props.data.hangarItems.findIndex(i => i.id === id)
    if (index !== -1) {
        props.data.hangarItems.splice(index, 1)
        
        // Remove from localstore: item is gone from both hangar and memory
        // Keep aircraftItems in the persisted list so they remain memorized
        LocalStoreService.saveHangarItems([...props.data.hangarItems, ...props.data.aircraftItems])
        
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
    height: 100%;
    overflow: hidden;
    position: relative;
}

.hangar-dropzone {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-content: flex-start;
    justify-content: center;
}

.start-here {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: #64748b;
    text-align: center;
    width: 100%;
    animation: fadeIn 0.5s ease-out;
}

.start-here .subtext {
    font-size: 0.8rem;
    max-width: 180px;
    line-height: 1.4;
    font-style: italic;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
    40% {transform: translateY(-10px);}
    60% {transform: translateY(-5px);}
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.empty-state {
    color: #adb5bd;
    font-style: italic;
    text-align: center;
    width: 100%;
    padding-top: 1rem;
}

.add-button {
    width: 95px;
    height: 50px;
    border: 2px dashed #cbd5e1;
    border-radius: 4px;
    background: transparent;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    order: 999; /* Always show after items */
    gap: 2px;
}

.add-button.bounce-invitation {
    width: 120px;
    height: 60px;
    border-color: #3b82f6;
    color: #3b82f6;
    background-color: #f0f9ff;
    border-style: solid;
    animation: bounce 2s 3;
    order: -1; /* Show first when empty */
}

.add-button .btn-label {
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.05em;
}

.add-button:hover {
    border-color: #0ea5e9;
    color: #0ea5e9;
    background-color: #f0f9ff;
}

/* Dialog Refinements */
:deep(.p-dialog .p-dialog-header) {
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 0 1.5rem 1rem 1.5rem !important;
}

:deep(.p-dialog .p-dialog-footer) {
    padding: 1rem 1.5rem 1.25rem 1.5rem !important;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
}

:deep(.p-field label) {
    color: #475569;
}

.hangar-footer-links {
    position: absolute;
    bottom: 2px;
    left: 2px;
    display: flex;
    flex-direction: row;
    gap: 0;
    z-index: 10;
    pointer-events: auto;
}

.footer-link-btn {
    font-size: 1.1rem;
    padding: 0.3rem 0.4rem;
    height: auto;
    opacity: 0.5;
    transition: opacity 0.2s;
}

.footer-link-btn:hover {
    opacity: 1;
}
</style>
