<template>
    <div class="temperature">
        <div v-if="showTitle" class="tileBoxLabel">T°/DP</div>
        <svg class="slash wtrmrk" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="100" y2="0" stroke="#ccc" stroke-width="2" vector-effect="non-scaling-stroke" />
        </svg>
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
    position: absolute;
    top: 10%;
    left: 40%;
    width: 20%;
    height: 80%;
    pointer-events: none;
}
</style>
