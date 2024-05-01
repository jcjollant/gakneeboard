<script setup>
import Header from './Header.vue';

const emits = defineEmits(['replace'])

</script>
<template>
    <div class="widget">
        <Header :title="'Notes'" @click="emits('replace')"/>
        <div class="content"></div>
    </div>
</template>
