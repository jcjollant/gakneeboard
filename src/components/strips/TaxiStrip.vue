<template>
    <div class="stripContent taxi">
        <div class="label">TAXI to</div>
        <div class="stripBox">&nbsp;</div>
        <div class="label">via</div>
        <div class="stripBox">&nbsp;</div>
        <div class="label">X / HS</div>
        <div class="stripBox">&nbsp;</div>
        <StripActions @action="emits('action', $event)" />
    </div>
</template>

<script setup lang="ts">
import StripActions from './StripActions.vue'

const emits = defineEmits(['action'])

</script>

<style scoped>
.label {
    text-align: right;
    padding-right: 5px;
}
.taxi {
    position: relative;
    display: grid;
    grid-template-columns: 1.1fr 1fr 0.8fr 5fr 1fr 1fr;
    align-items: center;
    line-height: 1.5rem;
}
</style>