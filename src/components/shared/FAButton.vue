<script setup>


const props = defineProps({
    label: { type: String, default: '?'},
    icon: { type: String, default: null},
    disabled: { type: Boolean, default: true},
})

</script>

<template>
    <div class="fabutton" :aria-label="label">
        <font-awesome-icon v-if="icon" :icon="['fas',icon]" />
        <div>{{ label }}</div>
    </div>
</template>

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
    /* font-weight: 100; */
    transition-duration: 0.2s;
    line-height: 2.5rem;
}
.fabutton:hover {
    background: var(--bg-hover);
}
</style>