<template>
  <div v-if="printPreview">
    <div v-if="activeTemplate" class="printPreview">
      <div></div>
      <div class="printPages"  :class="{'twoPages':!printSingles}" >
        <Page v-for="(page,index) in activeTemplate.data" :data="page"
          :class="{flipMode:(index % 2 == 1 && printFlipMode),printPageBreak:(printSingles || index % 2 == 1)}" />
      </div>
      <div></div>
    </div>
  </div>
  <div v-else class="main">
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Feedback v-model:visible="showFeedback"
      @close="showFeedback=false" @toast="toast.add" />

    <Editor v-if="showEditor" :template="activeTemplate" :offset="offset"
      @action="onEditorAction" @offset="onOffset"/>
    <Toast />
    <div class="sheetName"
      :class="{'sheetNameOffset':menuOpen, 'sheetNameModified': templateModified}"
      :title="templateModified ? 'Template has been modified' : ''">
      <div>{{ getTemplateName() }}</div>
    </div>
    <div class="pageGroup" :class="{'editor':showEditor}" >
      <i class="pi pi-chevron-circle-left offsetButton" :class="{'noShow':(offset == 0)}"
        title="Previous Page" id="offsetPrev"
        @click="onOffset(offset - 1)"></i>
      <div v-if="activeTemplate" class="pageAll" :class="{'editor':showEditor}">
        <Page v-for="(data,index) in activeTemplate.data" :data="data" :index="index" v-show="index >= offset && (!showEditor || index < offset + 2)"
          :class="'page'+index"
          @update="onPageUpdate" @toast="toast.add" />
      </div>
      <i class="pi pi-chevron-circle-right offsetButton"  :class="{'noShow':(offset >= offsetLast)}"
        title="Next Page" id="offsetNext"
        @click="onOffset(offset + 1)"></i>
    </div>
    <MenuButton icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=true" />
    <MenuButton id="btnEditor" icon="pen-to-square" title="Toggle Editor Mode" label="Page Editor" :active="showEditor"
     :class="{'editorButtonActive':showEditor}" class="editorButton" 
      @click="onEditor"/>
    <div class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span>
    </div>
  </div>
  <Menu class="menu" :activeTemplate="activeTemplate" v-show="!printPreview" v-if="!showEditor" :singlePage="singlePage"
    @howDoesItWork="showHowDoesItWork=true"
    @load="onMenuLoad" 
    @print="onPrint" @printOptions="onPrintOptions" @printPreview="onPrintPreview"
    @save="onMenuSave"
    @toast="toast.add" @toggle="onMenuToggle"
    >
  </Menu>
</template>

<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted, onUnmounted,ref} from 'vue'
import { inject } from "@vercel/analytics"

import { duplicate, getBackend, newCurrentUser, reportError } from './assets/data.js'
import { backend, version } from './assets/data.js'
import { EditorAction } from './assets/EditorAction.ts'
import { getTemplateDemoTiles, pageDataBlank, readPageFromClipboard } from './assets/sheetData'
import { getToastData, toastError, toastWarning } from './assets/toast'
import { LocalStore } from './lib/LocalStore.ts'
import { PageType, TemplateData } from './assets/Templates'

import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

import Editor from './components/editor/Editor.vue'
import Feedback from './components/menu/Feedback.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Menu from './components/menu/Menu.vue'
import Page from './components/Page.vue'
import MenuButton from './components/menu/MenuButton.vue'


// const frontPageData = ref(null)
// const backPageData = ref(null)
const activeTemplate = ref(null)
const cssPageGap = 80
const cssPageWidth = 490
const offset = ref(0)
const offsetLast = ref(0)
const templateModified = ref(false)

const printFlipMode = ref(false)
const printPreview = ref(false)
const printSingles = ref(false)
const showEditor = ref(false)
const showFeedback = ref(false)
const showHowDoesItWork = ref(true)
const menuOpen = ref(false)
const singlePage = ref(false)
const toast = useToast()
const versionText = ref('')

function afterPrint() {
  // console.log('[App.afterPrint]')
  restorePrintOptions();
}

function getTemplateName() {
  let name = ''
  if( !activeTemplate.value || !activeTemplate.value.name) {
    name = 'New Template'
  } else {
    name = activeTemplate.value.name
  } 
  if( templateModified.value) name += '*'
  return name;
}

// update all widgets with provided data
function loadTemplate(template=null) {
  // console.log( '[App.loadTemplate]', typeof data, JSON.stringify(sheet))

  // if we don't know what to show, we load a copy of the demo page
  if( !template) {
    template = getTemplateDemoTiles();
  }

  // make sure data is at the latest format
  const data = TemplateData.normalize(template.data)

  // we are on the first page and last page is calculated based on number of pages
  offset.value = 0
  // frontPageData.value = data[0]
  // backPageData.value = data[1]
  template.data = data

  activeTemplate.value = template;
  updateOffsets() // compute offsetLast
  // restore modified state
  templateModified.value = template.modified;
  // console.log('[App.loadTemplate]', offset.value, offsetLast.value)
}

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  LocalStore.stopHowDoesItWork()
}

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount(()=>{
  // activate the last known user
  newCurrentUser.restore()

  // console.log('[App.onBeforeMount]')
  getBackend().then(() => {
    versionText.value = version + '/' + backend.version
  })
  LocalStore.cleanUp()
  // How does it work popup check
  showHowDoesItWork.value = LocalStore.showHowDoesItWork()
})


// Pages are manipulated via editor buttons
async function onEditorAction(ea) {
  // console.log('[App.onEditorAction]', JSON.stringify(ea))
  let saveTemplate = true;

  if(ea.action == EditorAction.COPY_TO_CLIPBOARD) {
    const pageData = activeTemplate.value.data[ea.offset]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    showToast( getToastData('Page ' + (ea.offset+1) + ' copied to clipboard'))
    saveTemplate = false;

  } else if(ea.action == EditorAction.COPY_TO_PAGE) {
    activeTemplate.value.data[ea.offsetTo] = activeTemplate.value.data[ea.offset]

  } else if(ea.action == EditorAction.DELETE_PAGE) {
    // protection against last page removal
    if( activeTemplate.value.data.length == 2) {
      showToast( getToastData( 'Cannot Delete Page', 'Last two pages cannot be deleted. Delete the template instead.', toastError))
      return;
    }
    // remove page from active template
    activeTemplate.value.data.splice(ea.offset, 1)
    // adjust offsetLast
    offsetLast.value = Math.max(0, offsetLast.value - 1);

  } else if(ea.action == EditorAction.INSERT_PAGE) {
    // validate offset
    if( isNaN(ea.offset) || ea.offset < 0 || ea.offset >= activeTemplate.value.data.length) return;
    activeTemplate.value.data.splice(ea.offset, 0, pageDataBlank)

  } else if(ea.action == EditorAction.PASTE_PAGE) {
    readPageFromClipboard().then( page => {
        activeTemplate.value.data[ea.offset] = page;
    }).catch( e => {
        showToast(getToastData('Cannot Paste', e, toastError))
        saveTemplate = false;
    }) 

  } else if(ea.action == EditorAction.RESET_PAGE) {
    activeTemplate.value.data[ea.offset] = duplicate(pageDataBlank)

  } else if(ea.action == EditorAction.SWAP_PAGE) {
    const swap = duplicate(activeTemplate.value.data[offset.value])
    activeTemplate.value.data[offset.value] = activeTemplate.value.data[offset.value + 1]
    activeTemplate.value.data[offset.value + 1] = swap;

  } else if(ea.action == EditorAction.SWAP_TILES) {
    // is this a tile page?
    if(activeTemplate.value.data[ea.offset].type != PageType.tiles) return;
    const tileFrom = ea.params?.from
    const tileTo = ea.params?.to
    if(tileFrom === undefined || tileTo === undefined) return;

    const temp = duplicate(activeTemplate.value.data[ea.offset].data[tileFrom])
    activeTemplate.value.data[ea.offset].data[tileFrom] = activeTemplate.value.data[ea.offset].data[tileTo]
    activeTemplate.value.data[ea.offset].data[tileFrom].id = tileFrom
    activeTemplate.value.data[ea.offset].data[tileTo] = temp
    activeTemplate.value.data[ea.offset].data[tileTo].id = tileTo
  } else {
    reportError('[App.onEditorAction] unknown action ' + ea)
    saveTemplate = false
  }
  // Save new template if we had any changes
  if(saveTemplate) {
    saveActiveTemplate(true)
    updateOffsets()
  } 
}

/**
 * Copy all left tiles from left to right
 */
function onEditor() {
  if(!showEditor.value && templateModified.value) {
    showToast( getToastData('Editing Modified Page','Save your page before editing to undo potential mistakes', toastWarning, 5000))
  }
  showEditor.value = !showEditor.value;
}

function onMenuLoad(sheet) {
  // console.log('[App.onMenuLoad]', JSON.stringify(sheet))
  if(sheet && sheet.data) {
    loadTemplate(sheet)
    saveActiveTemplate(false)
  } else {
    console.log('[App.onMenuLoad] could not load', JSON.stringify(sheet))
  }
}

function onMenuSave(template) {
  // console.log('[App.onMenuSave]', JSON.stringify(template))
  activeTemplate.value = template;
  saveActiveTemplate(false)
}

function onMenuToggle(value) {
  menuOpen.value = value
}

onMounted(async () => {
  // console.log('[App.onMounted]')
  try {
    // console.log( '[App.onMounted]', JSON.stringify(window.location.search))
    let urlParams = new URLSearchParams(window.location.search);
    if( urlParams.has('sheet') || urlParams.has('t')) {
      const code = urlParams.has('t') ? urlParams.get('t') : urlParams.get('sheet')
      // console.log('[App.onMounted] sheet code', sheetCode)

      // Get that publication data
      TemplateData.getPublication(code).then( template => {
        // console.log('[App.onMounted] sheet', JSON.stringify(sheet))
        // showToast('Fetch', 'Sheet found')
        if(template) {
          loadTemplate(template)
        } else {
          showToast( getToastData( 'Load Template','Code not found ' + code, toastError))
          loadTemplate(LocalStore.getTemplate())
        }
      }).catch(e => {
          showToast( getToastData( 'Load Template','Error fetching template ' + code, toastError))
          loadTemplate(LocalStore.getTemplate())
      }) 
    } else {
      // Vanilla scenario load local sheet
      loadTemplate(LocalStore.getTemplate())
    }
  } catch(e) {
    console.log('[App.onMounted] local data is corrupted' + e)
    // revert to demo tiles
    loadTemplate(getTemplateDemoTiles())
    saveActiveTemplate()
  }
  // position the resize listener and invoke once
  window.addEventListener('resize', updateOffsets)
  updateOffsets()
  // 
  window.addEventListener('afterprint', afterPrint)

  // Analytics
  inject();
})

// Validate and assign new offset value
function onOffset(newOffset) {
  // console.log('[App.onOffset]', newOffset, offsetLast.value)
  if(newOffset < 0 || newOffset > offsetLast.value){
    console.log('[App.onOffset] invalid offset', newOffset)
    return;
  } 
  offset.value = newOffset;
}

function onPageUpdate(pageData) {
  // console.log('[App.onPageUpdate] index', pageData.index)
  // save template data without index
  activeTemplate.value.data[pageData.index] = {data:pageData.data,type:pageData.type}
  saveActiveTemplate(true)
}

function onPrint(options) {
  // console.log('[App.onPrint]')
  printPreview.value = true;
  printFlipMode.value = options.flipBackPage;
  printSingles.value = (options.pagePerSheet == 1)

  // These things don't change
  showEditor.value = false;
  showHowDoesItWork.value = false;

  // print window content after a short timeout to let flipmode kickin
  setTimeout( async () => {
    return new Promise( resolve => {
      window.print();
      resolve(true)
    })
  }, 500);
}

function onPrintOptions(options) {
  // console.log('[App.onPrintOptions]', JSON.stringify(options))
  if( options) {
    printFlipMode.value = options.flipBackPage;
    printSingles.value = (options.pagePerSheet == 1)
  } else {
    restorePrintOptions();
  }
}

function onPrintPreview(show) {
  // console.log('[App.onPrintPreview]', show)
  printPreview.value = show
}

onUnmounted(() => {
  window.removeEventListener('resize', updateOffsets)
  window.removeEventListener('afterprint', afterPrint)
})

function restorePrintOptions() {
    // Bring everything back to normal
    printPreview.value = false;
    printFlipMode.value = false;
    showEditor.value = false;
    showHowDoesItWork.value = false;
}

function saveActiveTemplate(modified=false) {
  // console.log('[App.saveActiveSheet]', modified)
  LocalStore.saveTemplate(activeTemplate.value, modified)
  templateModified.value = modified
}

function showToast(data) {
  toast.add(data)
}

function updateOffsets() {
  // console.log('[App.onResize]', window.innerWidth)
  if(!activeTemplate.value) return;
  // how many pages can fit in the new width?
  const fittingPages = Math.floor((window.innerWidth - cssPageGap) / (cssPageWidth + cssPageGap))
  // cssPageGap * (1 + numPages) +  cssPageWidth * numPages
  offsetLast.value = Math.max(activeTemplate.value.data.length - fittingPages, 0)
  // console.log('[App.onResize] fitting', fittingPages, 'offsetLast', offsetLast.value)
  if(offset.value > offsetLast.value) offset.value = offsetLast.value
  singlePage.value = fittingPages == 1;
}

</script>

<style scoped>
.editorButton {
  position: absolute;
  right: 10px;
  top: 10px;
}

.feedbackButton {
  position: absolute;
  left: 10px;
  bottom: 10px;
}

.main {
  display: flex;
  flex-flow: column;
  gap: 1rem;
}

.pageGroup {
  display: grid;
  grid-template-columns: var(--pages-gap) 1fr var(--pages-gap);
  align-items: center;
  width: 100%;
}

.pageGroup .editor {
  min-width: var(--min-width-editor);
}

.pageAll {
  display: flex;
  gap: var(--pages-gap);
  flex-wrap: wrap;
  height: var(--page-height);
  justify-content: center;
  overflow: hidden;
}

.pageAll.editor {
  min-width: 1080px;
}

.printPreview {
  display:grid;
  grid-template-columns: auto auto auto;
}
.printPages {
  display: grid;
  grid-template-columns: auto;
  gap: 0 var(--pages-gap);
  justify-content: center;
}
.printPages.twoPages {
  grid-template-columns: auto auto;
}
.printPageBreak {
  break-after: page;
}
.onePage {
  display:flex
}
.offsetButton {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
}
.menu {
  position: absolute;
  left:5px;
  top:5px;
}
.flipMode {
  transform: scale(-1,-1);
}
.sheetName {
  position : absolute;
  font-size: 3rem;
  font-weight: 700;
  opacity: 0.1;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.sheetNumber {
  font-size: 1rem;
  padding: 0.5rem;
}

.sheetNameOffset {
  top: 3rem;
}

.sheetNameModified {
  font-style: italic;
  color: orange;
  opacity: 0.4;
}

</style>
