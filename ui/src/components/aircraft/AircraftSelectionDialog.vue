<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="header" :style="{ width: '80vw', maxWidth: '800px' }">
        <div class="templateList selectionList">
            <div v-for="a in aircrafts" :key="a.id" class="selection-item" @click="$emit('selected', a)">
                <AircraftCard :aircraft="a" :templateMode="templateMode" />
            </div>
        </div>
        <div v-if="templateMode" class="feedback-invite">
            Don't see your aircraft? Send us feedback at <a href="mailto:support@kneeboard.ga">support@kneeboard.ga</a> with templates you'd like to see!
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import AircraftCard from './AircraftCard.vue'
import { Aircraft } from '@gak/shared'

defineProps<{
    visible: boolean
    aircrafts: Aircraft[]
    header: string
    templateMode?: boolean
}>()

defineEmits(['update:visible', 'selected'])
</script>

<style scoped>
.templateList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
}

.selectionList {
    max-height: 60vh;
    overflow-y: auto;
}

.selection-item {
    cursor: pointer;
}

.feedback-invite {
    text-align: center;
    margin-top: 1rem;
    color: #6c757d;
    font-size: 0.9rem;
    padding-bottom: 0.5rem;
}

.feedback-invite a {
    color: var(--bg, #0369a1);
    text-decoration: none;
    font-weight: bold;
}

.feedback-invite a:hover {
    text-decoration: underline;
}
</style>
