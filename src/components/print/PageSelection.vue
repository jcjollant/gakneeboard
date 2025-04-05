<template>
  <div v-if="model" class="allPages">
    <div v-for="(page,index) in model" class="onePage" :class="['page'+index,{selected:page}]" @click="flip(index)">{{ index + 1 }}</div>
  </div>
  <div v-else>
    <slot>No Model</slot>
  </div>
</template>

<script setup lang="ts">

const emits = defineEmits(['change'])
const model = defineModel<boolean[]>()

function flip(index: number) {
    if(!model.value) return
    model.value[index] = !model.value[index]
    emits('change')
}

</script>

<style scoped>
.allPages {
  display: flex;
  justify-content: left;
  align-items: center;
  gap: 10px;
}

.onePage {
  background-color: #ffffff;
  border-radius: 3px;
  border: 1px solid lightgrey;
  padding: 8px;
  cursor: pointer;

}

.selected {
  background-color: var(--bg-choice-active);
}
</style>