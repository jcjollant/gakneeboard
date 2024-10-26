<template>
  <div class="editor">
    <ConfirmDialog></ConfirmDialog>
    <div class="editorTop">
      <div>Page {{ activeOffset+1 }}</div>
      <div>Page {{ activeOffset+2 }}</div>
    </div>
    <div class="editorMask">
      <TileOverlay :show="activeTemplate?.data[activeOffset].type==PageType.tiles"
        class="leftTileOverlay"
        @swap="swapTilesLeft" />
      <div class="middle">
          <Button id="editorCopyToRight" icon="pi pi-arrow-right" title="Copy Left to Right" 
              @click="onAction(EditorAction.copyToPage(activeOffset, activeOffset+1))" ></Button>
          <Button id="editorSwap" icon="pi pi-arrow-right-arrow-left" title="Swap Left and Right" 
              @click="onActionName(EditorAction.SWAP_PAGE)" ></Button>
          <Button id="editorCopyToLeft" icon="pi pi-arrow-left" title="Copy Right to Left" 
              @click="onAction(EditorAction.copyToPage(activeOffset+1, activeOffset))" ></Button>
          <Button id="editorInsert" icon="pi pi-plus" title="Insert New Page" 
              @click="onAction(EditorAction.insertPage(activeOffset+1))" ></Button>
          <FAButton icon="video" title="Editor Demo Video" :link="true"
              @click="UserUrl.open(UserUrl.editorVideo)"/>
      </div>
      <TileOverlay :show="activeTemplate?.data[activeOffset+1].type==PageType.tiles"
        class="rightTileOverlay"
        @swap="swapTilesRight" />
    </div>
    <div class="editorBottom">
      <div class="editorPage">
        <Button icon="pi pi-copy" label="Copy" title="Copy Left Page to Clipboard" 
          @click="onAction(EditorAction.copyToClipboard(activeOffset))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Left Page" 
          @click="onAction(EditorAction.paste(activeOffset))"></Button>
        <Button icon="pi pi-eject" label="Replace" title="Replace Left Page" 
          @click="onAction(EditorAction.reset(activeOffset))"></Button>
        <Button icon="pi pi-trash" label="Delete" title="Delete Page" severity="warning" 
          @click="onAction(EditorAction.deletePage(activeOffset))"></Button>
      </div>
      <div class="editorSpacer"></div>
      <div class="editorPage">
        <Button icon="pi pi-copy" label="Copy" title="Copy Back Page to Clipboard" 
          @click="onAction(EditorAction.copyToClipboard(activeOffset+1))"></Button>
        <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Back Page" 
          @click="onAction(EditorAction.paste(activeOffset+1))"></Button>
        <Button icon="pi pi-eject" label="Replace" title="Replace Back Page" 
          @click="onAction(EditorAction.reset(activeOffset+1))"></Button>
        <Button icon="pi pi-trash" label="Delete" title="Delete Page" severity="warning" 
          @click="onAction(EditorAction.deletePage(activeOffset+1))"></Button>
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
import { UserUrl } from '../../lib/UserUrl'
import FAButton from '../shared/FAButton.vue'


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
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------

/**
 * Send action to parent (App is processing Editor events)
 * @param {*} actionName 
 */
function onActionName(actionName) {
  onAction(new EditorAction(actionName))
}

function onAction(action) {
  let confirmation = undefined
  if(action.action == EditorAction.COPY_TO_PAGE) confirmation = {message:'Please confirm you want to overwrite page ' + (action.offsetTo + 1), header:'Overwrite Page', acceptLabel:'Yes, Overwrite'}
  if(action.action == EditorAction.DELETE_PAGE) confirmation = {message:'Please confirm you want to delete page ' + (action.offset + 1), header:'Delete Page', acceptLabel:'Yes, Delete'}

  if(confirmation) {
    confirm.require({
        message: confirmation.message,
        header: confirmation.header,
        rejectLabel: 'No',
        acceptLabel: confirmation.acceptLabel,
        accept: () => {
          emits('action', action)
        }
      })
  } else {
    emits('action', action)
  }
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
  min-width: var(--editor-min-width)
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
  width: var(--page-width);
  justify-content: center;
}
.editorSheets {
  font-weight: bolder;
  color: lightgray;
  line-height: 2.5rem;
}
.editorSpacer {
  width: var(--pages-gap);
}
.editorTop {
  display: grid;
  grid-template-columns: var(--page-width) var(--page-width);
  gap: var(--pages-gap);
  font-weight: bolder;
  font-size: 2rem;
  opacity: 0.4;
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