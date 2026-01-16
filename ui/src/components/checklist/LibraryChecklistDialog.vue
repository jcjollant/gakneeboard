<template>
    <Dialog v-model:visible="visible" modal :draggable="true" :closable="true" 
        :style="{ width: '50vw', maxWidth: '600px' }" 
        @update:visible="onUpdateVisible"
        class="tile-settings-dialog">
        
        <template #header>
            <div class="header-content">
                <!-- No Reference to tile position (mini-grid) -->
                <div class="settings-title">{{ title }}</div>
            </div>
        </template>

        <div class="settings-body">
            <div class="settings">
                <div class="nameAndCols">
                    <InputGroup>
                        <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                        <InputText v-model="localName" placeholder="New Checklist Name" />
                    </InputGroup>
                    <div class="columnsChoice">
                        <OneChoice v-model="choosenEditorMode" :choices="[choiceEditorModeUi, choiceEditorModeText]"/>
                    </div>
                </div>

                <div class="editors-container cols-1">
                    <div class="editor-wrapper">
                        <ChecklistEditor 
                            v-model="checklistData"
                            :mode="checklistEditorMode"
                            @update:modelValue="onEditorUpdate"
                            :class="['editList', 'editor']" />
                    </div>
                </div>

                <!-- No Theme Selection -->
                
                <div class="footer-settings">
                    <!-- Font Selector (Preserved as not explicitly excluded, but maybe not relevant for library? Keep for now) -->
                     <!-- Actually Font is usually for display on page. Library checklist might not store font? 
                          The model LibraryChecklist(id, fullName, shortName, entries) doesn't have font. 
                          So I will REMOVE Font selector too to be safe/clean. -->
                </div>
            </div>
        </div>

        <template #footer>
            <div class="actionDialog dialog-footer">
                <Button v-if="checklist" label="Delete" severity="danger" icon="pi pi-trash" @click="onDelete" text />
                <div class="spacer"></div>
                <Button label="Cancel" @click="closeDialog" link />
                <Button label="Apply" icon="pi pi-check" @click="onApply" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import { computed, ref, watch } from 'vue';
import { Checklist } from '../../models/Checklist';
import { LibraryChecklist } from '../../models/LibraryChecklist';
import { ChecklistService } from '../../services/ChecklistService';
import OneChoice from '../shared/OneChoice.vue';
import ChecklistEditor from './ChecklistEditor.vue';
import { useConfirm } from "primevue/useconfirm";

// Helper for OneChoice (from ChecklistSettings)
class ChoiceColumnCount {
    label: string
    value: number
    title: string|undefined
    constructor(label: string, value: number, title: string|undefined = undefined) {
        this.label = label
        this.value = value
        this.title = title ?? 'Use ' + value + ' column(s)'
    }
}
const choiceEditorModeUi = new ChoiceColumnCount('fa-solid fa-eye', 0, 'Visual Editor')
const choiceEditorModeText = new ChoiceColumnCount('fa-solid fa-file-code', 1, 'Text Editor')

const props = defineProps({
    checklist: { type: LibraryChecklist, default: null },
    visible: { type: Boolean, default: false }
})

const emits = defineEmits(['close', 'apply', 'update:visible', 'delete'])
const confirm = useConfirm();

const visible = ref(props.visible)
const localName = ref('')
const checklistData = ref<Checklist>(new Checklist())
const choosenEditorMode = ref(choiceEditorModeUi)
const checklistEditorMode = computed(() => ['ui', 'text'][choosenEditorMode.value.value])

const title = computed(() => {
    return localName.value ? `Editing "${localName.value}" Checklist (Library)` : 'New Checklist (Library)'
})

// Sync visible prop
watch(() => props.visible, (val) => {
    visible.value = val
})

// Validation / Sync from prop
watch(() => props.checklist, (newVal) => {
    loadFromData(newVal)
}, { immediate: true })

function loadFromData(checklist: LibraryChecklist | null) {
    if (checklist) {
        localName.value = checklist.fullName
        // items are string[]? No, entries are string[]
        // Parse entries (assuming they are lines of text) to Checklist
        // If entries are lines of formatted text:
        const text = checklist.entries.join('\n')
        checklistData.value = ChecklistService.parseEditor(text)
    } else {
        localName.value = ''
        checklistData.value = new Checklist()
    }
}

function onUpdateVisible(val: boolean) {
    emits('update:visible', val)
    if (!val) {
        emits('close')
    }
}

function closeDialog() {
    visible.value = false
    emits('close')
}

function onEditorUpdate(val: Checklist) {
    checklistData.value = val
}


function onApply() {
    const entries = ChecklistService.toEditor(checklistData.value).split('\n')
    // usage of entries implies we are converting back to the storage format
    const id = props.checklist?.id ?? ''
    const shortName = props.checklist?.shortName ?? localName.value
    const newChecklist = new LibraryChecklist(id, localName.value, shortName, entries)
    emits('apply', newChecklist)
    closeDialog()
}

function onDelete() {
    if(props.checklist) {
        confirm.require({
            message: `Are you sure you want to delete "${props.checklist.fullName}"?`,
            header: 'Delete Checklist',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            accept: () => {
                emits('delete', props.checklist)
                closeDialog()
            }
        });
    }
}
</script>

<style scoped>
/* Scoped styles adapted from TileSettings + ChecklistSettings */
.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.settings-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.settings-body {
    overflow-y: auto;
    background-color: var(--bg-primary); /* Assuming var exists */
    max-height: 70vh; /* Limit height */
}

/* Checklist Settings Styles */
.settings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
}

.nameAndCols {
    display: flex;
    gap: 10px;
    height: 2rem;
    align-items: center;
    justify-content: space-between;
}

.checklistNameAddon {
    width: 4rem;
}

.columnsChoice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.editors-container {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    width: 100%;
    flex: 1; 
    min-height: 400px; /* Taller for dialog */
}

.editor-wrapper {
    flex: 0 0 100%;
    min-width: 100%; 
    display: flex;
    flex-direction: column;
}

.editList {
    width: 100%;
    height: 100%; 
}

/* Default colors if variables not defined */
:root {
    --bg-primary: white;
}

.dialog-footer {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
    padding-top: 1rem;
}

.spacer {
    flex-grow: 1;
}
</style>
