<template>
    <div class="weight-summary-box">
        <div class="weight-value">{{ weight.toFixed(0) }} <span class="unit">lbs</span></div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    weight: number
}>()
</script>

<style scoped>
.weight-summary-box {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.weight-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #495057;
}

.weight-value .unit {
    font-size: 0.9rem;
    color: #adb5bd;
    font-weight: normal;
}
</style>
