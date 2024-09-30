<template>
    <div class="filePick">
        <Button :label="prompt" @click="onClick"></Button>
        <input style="display:none;" ref="fileInput" type="file" 
            @change="handleFileChange" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Button from 'primevue/button'

const emits = defineEmits(['upload'])
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref()
const props = defineProps({prompt: { type: String, default: "File Selection" },})

function handleFileChange() {
    files.value = fileInput.value?.files
    console.log('[FileDrop.handleFileChange]', files.value[0])
    emits('upload', files.value[0])
}

function onClick() {
    if(fileInput.value) {
        fileInput.value.click()
    }
}
</script>

<style scoped>
.filePick {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>