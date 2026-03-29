<template>
    <div class="visibility">
        <div v-if="showTitle" class="tileBoxLabel">Vis</div>
        <div class="wtrmrk">
            <div>Ra</div>
            <div>Fg</div>
            <div>Br</div>
        </div>
        <div class="wtrmrk clear">10+</div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    showTitle: { type: Boolean, default: true }
})
</script>

<style scoped>
.visibility {
    position: relative;
}

.wtrmrk {
    position: absolute;
    display: flex;
    bottom: 0;
    justify-content: space-between;
    width: 100%;
    padding: 2px 4px;
}

.clear {
    position: absolute;
    display: flex;
    top: 0;
    flex-flow: row-reverse;
    width: 100%;
    padding: 2px 4px;
}
</style>
