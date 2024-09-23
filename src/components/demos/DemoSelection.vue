<script setup>
import { getTemplateDemo, getTemplateDemoChecklist, getTemplateDemoNavlog, getTemplateDemoTiles } from '../../assets/sheetData';

import Dialog from 'primevue/dialog'

import DemoButton from './DemoButton.vue';

const emits = defineEmits(['load'])

</script>
<template>
  <Dialog modal header="GA Kneeboard Demos">
    <div class="demoGrid">
        <DemoButton :template="getTemplateDemo()" icon="pen-to-square" class="defaultDemo"
          @click="emits('load', getTemplateDemo())"></DemoButton>
        <DemoButton :template="getTemplateDemoChecklist()" icon="list-check" class="checklistDemo"
          @click="emits('load', getTemplateDemoChecklist())"></DemoButton>
        <DemoButton :template="getTemplateDemoTiles()" icon="border-all" class="tilesDemo"
          @click="emits('load', getTemplateDemoTiles())"></DemoButton>
        <DemoButton :template="getTemplateDemoNavlog()" icon="route" class="navlogDemo"
          @click="emits('load', getTemplateDemoNavlog())"></DemoButton>
    </div>
  </Dialog>
</template>
<style scoped>
.demoGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
</style>