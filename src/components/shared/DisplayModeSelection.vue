<template>
    <div class="modesList">
        <Button v-for="mode in modes" :label="mode.label" :severity="mode.value==activeMode ? 'primary' : 'secondary'" class="entry"
            @click="emits('selection', mode.value)"></Button>
    </div>

</template>

<script setup lang="ts">
import { DisplayModeChoice } from '@/model/DisplayModeChoice'
import Button from 'primevue/button'

const emits = defineEmits(['selection'])
const props = defineProps({
    modes: { type: Array<DisplayModeChoice>, default: []},
    activeMode: { type: String, default: ''}
})

</script>

<style scoped>
.modesList {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap: 10px;
}
.entry {
    line-height: 29px;
}
</style>
