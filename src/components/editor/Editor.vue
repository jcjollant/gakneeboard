<template>
  <div class="editor">
    <ConfirmDialog />
    <div class="editorTitle">
      <div>Page Editor</div>
    </div>
    <div class="editorMenu">
      <MenuButton id="editorBtnSave" icon="check" label="Save Edits and Close" 
        @click="onExitAndSave" />
      <MenuButton id="editorBtnDiscard" icon="xmark" label="Discard Edits and Close" :active="true"
        @click="onDiscard" />
    </div>
    <div class="editorPageAll" v-if="model">
      <VerticalActionBar :offset="-1" @action="onAction"/>
      <div v-for="(page,index) in model['data']" v-show="index >= offset"
        class="editorPage" :class="'editorPage' + index">
        <div class="editorPageName">Page {{ index+1 }}</div>
        <VerticalActionBar class="middle" :offset="index" :last="index==model['data']['length'] - 1" 
          @action="onAction" />
        <Overlay :type="page['type']" :offset="index" class="overlay"
          @swap="swapTiles" />
        <div class="editorBottom">
          <Button icon="pi pi-copy" label="Copy" title="Copy Page to Clipboard" 
            @click="onAction(EditorAction.copyToClipboard(index))"></Button>
          <Button icon="pi pi-clipboard" label="Paste" title="Paste Clipboard to Page" 
            @click="onAction(EditorAction.paste(index))"></Button>
          <Button icon="pi pi-eject" label="Replace" title="Replace Page" 
            @click="onAction(EditorAction.reset(index))"></Button>
          <Button icon="pi pi-trash" label="Delete" title="Delete Page" severity="warning" 
            @click="onAction(EditorAction.deletePage(index))"></Button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditorAction } from '../../assets/EditorAction'

import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Overlay from './Overlay.vue'
import { PageType, Template } from '../../assets/Templates'
import VerticalActionBar from './VerticalActionBar.vue'
import { getToastData, toastError } from '../../assets/toast'
import { pageDataBlank, readPageFromClipboard } from '../../assets/sheetData'
import { duplicate } from '../../assets/data'
import MenuButton from '../menu/MenuButton.vue'


const emits = defineEmits(['discard','save','toast','offset'])
const confirm = useConfirm()
const model = defineModel({type:Object})
const modified = ref(false)
const offset = ref(0)
const sheets = ref([])

//---------------------
// Props management
const props = defineProps({
  offset: {type: Number, default: 0},
})

// We are getting out (post confirmation or without change)
function discard() {
  modified.value = false
  emits('discard')
}

function loadProps( props:any) {
  // console.log('Menu loadProps', JSON.stringify(props))
  // console.log('[Editor.loadProps] offset', props.offset)
  offset.value = props.offset;
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------

function onAction(action:EditorAction) {
  let confirmation:any|undefined = undefined
  if(action.action == EditorAction.COPY_TO_PAGE) confirmation = {message:'Please confirm you want to overwrite page ' + (action.offsetTo + 1), header:'Overwrite Page', acceptLabel:'Yes, Overwrite'}
  if(action.action == EditorAction.DELETE_PAGE) confirmation = {message:'Please confirm you want to delete page ' + (action.offset + 1), header:'Delete Page', acceptLabel:'Yes, Delete'}

  if(confirmation) {
    confirm.require({
        message: confirmation.message,
        header: confirmation.header,
        rejectLabel: 'No',
        acceptLabel: confirmation.acceptLabel,
        accept: () => {
          onEditorAction(action)
        }
      })
  } else {
    onEditorAction(action)
  }
}

// User selected Discard and close
function onDiscard() {
  // confirm and get out
  if(modified.value) {
    confirm.require({
        message: 'Would you like to close the editor without saving modifications?',
        header: 'Discard Changes',
        rejectLabel: 'No',
        acceptLabel: 'Yes, Discard',
        accept: () => {
          discard()
        }
      })
  } else {
    discard()
  }
}

// Leave the editor
function onExitAndSave() {
  modified.value = false
  emits('save')  
}

// Pages are manipulated via editor buttons
async function onEditorAction(ea:EditorAction) {
  // console.log('[App.onEditorAction]', JSON.stringify(ea))
  let updateOffset = false;

  if(!model.value) return;

  if(ea.action == EditorAction.COPY_TO_CLIPBOARD) {
    const pageData = model.value.data[ea.offset]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    emits('toast',getToastData('Page ' + (ea.offset+1) + ' copied to clipboard'))

  } else if(ea.action == EditorAction.COPY_TO_PAGE) {
    model.value.data[ea.offsetTo] = duplicate(model.value.data[ea.offset])

  } else if(ea.action == EditorAction.DELETE_PAGE) {
    // protection against last page removal
    if( model.value.data.length == 2) {
      emits('toast',getToastData( 'Cannot Delete Page', 'Last two pages cannot be deleted. Delete the template instead.', toastError))
      return;
    }
    // remove page from active template
    model.value.data.splice(ea.offset, 1)
    updateOffset = true

  } else if(ea.action == EditorAction.INSERT_PAGE) {
    // validate offset
    if( isNaN(ea.offset) || ea.offset < 0) return;
    if( ea.offset >= model.value.data.length) {
      // append blank page to last position
      model.value.data.push( pageDataBlank)
    } else {
      // insert blank page at position
      model.value.data.splice(ea.offset, 0, pageDataBlank)
    }
    updateOffset = true;

  } else if(ea.action == EditorAction.PASTE_PAGE) {
    readPageFromClipboard().then( page => {
      if(model.value)
        model.value.data[ea.offset] = page;
    }).catch( e => {
        emits('toast',getToastData('Cannot Paste', e, toastError))
    }) 

  } else if(ea.action == EditorAction.RESET_PAGE) {
    model.value.data[ea.offset] = duplicate(pageDataBlank)

  } else if(ea.action == EditorAction.SWAP_PAGE) {
    const swap = duplicate(model.value.data[ea.offset])
    model.value.data[ea.offset] = model.value.data[ea.offset + 1]
    model.value.data[ea.offset + 1] = swap;

  } else if(ea.action == EditorAction.SWAP_TILES) {
    // is this a tile page?
    if(model.value.data[ea.offset].type != PageType.tiles) return;
    const tileFrom = ea.params?.from
    const tileTo = ea.params?.to
    if(tileFrom === undefined || tileTo === undefined) return;

    const temp = duplicate(model.value.data[ea.offset].data[tileFrom])
    model.value.data[ea.offset].data[tileFrom] = model.value.data[ea.offset].data[tileTo]
    model.value.data[ea.offset].data[tileFrom].id = tileFrom
    model.value.data[ea.offset].data[tileTo] = temp
    model.value.data[ea.offset].data[tileTo].id = tileTo

  } else {
    reportError('[App.onEditorAction] unknown action ' + ea)
  }

  if(updateOffset) {
    // trigger offset event so parent is up to speed
    emits('offset', offset.value)
  }
  modified.value = true
}

function swapTiles(params:any) {
  onAction(EditorAction.swapTiles(params.offset, params))  
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
  gap: 10px;
  padding: 5px;
  height: 50px;
  width: 100%;
}
.editorMask {
  display: flex;
  justify-content: center;
  height: var(--page-height);
}
.editorMenu {
  position:fixed;
  top: var(--menu-border-offset);
  right: var(--menu-border-offset);
  display: flex;
  flex-flow: column;
  align-items: end;
  /* justify-content: flex-end; */
  gap: 10px;
  z-index: 2;
}

.editorPage {
  display: grid;
  gap:0;
  grid-template-columns: var(--page-width) var(--pages-gap);
  grid-template-rows: 50px var(--page-height) 50px;
}
.editorSheets {
  font-weight: bolder;
  color: lightgray;
  line-height: 2.5rem;
}
.editorSpacer {
  width: var(--pages-gap);
}
.editorPageName {
  font-weight: bolder;
  font-size: 2rem;
  width: var(--page-width);
  height: 50px;
  opacity: 0.4;
}
.editorPageAll {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  justify-content: center;
  overflow: hidden;
  height: calc( var(--page-height) + 100px);
}

.editorTitle {
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  font-size: 3rem;
  font-weight: 700;
  opacity: 0.6;
  top: 10px;
}

.middle {
  grid-column: 2;
  grid-row: 1 / span 3;
}

</style>