<template>
    <div class="checklist-selector" @click="onClick">
        <div class="box" :class="{new: isNew}">
            <template v-if="isNew">
                <font-awesome-icon :icon="['fas', 'list-check']" class="icon" />
            </template>
            <template v-else>
                <div class="count">{{ itemCount }}</div>
                <div class="label">Items</div>
            </template>
        </div>
        <div class="name">{{ name }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { LibraryChecklist } from '../../models/LibraryChecklist';
import { Checklist } from '../../models/Checklist';
import { ChecklistService } from '../../services/ChecklistService';

const props = defineProps({
    checklist: { type: LibraryChecklist, default: null },
    isNew: { type: Boolean, default: false }
})

const emits = defineEmits(['click'])

const itemCount = computed(() => {
    if (props.isNew || !props.checklist) return 0
    // Parse entries to items to count them?
    // checklist.entries is string array (lines of text file).
    // Parsing might be heavy if list is long?
    // But we need item count.
    // Let's assume entries roughly corresponds to items/sections if not blank?
    // Or just parse strictly.
    const text = props.checklist.entries.join('\n')
    const parsed = ChecklistService.parseEditor(text)
    // We want items count? Or just checklist items (not sections)?
    // Previous logic: count += page.data.items.length (which included sections/alternates etc?)
    // ChecklistItem has type.
    // Let's rely on parsed.items.length for now.
    return parsed.items.length
})

const name = computed(() => {
    if (props.isNew) return 'New'
    return props.checklist ? props.checklist.fullName : ''
})

onMounted(() => {
    // Logic moved to computed properties
})

function onClick() {
    emits('click')
}
</script>

<style scoped>
.checklist-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: 100px; /* Adjust as needed */
}

.box {
    width: 100%;
    aspect-ratio: 1/1;
    background-color: #f0f0f0; /* Light grey placeholder */
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    border: 3px solid transparent;
    transition: border-color 0.2s;
}

.box.new {
    border: 3px dashed lightgrey;
    background-color: transparent;
}

.checklist-selector:hover .box {
    border-color: var(--primary-color, #3B82F6);
}

.icon {
    font-size: 2rem;
    color: #666;
}

.count {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    line-height: 1;
}

.label {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
}

.name {
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
