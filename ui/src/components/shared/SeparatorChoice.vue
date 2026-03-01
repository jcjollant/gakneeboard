<template>
    <div class="separator-choice">
        <div class="line left"></div>
        <span class="name">{{ name }}</span>
        <div class="line"></div>
        <EitherOr 
            v-model="model" 
            :either="choiceA" 
            :or="choiceB" 
            :small="true"
            :embedded="true"
        />
    </div>
</template>

<script setup lang="ts">
import EitherOr from './EitherOr.vue';

const model = defineModel<boolean>();

defineProps<{
    name: string;
    choiceA: string;
    choiceB: string;
}>();
</script>

<style scoped>
.separator-choice {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin: 6px 0 2px 0;
}

.name {
    color: var(--bg-secondary);
    font-weight: bold;
    white-space: nowrap;
}

.line {
    flex: 1;
    height: 1px;
    background: var(--bg-secondary);
}

.line.left {
    flex: none;
    width: 10px;
}

:deep(.eitheror) {
    grid-template-columns: auto auto auto;
}
</style>
