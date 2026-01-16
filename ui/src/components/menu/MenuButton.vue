<template>
    <div class="menuButton" :class="{'passive':!(active||disabled),'active':active,'danger':danger,'disabled':disabled}">
        <font-awesome-icon :icon="['fas', icon]"></font-awesome-icon>
        <div v-if="label" class="label">{{ label }}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    active: { type: Boolean, default: false},
    danger: { type: Boolean, default: false},
    icon: { type: String, default: 'question' },
    label: { type: String, default: null},
    disabled: { type: Boolean, default: false},
})
</script>

<style scoped>
.menuButton {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 11px;
    gap: 10px;
    font-size: 18px;
    height: 40px;
    width: 40px;
    border-radius: 20px;
    cursor: pointer;
    overflow: hidden;
}

.active {
    color: var(--bg);
    background-color: white;
}

.passive, .active:hover {
    color: white;
    background-color: var(--bg-hover);
}

.passive.danger {
    background-color: #F33;
}

.menuButton:hover {
    box-shadow: rgba(0, 0, 0, 0.8) 0px 3px 8px;
    width: fit-content;
}

.label {
    display: none;
    font-size: 15px;
}

.menuButton:hover .label {
    display: inline;
}

.disabled {
    color: white;
    background-color: #888;
    cursor: default;
}
</style>