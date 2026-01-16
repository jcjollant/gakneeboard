<template>
    <div class="editorBottom">
        <Button icon="pi pi-copy" label="Copy" title="Copy Page to Clipboard" 
        @click="onAction(EditorAction.copyPageToClipboard(index))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Page from Clipboard" 
        @click="onAction(EditorAction.pastePage(index))"></Button>
        <Button icon="pi pi-eject" label="Replace" title="Replace Page" 
        @click="onAction(EditorAction.reset(index))"></Button>
        <Button icon="pi pi-trash" label="Delete" title="Delete Page" severity="warning" class="btnDelete"
        :disabled="blockDelete"
        @click="onAction(EditorAction.deletePage(index))"></Button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditorAction } from '../../assets/EditorAction';

import Button from 'primevue/button'


const blockDelete = ref(false)
const emits = defineEmits(['action'])
const index = ref(0)
const props = defineProps({
    blockDelete: {type:Boolean, required: true},
    index: {type:Number, required: true}
})

onMounted( () => {
    loadProps(props)
})

watch( props, () => {
    loadProps(props)
})

function loadProps(props) {
    // console.log('[HorizontalActionBar.loadProps] props', props)
    index.value = props.index
    blockDelete.value = props.blockDelete
}

function onAction(action) {
    // console.log('[HorizontalActionBar.onAction] action', action)
    emits('action', action)
}

</script>

<style scoped>
.editorBottom {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 5px;
  height: var(--editor-bottom-height);
  width: 100%;
}
</style>