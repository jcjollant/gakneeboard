<template>
    <div class="wind">
        <div v-if="showTitle" class="tileBoxLabel">Wind</div>
        <div class="wtrmrk speed">
            <div class="at">@</div>
            <div class="gust">G</div>
        </div>
        <div class="wtrmrk variable">Vrb</div>
        <div class="wtrmrk calm">Calm</div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    showTitle: { type: Boolean, default: true }
})
</script>

<style scoped>
.wind {
    position: relative;
}

.speed {
    position: absolute;
    display: flex;  
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    right: 0;
    bottom: 2px;
    width: 50px;
}

.at {
    color: #222;
    font-size: 0.8rem;
}

.variable {
    position: absolute;
    bottom: 2px;
    left: 4px;
}

.calm {
    position: absolute;
    top: 2px;
    right: 4px;
}
</style>
