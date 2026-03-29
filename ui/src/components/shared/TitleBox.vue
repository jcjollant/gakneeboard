<template>
    <div class="title-box">
        <div class="tileBoxLabel">{{ title }}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: { type: String, required: true }
})
</script>

<style scoped>
.title-box {
    position: relative;
}
</style>