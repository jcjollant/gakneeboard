<template>
    <div class="stripAction">
        <font-awesome-icon class="button actionUp" :icon="['fas','arrow-up']" @click="emits('action', StripAction.moveUp)" />
        <font-awesome-icon class="button actionDown" :icon="['fas','arrow-down']" @click="emits('action', StripAction.moveDown)" />
        <font-awesome-icon class="button red actionRemove" :icon="['fas','trash']" @click="emits('action', StripAction.remove)" />
    </div>
</template>

<script lang="ts" setup>
import { StripAction } from '@/assets/StripAction';
const emits = defineEmits(['action'])

</script>

<style scoped>
.button {
    cursor: pointer;
    color: white;
    background: var(--bg);
    border-radius: 4px;
    width: 14px;
    height: 14px;
    padding: 6px;
}
.red {
    background: #d00;
}
</style>