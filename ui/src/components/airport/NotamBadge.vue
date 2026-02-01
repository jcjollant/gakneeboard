<template>
    <div class="badge notam-badge" :class="{'warning': warning, 'has-notams': !warning && count > 0}" @click="onClick" title="View Notams">
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
    font-size: 12px;
    font-weight: bold;
}

.warning {
    background-color: #FBC02D; /* Yellow-ish */
    color: black;
}

.has-notams {
    background-color: #B71C1C; /* Dark Red */
}

.print .notam-badge {
    display: none;
}
</style>
