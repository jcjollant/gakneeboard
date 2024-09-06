<script setup>
import { onMounted, ref, watch } from 'vue'
import { EditorAction } from '../assets/Editor'

import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'


const emits = defineEmits(['action','addSheet','offset'])
const activeOffset = ref(0)
const activeTemplate = ref(null)
const confirm = useConfirm()
const sheets = ref([])

//---------------------
// Props management
const props = defineProps({
  template: { type: Object, default: null},
  offset: {type: Number, default: 0},
})

function loadProps( props) {
  // console.log('Menu loadProps', JSON.stringify(props))
  activeTemplate.value = props.template;
  activeOffset.value = props.offset;
  // list offsets
  sheets.value = props.template.data.filter((d,index)=>index % 2 == 0).map((d,index) => {
    const offset = index * 2
    const output = {name: (offset+1) + ' | ' + (offset+2), offset:index*2}
    return output
  }) 
  // console.log('[Editor.loadProps]', JSON.stringify(sheets.value))
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------

function confirmAndDelete() {
  confirm.require({
      message: 'Are you positive you will not regret deleting pages ' + (activeOffset.value + 1) + ' and ' + (activeOffset.value + 2),
      header: "Delete Pages",
      rejectLabel: 'No',
      acceptLabel: 'Yes, Delete',
      accept: () => {
        onAction(EditorAction.delete2Pages(activeOffset.value))
      }
    })
}

/**
 * Send action to parent (App is processing Editor events)
 * @param {*} actionName 
 */
function onActionName(actionName) {
  onAction(new EditorAction(actionName))
}

function onAction(action) {
  emits('action', action)
}

function onSheetSelection(newOffset) {
  // console.log('[Editor.onSheetSelection]', index)
  activeOffset.value = newOffset
  onAction(EditorAction.changeOffset(newOffset))
}

</script>

<template>
  <div class="editor">
    <div class="editorTop">
      <div class="editorSheets">Pages</div>
      <Button v-for="(s,index) in sheets" 
        @click="onSheetSelection(s.offset)"
        :label="s.name" :class="{'active':s.offset == activeOffset}"></Button>
      <Button icon="pi pi-plus" title="Add 2 Pages"  
        @click="onActionName(EditorAction._add2Pages)"></Button>
      <Button icon="pi pi-trash" title="Delete active sheet"  
        @click="confirmAndDelete"></Button>
    </div>
    <div class="editorMask">
    </div>
    <div class="editorBottom">
      <div class="editorPage">
        <Button icon="pi pi-trash" label="Reset" title="Reset Front Page" 
          @click="onAction(EditorAction.reset(activeOffset))"></Button>
        <Button icon="pi pi-copy" label="Copy" title="Copy Front Page to Clipboard" 
          @click="onAction(EditorAction.copy(activeOffset))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Front Page" 
          @click="onAction(EditorAction.paste(activeOffset))"></Button>
      </div>
      <div class="middle">
          <Button icon="pi pi-arrow-right-arrow-left" title="Swap Front and Back" 
              @click="onActionName(EditorAction._swapPages)" ></Button>
      </div>
      <div class="editorPage">
        <Button icon="pi pi-trash" label="Reset" title="Reset Back Page" 
          @click="onAction(EditorAction.reset(activeOffset+1))"></Button>
        <Button icon="pi pi-copy" label="Copy" title="Copy Back Page to Clipboard" 
          @click="onAction(EditorAction.copy(activeOffset+1))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Back Page" 
          @click="onAction(EditorAction.paste(activeOffset+1))"></Button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.active {
  background-color: white;
  color: black;
}
.editor {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  gap: 1rem;
  background-color: lightgrey;
}
.editorBottom {
  display: flex;
  justify-content: center;
}
.editorMask {
  height: 800px;
  /* border: 2px solid green; */
}
.editorPage {
  display: flex;
  gap:10px;
  width: 485px;
  justify-content: center;
}
.editorSheets {
  font-weight: bolder;
  color: lightgray;
  line-height: 2.5rem;
}
.editorTop {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.middle {
    width: 80px;
}
</style>