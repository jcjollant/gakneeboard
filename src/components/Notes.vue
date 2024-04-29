<script setup>
import WidgetTitle from './WidgetTitle.vue';

const emits = defineEmits(['replace'])

function replaceMe() {
    emits('replace')
}


</script>
<template>
    <div class="widget">
        <WidgetTitle :title="'Notes'" @click="replaceMe"/>
        <div class="content"></div>
    </div>
</template>
