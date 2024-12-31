<template>
    <div class="labelInput">
        <div class="input">&nbsp;</div>
        <div class="label">{{ label }}</div>
    </div>
</template>

<script setup>
defineProps({
    label: String
})
</script>

<style scoped>
.input {
    border-bottom: 1px solid black;
    width: 100%;
    margin-bottom: 1px;
}
.label {
    position: absolute;
    left: 0;
    background-color: white;
    padding-right: 5px;
}
.labelInput {
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>