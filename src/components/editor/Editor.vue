<template>
  <div class="editor">
    <ConfirmDialog></ConfirmDialog>
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
      <TileOverlay :show="activeTemplate?.data[activeOffset].type==PageType.tiles"
        class="leftTileOverlay"
        @swap="swapTilesLeft" />
      <div class="middle">
          <Button id="editorCopyToRight" icon="pi pi-arrow-right" title="Copy Left to Right" 
              @click="onAction(EditorAction.copyToPage(activeOffset, activeOffset+1))" ></Button>
          <Button id="editorSwap" icon="pi pi-arrow-right-arrow-left" title="Swap Left and Right" 
              @click="onActionName(EditorAction._swapPages)" ></Button>
          <Button id="editorCopyToLeft" icon="pi pi-arrow-left" title="Copy Right to Left" 
              @click="onAction(EditorAction.copyToPage(activeOffset+1, activeOffset))" ></Button>
      </div>
      <TileOverlay :show="activeTemplate?.data[activeOffset+1].type==PageType.tiles"
        class="rightTileOverlay"
        @swap="swapTilesRight" />
    </div>
    <div class="editorBottom">
      <div class="editorPage">
        <Button icon="pi pi-eject" label="Replace" title="Replace Left Page" 
          @click="onAction(EditorAction.reset(activeOffset))"></Button>
        <Button icon="pi pi-copy" label="Copy" title="Copy Left Page to Clipboard" 
          @click="onAction(EditorAction.copyToClipboard(activeOffset))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Left Page" 
          @click="onAction(EditorAction.paste(activeOffset))"></Button>
      </div>
      <div class="editorSpacer"></div>
      <div class="editorPage">
        <Button icon="pi pi-eject" label="Replace" title="Replace Back Page" 
          @click="onAction(EditorAction.reset(activeOffset+1))"></Button>
        <Button icon="pi pi-copy" label="Copy" title="Copy Back Page to Clipboard" 
          @click="onAction(EditorAction.copyToClipboard(activeOffset+1))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Back Page" 
          @click="onAction(EditorAction.paste(activeOffset+1))"></Button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { EditorAction } from '../../assets/EditorAction'

import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import TileOverlay from './TileOverlay.vue'
import { PageType } from '../../assets/Templates'


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
  // console.log('[Editor.loadProps] offset', props.offset)
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
  // console.log('[Editor.confirmAndDelete]', activeOffset.value, (typeof confirm))

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
  if(action.action == EditorAction._copyToPage) {
    confirm.require({
        message: 'Are you positive you will not regret overwritting page ' + (action.offsetTo + 1),
        header: "Overwrite Page",
        rejectLabel: 'No',
        acceptLabel: 'Yes, Overwrite',
        accept: () => {
          emits('action', action)
        }
      })

  } else {
    emits('action', action)
  }
}

function onSheetSelection(newOffset) {
  // console.log('[Editor.onSheetSelection]', index)
  activeOffset.value = newOffset
  onAction(EditorAction.changeOffset(newOffset))
}

function swapTilesLeft(params) {
  onAction(EditorAction.swapTiles(activeOffset.value, params))  
}
function swapTilesRight(params) {
  onAction(EditorAction.swapTiles(activeOffset.value+1, params))
}

</script>

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
  display: flex;
  justify-content: center;
  height: var(--page-height);
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
.editorSpacer {
  width: 80px;
}
.editorTop {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.middle {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100%;
  width: var(--pages-gap);
}
</style>