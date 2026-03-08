<template>
    <div class="dialog-actions">
        <div class="left-actions">
            <font-awesome-icon v-if="helpLink" :icon="['fas', 'question']" class="action-icon help-icon"
                @click="openUrl(helpLink)" title="Get help on this feature" />
            <font-awesome-icon v-if="videoLink" :icon="['fas', 'video']" class="action-icon video-icon"
                @click="openUrl(videoLink)" title="Watch a video on this feature" />
        </div>
        <div class="right-actions">
            <Button label="Cancel" @click="$emit('cancel')" link />
            <Button :label="applyLabel" @click="$emit('apply')" :disabled="!canApply" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
    helpLink: { type: String, default: undefined },
    videoLink: { type: String, default: undefined },
    applyLabel: { type: String, default: 'Apply' },
    canApply: { type: Boolean, default: true }
})

defineEmits(['cancel', 'apply'])

function openUrl(url: string) {
    if (url) {
        window.open(url, '_blank')
    }
}
</script>

<style scoped>
.dialog-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 0.5rem;
}

.left-actions {
    display: flex;
    gap: 15px;
    align-items: center;
}

.right-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto;
}

.action-icon {
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
    color: var(--bg);
    transition: color 0.2s;
}

.action-icon:hover {
    color: var(--bg-hover);
}
</style>
