<script setup>
import { EditorAction } from '../assets/Editor'

import Button from 'primevue/button'

const emits = defineEmits(['action'])

function onAction(action) {
    emits('action', action)
}

</script>

<template>
  <div class="editor">
    <div class="editorPage">
      <Button icon="pi pi-trash" label="Reset" title="Reset Front Page"
        @click="onAction(EditorAction.resetFront)"></Button>
      <Button icon="pi pi-copy" label="Copy" title="Copy Front Page to Clipboard"
        @click="onAction(EditorAction.copyFront)"></Button>
      <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Front Page"
        @click="onAction(EditorAction.pasteFront)"></Button>
    </div>
    <div class="middle">
        <Button icon="pi pi-arrow-right-arrow-left" title="Swap Front and Back"
            @click="onAction(EditorAction.swapPages)" ></Button>
    </div>
    <div class="editorPage">
      <Button icon="pi pi-trash" label="Reset" title="Reset Back Page"
        @click="onAction(EditorAction.resetBack)"></Button>
      <Button icon="pi pi-copy" label="Copy" title="Copy Back Page to Clipboard"
        @click="onAction(EditorAction.copyBack)"></Button>
      <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Back Page"
        @click="onAction(EditorAction.pasteBack)"></Button>
    </div>
  </div>

</template>

<style scoped>
.editor {
  display: flex;
  justify-content: center;
  padding-top:20px;
  /* gap:100px; */
}
.editorPage {
  display: flex;
  gap:10px;
  width: 485px;
  justify-content: center;
}
.middle {
    width: 80px;
}
</style>