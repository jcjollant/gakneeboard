<template>
    <div class="modesList">
        <div v-for="(mode,index) in modes" class="choice">
            <Button  :label="mode.label" :severity="mode.value==model ? 'primary' : 'secondary'" class="labelButton"
                @click="emits('selection', mode.value)"></Button>
            <div v-if="expandable && mode.expandable" class="expandable" :class="'expand'+index"  title="Select mode and expand tile"
                @click="emits('expand',mode.value)">
                <font-awesome-icon class="expandableIcon" icon="fa-solid fa-left-right"></font-awesome-icon>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DisplayModeChoice } from '../../model/DisplayMode'
import Button from 'primevue/button'

const emits = defineEmits(['selection','expand'])
const model = defineModel<string>()
const props = defineProps({
    modes: { type: Array<DisplayModeChoice>, default: []},
    expandable: { type: Boolean, default: false}
})

</script>

<style scoped>
.modesList {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap: 10px;
}
.labelButton {
    width:100%;
    line-height: 29px;
}
.choice {
    display: flex;
    gap: 5px;
    align-items: center;
}
.expandable {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-secondary);
    width: 50px;
    font-weight: 100;
    color: white;
    height: 47px;
    border-radius: 4px;
}
.expandable:hover {
    background-color: var(--bg-secondary-hover);
}
</style>
