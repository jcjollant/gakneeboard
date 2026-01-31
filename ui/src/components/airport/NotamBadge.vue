<template>
    <div class="notam-badge" :class="{'warning': warning, 'has-notams': !warning && count > 0}" @click="onClick" title="View Notams">
        {{ warning ? '?' : count }}
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    count: { type: Number, required: true },
    warning: { type: Boolean, default: false }
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

.warning {
    background-color: #FBC02D; /* Yellow-ish */
    color: black;
}

.has-notams {
    background-color: #B71C1C; /* Dark Red */
}
</style>
