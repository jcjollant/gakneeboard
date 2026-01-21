<template>
    <div class="display-mode-selector">
        <OneChoice :choices="choices" v-model="model" :thinpad="true" :full="true">
            <template #default="{ choice }">
                <div v-if="showPreviews" class="choice-image-container">
                    <img :src="choice.image || '/thumbnails/default.png'" alt="" class="choice-image" />
                </div>
                <span>{{ choice.label }}</span>
            </template>
        </OneChoice>
    </div>
</template>

<script setup lang="ts">
import OneChoice from './OneChoice.vue';
import { DisplayModeChoice } from '../../models/DisplayMode';

const props = defineProps({
    choices: { type: Array<DisplayModeChoice>, default: [] },
    showPreviews: { type: Boolean, default: false }
})

const model = defineModel<any>()
</script>

<style scoped>
.display-mode-selector {
    display: flex;
    justify-content: center;
    width: 100%;
}

.choice-image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
}

.choice-image {
    max-width: 100px; /* Adjust as needed */
    max-height: 80px;
    object-fit: contain;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
