<template>
    <div class="checklist-editor">
        <!-- UI Mode -->
        <div v-if="mode === 'ui'" class="editor-ui">
            <div v-if="items.length > 0" class="item-list">
                <div 
                    v-for="(item, index) in items" 
                    :key="index" 
                    class="editor-row"
                    draggable="true"
                    @dragstart="onDragStart($event, index)"
                    @dragover.prevent
                    @drop="onDrop($event, index)"
                >
                    <div class="drag-handle" title="Drag to reorder">
                        <font-awesome-icon icon="fa-solid fa-grip-lines" />
                    </div>
                    
                    <!-- Edit Mode -->
                    <div v-if="editingIndex === index" class="item-edit-form">
                        <!-- Section Edit -->
                        <div v-if="item.section.length > 0 || (item.section === '' && item.challenge === '' && item.response === '' && item.type === ChecklistItemType.undefined)" class="section-edit">
                            <input v-model="item.section" placeholder="Section Name (Required)" class="input-text" @keyup.enter="stopEditing" />
                            <div class="style-group">
                                <button :class="{ active: item.type === ChecklistItemType.undefined }" @click="item.type = ChecklistItemType.undefined" title="Normal"><font-awesome-icon icon="fa-solid fa-font" /></button>
                                <button :class="{ active: item.type === ChecklistItemType.strong }" @click="item.type = ChecklistItemType.strong" title="Strong"><font-awesome-icon icon="fa-solid fa-bold" /></button>
                                <button :class="{ active: item.type === ChecklistItemType.emergent }" @click="item.type = ChecklistItemType.emergent" title="Emergent"><font-awesome-icon icon="fa-solid fa-triangle-exclamation" /></button>
                            </div>
                        </div>

                        <!-- Item Edit -->
                        <div v-else class="item-edit">
                            <input v-model="item.challenge" placeholder="Challenge (Required)" class="input-text" @keyup.enter="stopEditing" />
                            <input v-model="item.response" placeholder="Response (Optional)" class="input-text" @keyup.enter="stopEditing" />
                        </div>
                        
                        <div class="edit-actions">
                            <button class="btn-cancel" @click="cancelEditing" title="Do not apply changes">
                                <font-awesome-icon icon="fa-solid fa-xmark" />
                            </button>
                            <button class="btn-confirm" @click="stopEditing" title="Apply changes">
                                <font-awesome-icon icon="fa-solid fa-check" />
                            </button>
                        </div>
                    </div>

                    <!-- Display Mode -->
                    <div v-else class="item-display" @click="startEditing(index)">
                        <!-- Section Display -->
                        <div v-if="item.section.length > 0" class="section-display" :class="getSectionClass(item)">
                            {{ item.section }}
                        </div>
                        <!-- Item Display -->
                        <div v-else class="item-content" :class="getItemClass(item, index)">
                            <span class="challenge">{{ item.challenge }}</span>
                            <span class="response">{{ item.response }}</span>
                        </div>

                        <!-- Hover Actions -->
                        <div class="item-actions">
                            <button class="btn-insert" @click.stop="insertAbove(index)" title="Insert Before">
                                <font-awesome-icon icon="fa-solid fa-arrows-up-to-line" />
                            </button>
                            <button class="btn-insert" @click.stop="insertBelow(index)" title="Insert After">
                                <font-awesome-icon icon="fa-solid fa-arrows-down-to-line" />
                            </button>
                            <button class="btn-delete" @click.stop="deleteItem(index)" title="Delete">
                                <font-awesome-icon icon="fa-solid fa-trash" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="empty-state">
                No items in checklist.
            </div>

            <div class="add-buttons">
                <button @click="addSection" title="Add Section"><font-awesome-icon icon="fa-solid fa-plus" /> Section</button>
                <button @click="addItem" title="Add Challenge/Response"><font-awesome-icon icon="fa-solid fa-plus" /> Challenge/Response</button>
                <button @click="addSeparator" title="Add Separator"><font-awesome-icon icon="fa-solid fa-plus" /> Separator</button>
            </div>
        </div>

        <!-- Text Mode -->
        <div v-else class="editor-text">
            <textarea v-model="localText" @input="onTextInput" placeholder="Paste checklist text here..."></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Checklist, ChecklistItem, ChecklistItemType } from '../../models/Checklist';
import { ChecklistService } from '../../services/ChecklistService';

const props = defineProps({
    modelValue: { type: Checklist, required: true },
    mode: { type: String, default: 'ui' }
});

const emit = defineEmits(['update:modelValue', 'active']);

// We work on a local copy of items
const items = ref<ChecklistItem[]>([]);
const editingIndex = ref<number>(-1);

// Sync from props
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        // Only update if the reference is different to avoid re-syncing text while typing
        if (newVal.items !== items.value) {
            items.value = newVal.items; // Reference copy
            if (props.mode === 'text') {
                syncTextFromItems();
            }
        }
    }
}, { immediate: true });

// Text mode handling with debounce
const localText = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onTextInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveTextToModel();
    }, 1000);
}

function saveTextToModel() {
    const parsed = ChecklistService.parseEditor(localText.value);
    items.value = parsed.items;
    emitUpdate();
}

function syncTextFromItems() {
    const tempChecklist = new Checklist();
    tempChecklist.items = items.value;
    localText.value = ChecklistService.toEditor(tempChecklist);
}

// Sync when entering text mode, flush when leaving
watch(() => props.mode, (newMode, oldMode) => {
    if (newMode === 'text') {
        syncTextFromItems();
    } else if (oldMode === 'text') {
        // Flush pending save to ensure UI mode gets latest data immediately
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            saveTextToModel();
        } else {
             // Even if no timer, ensure we save? 
             // If timer was null, it means we are up to date OR we haven't typed.
             // But saveTextToModel() is cheap/safe.
        }
    }
});

function emitUpdate() {
    const newChecklist = new Checklist();
    newChecklist.items = items.value;
    emit('update:modelValue', newChecklist);
}

const originalItem = ref<ChecklistItem | null>(null);

function takeSnapshot(index: number) {
    // Deep copy current item state
    const item = items.value[index];
    originalItem.value = new ChecklistItem(item.challenge, item.response, item.section, item.type);
}

function startEditing(index: number) {
    editingIndex.value = index;
    takeSnapshot(index);
    emit('active');
}

function stopEditing() {
    editingIndex.value = -1;
    originalItem.value = null;
    emitUpdate();
}

function cancelEditing() {
    if (editingIndex.value !== -1 && originalItem.value) {
        items.value[editingIndex.value] = originalItem.value;
    }
    stopEditing();
}

defineExpose({ stopEditing });

function addItem() {
    // Adds new item at end
    items.value.push(ChecklistItem.alternate());
    editingIndex.value = items.value.length - 1;
    takeSnapshot(editingIndex.value);
    emit('active');
    emitUpdate();
}

function addSeparator() {
    // Adds new separator at end
    stopEditing();
    items.value.push(ChecklistItem.blank());
    emitUpdate();
}

function addSection() {
    // Adds new section at end
    // Use proper constructor for empty section
    const section = ChecklistItem.section('', ChecklistItemType.undefined); 
    items.value.push(section);
    editingIndex.value = items.value.length - 1;
    takeSnapshot(editingIndex.value);
    emit('active');
    emitUpdate();
}

function deleteItem(index: number) {
    items.value.splice(index, 1);
    emitUpdate();
}

function insertAbove(index: number) {
    const currentItem = items.value[index];
    const newItem = createSameTypeItem(currentItem);
    items.value.splice(index, 0, newItem);
    
    if (newItem.type !== ChecklistItemType.blank) {
        startEditing(index); // Edit the new item (now at index)
        emit('active');
    } else {
        stopEditing();
    }
    emitUpdate();
}

function insertBelow(index: number) {
    const currentItem = items.value[index];
    const newItem = createSameTypeItem(currentItem);
    items.value.splice(index + 1, 0, newItem);
    
    if (newItem.type !== ChecklistItemType.blank) {
        startEditing(index + 1); // Edit the new item
        emit('active');
    } else {
        stopEditing();
    }
    emitUpdate();
}

function createSameTypeItem(item: ChecklistItem): ChecklistItem {
    if (item.section.length > 0) {
        return ChecklistItem.section('');
    } else if (item.type === ChecklistItemType.blank) {
        return ChecklistItem.blank();
    } else {
        return ChecklistItem.alternate();
    }
}

// Drag and Drop
const draggedItemIndex = ref<number | null>(null);

function onDragStart(event: DragEvent, index: number) {
    draggedItemIndex.value = index;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        // Optional: set drag image
    }
}

function onDrop(event: DragEvent, index: number) {
    const fromIndex = draggedItemIndex.value;
    if (fromIndex !== null && fromIndex !== index) {
        const itemToMove = items.value[fromIndex];
        items.value.splice(fromIndex, 1);
        items.value.splice(index, 0, itemToMove);
        emitUpdate();
    }
    draggedItemIndex.value = null;
}

// Helpers for styles
function getSectionClass(item: ChecklistItem) {
    const classes = [];
    if (item.type === ChecklistItemType.strong) classes.push('section-strong');
    else if (item.type === ChecklistItemType.emergent) classes.push('section-emergent');
    else classes.push('section-normal');
    return classes;
}

function getItemClass(item: ChecklistItem, index: number) {
    const classes = [];
    if (item.type === ChecklistItemType.blank) classes.push('item-blank');
    else if (item.type === ChecklistItemType.emergent) classes.push('item-urgent');
    // Alternating background logic can be CSS or class based
    if (index % 2 !== 0 && item.type !== ChecklistItemType.blank) classes.push('item-alt');
    return classes;
}

</script>

<style scoped>
.checklist-editor {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    font-family: inherit;
    height: 100%;
    box-sizing: border-box;
}



.editor-ui {
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 100%;
    overflow: hidden;
}

.item-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    flex-grow: 1;
    min-height: 0;
    padding-right: 5px; /* Space for scrollbar */
}

.editor-row {
    position: relative;
    border: 1px solid transparent; /* For hover effect */
    border-radius: 4px;
    display: flex; /* Flex to include drag handle */
    align-items: stretch;
    gap: 5px;
    flex-shrink: 0; /* Prevent shrinking */
}

.editor-row:hover {
    background-color: #f9f9f9;
}

.drag-handle {
    cursor: grab;
    color: #ccc;
    padding: 0 5px;
    display: flex;
    align-items: center;
}
.drag-handle:hover {
    color: #666;
}

/* Edit Form */
.item-edit-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 5px;
    padding: 5px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1; /* Take remaining space */
}

.item-edit {
    display: grid;
    grid-template-columns: 7fr 3fr;
    gap: 10px;
}

.section-edit {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-grow: 1;
}

.input-text {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
}

.style-group {
    display: flex;
    gap: 2px;
}
.style-group button {
    padding: 4px 8px;
    font-size: 0.8em;
    cursor: pointer;
    border: 1px solid #ccc;
    background: white;
}
.style-group button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}
.style-group button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
.style-group button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.edit-actions {
    display: flex;
    gap: 5px;
}

.btn-cancel {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
}

.btn-confirm {
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
}

/* Display Mode */
.item-display {
    display: grid;
    grid-template-columns: 1fr auto; /* Content | Actions */
    align-items: center;
    padding: 5px;
    cursor: pointer;
    min-height: 30px;
    flex-grow: 1; /* Take remaining space */
    text-wrap: initial;
}
.item-display:hover .item-actions {
    visibility: visible;
}

.item-content {
    display: grid;
    grid-template-columns: 7fr 3fr;
    font-weight: 500;
}
.challenge {
    padding-left: 10px;
    text-align: left;
}
.response {
    border-left: 1px solid #eee;
    padding-left: 5px;
    font-weight: bold;
}

.section-display {
    font-weight: bold;
    text-transform: uppercase;
    padding: 2px 5px;
    text-align: center;
}
.section-strong {
    background: black;
    color: white;
}
.section-emergent {
    background: red;
    color: white;
}
.section-normal {
    background: #ddd;
    color: black;
}

.item-actions {
    visibility: hidden; /* Shown on hover */
    display: flex;
    gap: 3px;
    margin-left: 10px;
}



.btn-insert {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 2px 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
}


.btn-delete {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 2px 5px;
    cursor: pointer;
}

.add-buttons {
    margin-top: auto; /* Push to bottom if space allows, though flex-grow on list handles it */
    padding-top: 5px;
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-shrink: 0;
}
.add-buttons button {
    padding: 8px 12px;
    cursor: pointer;
    background: var(--bg-secondary);
    color: white;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9em;
}
.add-buttons button:hover {
    background: #0056b3;
}

.editor-text {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.editor-text textarea {
    width: 100%;
    flex-grow: 1;
    resize: none;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.item-urgent .challenge, .item-urgent .response {
    color: red;
}
</style>
