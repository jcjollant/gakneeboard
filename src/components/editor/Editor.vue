<template>
  <div class="editor">
    <div class="editorPageAll" v-if="model">
      <VerticalActionBar :offset="-1" @action="onAction"/>
      <div v-for="(page,index) in model['data']" v-show="index >= offset"
        class="editorPage" :class="'editorPage' + index">
        <VerticalActionBar class="middle" :offset="index" :last="index==model['data']['length'] - 1" 
          @action="onAction" />
        <Overlay :type="page['type']" :offset="index" class="overlay"
          @swap="swapTiles" @copy="copyTile" @paste="pasteTile" />
        <div class="editorBottom">
          <Button icon="pi pi-copy" label="Copy" title="Copy Page to Clipboard" 
            @click="onAction(EditorAction.copyPageToClipboard(index))"></Button>
          <Button icon="pi pi-clipboard" label="Paste" title="Paste Page from Clipboard" 
            @click="onAction(EditorAction.pastePage(index))"></Button>
          <Button icon="pi pi-eject" label="Replace" title="Replace Page" 
            @click="onAction(EditorAction.reset(index))"></Button>
          <Button icon="pi pi-trash" label="Delete" title="Delete Page" severity="warning" class="btnDelete"
            @click="onAction(EditorAction.deletePage(index))"></Button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditorAction } from '../../assets/EditorAction'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../../assets/Toaster'
import { PageType } from '../../assets/PageType'
// import { Template } from '@/assets/Templates'
import { readPageFromClipboard } from '../../assets/sheetData'
import { duplicate } from '../../assets/data'

import Button from 'primevue/button'
import Overlay from './Overlay.vue'
import VerticalActionBar from './VerticalActionBar.vue'
import { Template, TemplatePage } from '../../model/Template'

const emits = defineEmits(['update','offset'])
const confirm = useConfirm()
const model = defineModel({type:Template})
const modified = ref(false)
const offset = ref(0)
const toaster = useToaster(useToast())

//---------------------
// Props management
const props = defineProps({
  offset: {type: Number, default: 0},
})

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

function copyTile(params:any) {
  onAction(EditorAction.copyTileToClipboard(params.offset, params.tile))  
}

function onAction(action:EditorAction) {
  let confirmation:any|undefined = undefined
  if(action.action == EditorAction.DUPLICATE_PAGE) confirmation = {message:'Please confirm you want to overwrite page ' + (action.offsetTo + 1), header:'Overwrite Page', acceptLabel:'Yes, Overwrite'}
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

// Pages are manipulated via editor buttons
async function onEditorAction(ea:EditorAction) {
  // console.log('[Editor.onEditorAction]', ea, model.value)
  let updateOffset = false;
  const updatedPages:number[] = []

  // if we dont have a template, we can leave
  if(!model.value) return;

  if(ea.action == EditorAction.COPY_PAGE_TO_CLIPBOARD) {

    const pageData = model.value.data[ea.offset]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    toaster.success('Editor', 'Page ' + (ea.offset+1) + ' copied to clipboard')

  } else if(ea.action == EditorAction.COPY_TILE_TO_CLIPBOARD) {

    const pageData = model.value.data[ea.offset]
    pageData['sourceTile'] = ea.offsetTo
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    toaster.success('Editor', 'Tile ' + (ea.offsetTo+1) + ' copied to clipboard')

  } else if(ea.action == EditorAction.DUPLICATE_PAGE) {

    model.value.data[ea.offsetTo] = duplicate(model.value.data[ea.offset])
    updatedPages.push(ea.offsetTo)

  } else if(ea.action == EditorAction.DELETE_PAGE) {

    // protection against last page removal
    if( model.value.data.length == 2) {
      toaster.warning('Cannot Delete Page', 'Last two pages cannot be deleted. Delete the template instead.')
      return;
    }
    // remove page from active template
    model.value.data.splice(ea.offset, 1)
    // updatedPages.push(ea.offset)
    updateOffset = true

  } else if(ea.action == EditorAction.INSERT_PAGE) {

    // validate offset
    if( isNaN(ea.offset) || ea.offset < 0) return;
    if( ea.offset >= model.value.data.length) {
      // append blank page to last position
      model.value.data.push( TemplatePage.SELECTION)
    } else {
      // insert blank page at position
      model.value.data.splice(ea.offset, 0, TemplatePage.SELECTION)
    }
    updatedPages.push(ea.offset)
    updateOffset = true;

  } else if(ea.action == EditorAction.PASTE_PAGE) {

    readPageFromClipboard().then( page => {
      if(model.value) {
        model.value.data[ea.offset] = page;
        updatedPages.push(ea.offset)
      }
    }).catch( e => {
        toaster.error('Editor', 'Cannot Paste ' + e)
    }) 

  } else if(ea.action == EditorAction.PASTE_TILE) {
    
    await readPageFromClipboard().then( page => {
      if( !('sourceTile' in page)) throw new Error('No source tile found in clipboard')
      if(model.value) {
        if( isNaN(ea.offset) || isNaN(ea.offsetTo)) return;
        // offset has the page number, offsetTo has the tile number
        // console.log('[App.onEditorAction] pasteTile', ea.offset, ea.offsetTo, page.sourceTile, page)
        model.value.data[ea.offset].data[ea.offsetTo] = page.data[page.sourceTile];
        model.value.data[ea.offset].data[ea.offsetTo].id = ea.offsetTo;
        updatedPages.push(ea.offset)
      }
    }).catch( e => {
        toaster.error('Editor','Cannot Paste Tile' + e)
    }) 

  } else if(ea.action == EditorAction.RESET_PAGE) {

    model.value.data[ea.offset] = duplicate(TemplatePage.SELECTION)
    updatedPages.push(ea.offset)

  } else if(ea.action == EditorAction.SWAP_PAGE) {

    const swap = duplicate(model.value.data[ea.offset])
    model.value.data[ea.offset] = model.value.data[ea.offset + 1]
    model.value.data[ea.offset + 1] = swap;
    updatedPages.push(ea.offset)
    updatedPages.push(ea.offset + 1)

  } else if(ea.action == EditorAction.SWAP_TILES) {

    // is this a tile page?
    if(model.value.data[ea.offset].type != PageType.tiles) return;
    const tileFrom = ea.params?.from
    const tileTo = ea.params?.to
    if(tileFrom === undefined || tileTo === undefined) return;

    const temp = duplicate(model.value.data[ea.offset].data[tileFrom])
    // console.log('[Editor.onEditorAction]', temp, model.value.data[ea.offset].data[tileTo], tileFrom, tileTo)
    model.value.data[ea.offset].data[tileFrom] = model.value.data[ea.offset].data[tileTo]
    model.value.data[ea.offset].data[tileTo] = temp
    // refresh ids
    model.value.data[ea.offset].data[tileFrom].id = tileFrom
    model.value.data[ea.offset].data[tileTo].id = tileTo
    // reset span and hide
    model.value.data[ea.offset].data[tileFrom]['span2'] = false
    model.value.data[ea.offset].data[tileFrom]['hide'] = false
    model.value.data[ea.offset].data[tileTo]['span2'] = false
    model.value.data[ea.offset].data[tileTo]['hide'] = false
    updatedPages.push(ea.offset)

  } else {
    reportError('[App.onEditorAction] unknown action ' + ea)
  }

  if(updateOffset) {
    // trigger offset event so parent is up to speed
    emits('offset', offset.value)
  }
  // console.log('[Editor.editoAction] ', updatedPages)
  for( const index of updatedPages) {
    // console.log('[Editor.editoAction] updatePage', ea.action, index)
    emits('update', index, model.value.data[index]) 
  }
  modified.value = true
  // LocalStore.saveTemplate(model.value)
}

function pasteTile(params:any) {
  onAction(EditorAction.pasteTile(params.offset, params.tile))  
}

function swapTiles(params:any) {
  // console.log('[Editor.swapTiles]', params)
  onAction(EditorAction.swapTiles(params.offset, params))  
}

</script>

<style scoped>
* {
  --editor-bottom-height: 50px;
  --editor-height: calc(var(--page-height) + var(--editor-bottom-height));
}
.active {
  background-color: white;
  color: black;
}
.editor {
  position: absolute;
  left: 0;
  top: calc(var(--menu-height) + var(--main-gap)); 
  width: 100%;
  height: var(--editor-height);
  display: flex;
  flex-flow: column;
  gap: 1rem;
  min-width: var(--editor-min-width)
}
.editorBottom {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 5px;
  height: var(--editor-bottom-height);
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
  gap: 10px;
  z-index: 2;
}

.editorPage {
  display: grid;
  gap:0;
  grid-template-rows: var(--page-height) 50px;
  grid-template-columns: var(--page-width) var(--pages-gap);
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
  /* height: var(--editor-height); */
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
  grid-row: 1;
}

</style>