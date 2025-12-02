<template>
  <td :class="cellClass" @click="startEdit">
    <input 
      v-if="isEditing" 
      v-model="localValue" 
      @blur="finishEdit" 
      @keyup.enter="finishEdit" 
      :data-cell="cellId"
      ref="inputRef"
    />
    <span v-else v-html="displayValue"></span>
  </td>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  cellClass: { type: String, default: '' },
  cellId: { type: String, required: true }
})

const emits = defineEmits(['update:modelValue'])

const isEditing = ref(false)
const localValue = ref(props.modelValue)
const inputRef = ref(null)

const displayValue = computed(() => {
  return props.modelValue || '&nbsp;'
})

function startEdit() {
  isEditing.value = true
  localValue.value = props.modelValue
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.select()
    }
  })
}

function finishEdit() {
  isEditing.value = false
  emits('update:modelValue', localValue.value)
}
</script>

<style scoped>
td {
  cursor: pointer;
}

td:hover {
  background-color: #f9f9f9;
}

input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: Verdana, sans-serif;
  font-size: 12pt;
  text-align: center;
  padding: 2px;
  outline: none;
}

input:focus {
  background-color: #f0f8ff;
  border: 1px solid #4285f4;
}

span {
  display: inline-block;
  width: 100%;
  min-height: 1em;
}
</style>