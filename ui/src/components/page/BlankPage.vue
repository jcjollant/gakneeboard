<template>
    <div class="contentPage blankPage">
        <Header title="" :stealth="true" :page="true" :displayMode="false" leftButton=""
            @replace="emits('replace')"></Header>
    </div>

</template>

<script setup lang="ts">
import Header from '../shared/Header.vue';
const emits = defineEmits(['replace'])
</script>

