<template>
    <div class="fabutton" :aria-label="label" :class="{'link':link,menu:menu}">
        <font-awesome-icon v-if="icon" :icon="['fas',icon]" />
        <div v-if="label" class="label">{{ label }}</div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    label: { type: String, default: null},
    icon: { type: String, default: null},
    disabled: { type: Boolean, default: true},
    link: {type: Boolean, default: false},
    menu: {type: Boolean, default: false},
})
</script>

<style scoped>
.fabutton {
    display: flex;
    cursor: pointer;
    color: white;
    background-color: var(--bg);
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-family: var(--font-family);
    transition-duration: 0.2s;
    line-height: 2.5rem;
    height: 40px;
    min-width: 38px;
    padding: 0 10px;
}
.fabutton.link {
    color: var(--bg);
    background-color: unset;
    min-width: none;
}
.fabutton.menu {
    height: 26px;
    color: var(--bg);
    background-color: lightgray;
    min-width: fit-content;
}
.fabutton.menu:hover {
    background-color: var(--bg);
}
.fabutton:hover {
    background: var(--bg-hover);
    color: white;
}
</style>