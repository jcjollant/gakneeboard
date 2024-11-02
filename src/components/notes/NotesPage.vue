<template>
    <div class="contentPage notesPage">
        <Header title="Notes" :stealth="true" :page="true"
            @replace="emits('replace')"></Header>
    </div>
</template>
<script setup>
import Header from '../shared/Header.vue';
const emits = defineEmits(['replace'])
</script>
