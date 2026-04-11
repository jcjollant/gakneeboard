<template>
    <div class="separator-choicelist">
        <div class="line left"></div>
        <span class="name">{{ name }}</span>
        <div class="line"></div>
        <ChoiceList 
            v-model="model" 
            :choices="choices" 
            :small="small"
        />
    </div>
</template>

<script setup lang="ts">
import ChoiceList from './ChoiceList.vue';

const model = defineModel<any>();

defineProps<{
    name: string;
    choices: any[];
    small?: boolean;
}>();
</script>

<style scoped>
.separator-choicelist {
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

:deep(.choicelist) {
    width: fit-content;
}
</style>
