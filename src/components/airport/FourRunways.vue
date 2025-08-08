<template>
    <div class="container">
        <Runway v-for="index in [0,1,2,4]" :settings="rwySettings[index]" :small="true"
            class="clickable" @click="emits('rwyclick',index)"/>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { RunwayViewSettings } from './RunwayViewSettings';

const emits = defineEmits(['rwyclick'])
const noRunways = new Array<RunwayViewSettings>(4).fill(new RunwayViewSettings())
const rwySettings = ref<RunwayViewSettings[]>(noRunways)

</script>
<style scoped>
.container {
    display: grid;
    grid-template-columns: 120px 120px;
    grid-template-rows: 120px 120px;
}
</style>