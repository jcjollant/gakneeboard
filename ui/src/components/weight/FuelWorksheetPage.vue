<template>
    <div class="contentPage fuelPage">
        <Header title="Fuel Worksheet" :page="true" :displayMode="false" leftButton=""
            @replace="emits('replace')"></Header>
    </div>
</template>

<script setup lang="ts">
import Header from '../shared/Header.vue';
const emits = defineEmits(['replace'])
</script>
