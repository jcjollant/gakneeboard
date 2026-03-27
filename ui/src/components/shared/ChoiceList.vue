<template>
    <div class="choicelist" :class="{'small': small}">
        <div class="casing embedded" :class="{'small': small}">
            <div class="ball transform transition-transform duration-300" :style="ballStyle"></div>
            <div class="labels-container">
                <span v-for="(choice, index) in choices" :key="index"
                      class="text" 
                      :class="{'selected': isSelected(choice), 'small': small}"
                      @click="selectChoice(choice)">
                    {{ getChoiceLabel(choice) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<any>()
const props = defineProps({
    choices: { type: Array, required: true }, // Array of strings or {label, value}
    small: { type: Boolean, default: true }
})

function getChoiceLabel(choice: any) {
    return typeof choice === 'object' && choice !== null && 'label' in choice ? choice.label : choice
}

function getChoiceValue(choice: any) {
    return typeof choice === 'object' && choice !== null && 'value' in choice ? choice.value : choice
}

function isSelected(choice: any) {
    return model.value === getChoiceValue(choice)
}

function selectChoice(choice: any) {
    model.value = getChoiceValue(choice)
}

const selectedIndex = computed(() => {
    return props.choices.findIndex((c: any) => getChoiceValue(c) === model.value)
})

const ballStyle = computed(() => {
    const total = props.choices.length || 1
    const idx = Math.max(0, selectedIndex.value)
    const padding = 4
    
    return {
        width: `calc((100% - ${padding}px) / ${total})`,
        transform: `translateX(${idx * 100}%)`
    }
})

</script>

<style scoped>
.choicelist {
    display: block;
    width: fit-content;
}

.choicelist.small {
    font-size: 0.8rem;
}

.casing.embedded {
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
}

.casing.embedded.small {
    height: 1.7rem;
    padding: 2px;
}

.ball {
    height: calc(100% - 4px);
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    transition: transform 0.3s ease;
}

.casing.embedded.small .ball {
    height: calc(100% - 4px);
    top: 2px;
    left: 2px;
    border-radius: 4px;
}

.labels-container {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
}

.text {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    min-width: 60px;
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

.casing.embedded.small .text {
    padding: 0 16px;
    min-width: 60px;
}

.text.selected {
    color: #111827;
    font-weight: 600;
}

.selected {
    font-weight: 600;
}

.text.small {
    font-size: 0.8rem;
    line-height: 1.25rem;
}
</style>
