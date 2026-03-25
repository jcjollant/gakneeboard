<template>
    <div class="anyof">
        <div v-for="(choice, index) in choices" 
             :key="index" 
             class="choice-item" 
             @click="toggle(choice)">
            <div class="active-bg" :class="{'active': choice.active}"></div>
            <span class="text" :class="{'selected': choice.active}">{{ choice.label }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">

export interface AnyOfChoice {
    label: string;
    active: boolean;
}

const choices = defineModel<AnyOfChoice[]>({ required: true })

function setChoiceActive(choice: AnyOfChoice, active: boolean) {
    if (choice.active && !active) {
        const activeCount = choices.value.filter(c => c.active).length
        if (activeCount <= 1) return
    }
    choice.active = active
    choices.value = [...choices.value]
}

function toggle(choice: AnyOfChoice) {
    setChoiceActive(choice, !choice.active)
}

</script>

<style scoped>
.anyof {
    width: fit-content;
    height: 1.3rem;
    padding: 1px;
    overflow: hidden;
    background-color: #e5e7eb;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    border-radius: 6px;
    position: relative;
    gap: 4px;
}

.choice-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    z-index: 1;
    height: 100%;
}

.active-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    z-index: -1;
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s ease;
}

.active-bg.active {
    opacity: 1;
    transform: scale(1);
}

.text {
    padding: 0 10px;
    min-width: 40px;
    white-space: nowrap;
    font-weight: 500;
    color: #6b7280;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.text.selected {
    color: #111827;
    font-weight: 600;
}

</style>
