<template>
    <div class="notam-list">
        <div class="header-controls">
            <span class="title">NOTAMs</span>
            <div class="toggle-container">
                <label for="raw-toggle">Show Raw Text</label>
                <input type="checkbox" id="raw-toggle" v-model="showRaw" />
            </div>
        </div>
        <div v-if="notams.length === 0">No NOTAMs found.</div>
        <div v-for="(notam, index) in notams" :key="index" class="notam-item">
            <div class="notam-text">{{ getNotamText(notam) }}</div>
        </div>
        <div class="footer">
            <a href="https://notams.aim.faa.gov/notamSearch/nsapp.html#/" target="_blank" class="faa-link">Official FAA Notam Search</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notam } from '../../models/Notam';

defineProps({
    notams: { type: Array as () => Notam[], default: () => [] },
});

const showRaw = ref(false);

function getNotamText(notam: Notam): string {
    if (showRaw.value) {
        return notam.text;
    }
    return notam.plainText || notam.text;
}
</script>

<style scoped>
.notam-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    overflow-y: auto;
    padding: 5px;
}

.header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

.title {
    font-weight: bold;
    font-size: 1.1em;
}

.toggle-container {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9em;
}

.notam-item {
    padding: 10px;
    border-bottom: 1px solid #ccc;
    font-size: 12px;
    text-align: left;
}

.notam-item:last-child {
    border-bottom: none;
}

.notam-text {
    white-space: pre-wrap;
    word-break: break-word;
}

.footer {
    margin-top: auto;
    padding-top: 10px;
    text-align: center;
}

.faa-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9em;
}

.faa-link:hover {
    text-decoration: underline;
}
</style>
