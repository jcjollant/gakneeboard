<template>
    <div class="stripContent flight">
        <div class="top" title="Date">DATE</div>
        <div class="top" title="Aircraft Tail Number">TAIL#</div>
        <div class="top" title="Departure">FROM</div>
        <div class="top" title="Destination">TO</div>
        <div class="top" title="Takeoff Time">T/O</div>
        <div class="top" title="Landing Time">LAND</div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script setup lang="ts">
import StripActions from './StripActions.vue';

const emits = defineEmits(['action'])
const props = defineProps({
    edit: { type: Boolean, required: false, default: false }
})
</script>

<style scoped>
.flight {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1rem 40px;
    width: 100%;
    font-size: 11px;
    gap: 2px;
} 
</style>
