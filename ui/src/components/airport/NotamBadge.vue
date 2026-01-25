<template>
    <div class="notam-badge" @click="onClick" title="View Notams">
        {{ count }}
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    count: { type: Number, required: true }
})

const emits = defineEmits(['click'])

function onClick(event: MouseEvent) {
    emits('click', event)
}
</script>

<style scoped>
.notam-badge {
    background-color: #666;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: bold;
    z-index: 10;
    cursor: pointer;
}
</style>
