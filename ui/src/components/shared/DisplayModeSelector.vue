<template>
    <div class="display-mode-selector">
        <OneChoice :choices="choices" v-model="model" :thinpad="true" :full="true" />
    </div>
</template>

<script setup lang="ts">
import { OneChoiceValue } from '../../models/OneChoiceValue';
import OneChoice from './OneChoice.vue';

defineProps({
    choices: { type: Array<OneChoiceValue>, default: [] }
})

const model = defineModel<OneChoiceValue>()
</script>

<style scoped>
.display-mode-selector {
    display: flex;
    justify-content: center;
    width: 100%;
}
</style>
