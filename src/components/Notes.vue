<script setup>
import WidgetTitle from './WidgetTitle.vue';

const emits = defineEmits(['reset'])

function resetWidget() {
    emits('reset')
}


</script>
<template>
    <div class="widget">
        <WidgetTitle :title="'Notes'" @click="resetWidget"/>
        <div class="content"></div>
    </div>
</template>
