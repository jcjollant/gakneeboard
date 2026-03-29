<template>
    <div class="temperature">
        <div v-if="showTitle" class="tileBoxLabel">T°/DP</div>
        <span class="slash">/</span>
    </div>
</template>

<script setup lang="ts">
defineProps({
    showTitle: { type: Boolean, default: true }
})
</script>

<style scoped>
.temperature {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: x-large;
}

.slash {
    color: #999;
}
</style>
