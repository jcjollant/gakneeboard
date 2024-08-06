<script setup>

import { ref } from 'vue'

const props = defineProps({
    items: { type: Object, default: [] },
})

</script>

<template>
    <div v-for="(item, index) in props.items" class="checklist"
        :class="(index % 2) ? theme : ''">
        <div v-if="'s' in item" class="separator">{{ item.s }}</div>
        <div v-else class="challenge">{{ item.c }}</div>
        <div class="response">{{ item.r }}</div>
    </div>
</template>

<style scoped>
</style>