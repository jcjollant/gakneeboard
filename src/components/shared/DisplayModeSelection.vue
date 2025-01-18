<template>
    <div class="modesList">
        <Button v-for="mode in modes" :label="mode.label" @click="emits('selection', mode.value)"></Button>
    </div>

</template>

<script setup lang="ts">
import { DisplayModeChoice } from '@/model/DisplayModeChoice'
import Button from 'primevue/button'

const emits = defineEmits(['selection'])
const props = defineProps({
    modes: { type: Array<DisplayModeChoice>, default: []},
})

</script>

<style scoped>
.modesList {
    display: grid;
    padding: 10px;
    gap: 10px;
    grid-template-rows: repeat( 4, 3rem);
}
</style>
