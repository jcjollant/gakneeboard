<template>
  <div class="demo">
    <h1>Demo Page</h1>
    <p>Demo: {{ demoName }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const demoName = route.params.name
</script>

<style scoped>
.demo {
  padding: 20px;
}
</style>