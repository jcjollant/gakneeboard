<template>
    <div class="sky">
        <div v-if="showTitle" class="tileBoxLabel">Sky</div>
        <div class="wtrmrk">
            <div>Fw</div>
            <div>Sc</div>
            <div>Bk</div>
            <div>Ov</div>
        </div>
        <div class="wtrmrk clear">CLR</div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    showTitle: { type: Boolean, default: true }
})
</script>

<style scoped>
.sky {
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
