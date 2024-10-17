<template>
    <div class="fabutton" :aria-label="label" :class="{'link':link}">
        <font-awesome-icon v-if="icon" :icon="['fas',icon]" />
        <div v-if="label">{{ label }}</div>
    </div>
</template>

<script setup>


const props = defineProps({
    label: { type: String, default: null},
    icon: { type: String, default: null},
    disabled: { type: Boolean, default: true},
    link: {type: Boolean, default: false}
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
    /* font-weight: 100; */
    transition-duration: 0.2s;
    line-height: 2.5rem;
    height: 40px;
    min-width: 38px;
}
.fabutton.link {
    color: var(--bg);
    background-color: unset;
}
.fabutton:hover {
    background: var(--bg-hover);
    color: white;
}
</style>