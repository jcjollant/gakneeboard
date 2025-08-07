<template>
    <div class="container">
        <Runway v-for="index in [0,1,2,4]" :settings="rwySettings[index]" :small="true"
            class="clickable" @click="emits('rwyclick',index)"/>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { RunwaySettings } from './RunwaySettings';

const emits = defineEmits(['rwyclick'])
const noRunways = new Array<RunwaySettings>(4).fill(new RunwaySettings())
const rwySettings = ref<RunwaySettings[]>(noRunways)

</script>
<style scoped>
.container {
    display: grid;
    grid-template-columns: 120px 120px;
    grid-template-rows: 120px 120px;
}
</style>