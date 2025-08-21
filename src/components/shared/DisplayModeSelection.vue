<template>
    <div class="modesList">
        <div v-for="(mode,index) in modes" class="choice">
            <Button  :label="mode.label" :severity="mode.value==model ? 'primary' : 'secondary'" class="labelButton" :title="mode.description"
            @click="onChoose(mode.value)"></Button>
        </div>
        <EitherOr v-if="expandable" either="Normal" or="Wide" v-model="notExpanded" class="eitherOr" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeChoice } from '../../model/DisplayMode'
import Button from 'primevue/button'
import EitherOr from './EitherOr.vue'

const emits = defineEmits(['expand', 'keep'])
const notExpanded = ref(true)
const model = defineModel<string>()
const props = defineProps({
    modes: { type: Array<DisplayModeChoice>, default: []},
    expandable: { type: Boolean, default: false},
    expanded: { type: Boolean, default: false}
})

onMounted(() => {
    notExpanded.value = !props.expanded
})

watch(notExpanded, (newVal) => {
    // console.debug('[DisplayModeSelection.watch] expanded', !newVal)
    emits('expand', !newVal)
})

function onChoose(mode:string) {
    if(model.value == mode) {
        emits('keep')
    } else {
        model.value = mode
    }
}

</script>

<style scoped>
.modesList {
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 10px;
    gap: 10px;
}
.labelButton {
    width:100%;
    line-height: 22px;
}
.choice {
    display: flex;
    gap: 5px;
    align-items: center;
    width: 100%;
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
.eitherOr {
    width: 150px;
}
</style>
