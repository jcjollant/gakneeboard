<template>
    <div class="checklist-selector" @click="onClick">
        <div class="box" :class="{new: isNew}">
            <template v-if="isNew">
                <font-awesome-icon :icon="['fas', 'list-check']" class="icon" />
            </template>
            <template v-else>
                <div class="preview-list">
                    <div v-for="(item, index) in previewItems" :key="index" class="preview-item">
                        {{ item }}
                    </div>
                    <div v-if="hasMore" class="preview-more">...</div>
                </div>
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

const previewItems = computed(() => {
    if (props.isNew || !props.checklist) return []
    // Get text
    const text = props.checklist.entries.join('\n')
    // Parse
    const checklist = ChecklistService.parseEditor(text)
    // Extract first 5 items (challenges)
    const items = []
    let count = 0
    for (const item of checklist.items) {
        if (item.challenge) {
            items.push(item.challenge)
            count++
        } else if (item.section) {
           // Optionally show sections? Maybe differently.
           // For now, let's just show challenges as they are the main content.
           // If we want sections, we can add them.
           // Let's skip sections for "preview" or maybe show them in bold?
           // The prompt said "first few items".
           // Let's include sections but maybe style differently if we could, 
           // but here we just return strings.
           items.push(item.section.toUpperCase())
           count ++
        }
        if (count >= 5) break
    }
    return items
})

const hasMore = computed(() => {
     if (props.isNew || !props.checklist) return false
     // This is a rough estimation. 
     // We could precise it by checking total items vs shown.
     // Let's just say if entries.length > 5 * 2 (approx lines per item)
     return props.checklist.entries.length > 10
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

.preview-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}

.preview-item {
    font-size: 0.6rem;
    color: #555;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    line-height: 1.2;
}

.preview-more {
    font-size: 0.8rem;
    color: #999;
    line-height: 0.8;
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
