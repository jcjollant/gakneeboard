<template>
    <div class="tile">
        <Header title="Hold @" :left="true" :showReplace="true" :showDisplayMode="false"
            @replace="emits('replace')"></Header>
        <HoldingContent />
    </div>

</template>

<script setup lang="ts">
import Header from '../shared/Header.vue';
import HoldingContent from './HoldingContent.vue';

const emits = defineEmits(['replace'])

</script>
