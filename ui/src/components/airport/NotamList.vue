<template>
    <div class="notam-group">
        <div class="group-header" @click="toggleCollapse">
            <span class="expand-icon">{{ collapsed ? '▶' : '▼' }}</span>
            <span class="group-title">{{ title }} ({{ notams.length }})</span>
        </div>
        
        <div v-if="!collapsed" class="notam-list">
            <div v-for="(notam, index) in notams" :key="index" class="notam-item">
                <div class="notam-text">{{ getNotamText(notam) }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notam } from '../../models/Notam';

const props = defineProps({
    notams: { type: Array as () => Notam[], default: () => [] },
    title: { type: String, default: 'Notams' },
    showRaw: { type: Boolean, default: false }
});

const collapsed = ref(false);

function toggleCollapse() {
    collapsed.value = !collapsed.value;
}

function getNotamText(notam: Notam): string {
    if (props.showRaw) {
        return notam.text;
    }
    return notam.plainText || notam.text;
}
</script>

<style scoped>
.notam-group {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
}

.group-header {
    background-color: #f0f0f0;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    user-select: none;
}

.group-header:hover {
    background-color: #e0e0e0;
}

.expand-icon {
    font-size: 0.8em;
    width: 12px;
}

.notam-list {
    display: flex;
    flex-direction: column;
    background-color: white;
}

.notam-item {
    padding: 10px;
    border-top: 1px solid #eee;
    font-size: 12px;
    text-align: left;
}

.notam-item:first-child {
    border-top: none;
}

.notam-text {
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
