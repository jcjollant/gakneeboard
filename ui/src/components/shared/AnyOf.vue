<template>
    <div class="anyof" :class="{'disabled': disabled}">
        <div v-for="(choice, index) in modelValue" 
             :key="index" 
             class="choice-item" 
             :title="choice.title"
             @click="toggle(choice)">
            <div class="active-bg" :class="{'active': choice.active}"></div>
            <div class="any-of-content" :class="{'selected': choice.active}">
                <div class="check-container">
                    <svg v-show="choice.active" class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </div>
                <span class="text">{{ choice.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { OneChoiceValue } from '../../models/OneChoiceValue';

const props = defineProps({
    modelValue: { type: Array as () => OneChoiceValue[], required: true },
    allowsNoSelection: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
});

const emits = defineEmits(['update:modelValue', 'change'])

function setChoiceActive(choice: OneChoiceValue, active: boolean) {
    if (props.disabled) return
    if (choice.active && !active && !props.allowsNoSelection) {
        const activeCount = props.modelValue.filter(c => c.active).length
        if (activeCount <= 1) return
    }
    choice.active = active
    emits('update:modelValue', [...props.modelValue])
    emits('change')
}

function toggle(choice: OneChoiceValue) {
    setChoiceActive(choice, !choice.active)
}

</script>

<style scoped>
.anyof {
    width: fit-content;
    height: 1.7rem;
    padding: 2px;
    overflow: hidden;
    background-color: #e5e7eb;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    border-radius: 6px;
    position: relative;
    gap: 4px;
}

.anyof.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.anyof.disabled .choice-item {
    cursor: not-allowed;
}

.choice-item {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    z-index: 1;
    height: 100%;
}

.any-of-content {
    display: flex;
    align-items: center;
    padding: 0 12px;
    min-width: 40px;
    gap: 4px;
}

.check-container {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.check-icon {
    width: 14px;
    height: 14px;
    color: #10b981;
}

.active-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    border-radius: 4px;
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
    white-space: nowrap;
    font-weight: 500;
    color: #6b7280;
    font-size: 0.8rem;
    line-height: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    font-family: inherit;
}

.any-of-content.selected .text {
    color: #111827;
    font-weight: 600;
}

</style>
