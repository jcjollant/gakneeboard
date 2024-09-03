<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { inject } from "@vercel/analytics"

import { duplicate, getBackend, newCurrentUser, reportError } from './assets/data.js'
import { backend, version } from './assets/data.js'
import { EditorAction } from './assets/Editor.ts'
import { getSheetDemoTiles, pageDataBlank, readPageFromClipboard } from './assets/sheetData'
import { getToastData, toastError, toastWarning } from './assets/toast'
import { LocalStore } from './assets/LocalStore'
import { TemplateData } from './assets/Templates'

import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

import Editor from './components/Editor.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Menu from './components/menu/Menu.vue'
import Page from './components/Page.vue'


const frontPageData = ref(null)
const backPageData = ref(null)
const activeTemplate = ref(null)
const offset = ref(0)
const offsetLast = ref(0)
const sheetModified = ref(false)

const flipMode = ref(false)
const showEditor = ref(false)
const showHowDoesItWork = ref(true)
const showVersion = ref(true)
const showMenu = ref(true)
const menuOpen = ref(false)
const showSheetName = ref(true)
const showPageOne = ref(true)
const showPageTwo = ref(true)
const toast = useToast()
const versionText = ref('')

function doPrint() {
  return new Promise( resolve => {
    window.print();
    restorePrintOptions();
    resolve(true)
  })
}

function getSheetName() {
  let name = ''
  if( !activeTemplate.value || !activeTemplate.value.name) return name
  return activeTemplate.value.name
}

function getSheetNumber() {
  if(offsetLast == 0) return ''
  // add the sheet number
  return '[' + (offset.value / 2 + 1) + '/' + (offsetLast.value / 2 + 1) + ']'
}

// update all widgets with provided data
function loadTemplate(template=null) {
  // console.log( '[App.loadTemplate]', typeof data, JSON.stringify(sheet))

  // if we don't know what to show, we load a copy of the demo page
  if( !template) {
    template = getSheetDemoTiles();
  }

  // make sure data is at the latest format
  const data = TemplateData.normalize(template.data)
  const numPages = data.length
  if( numPages >= 2 && (numPages % 2 == 0)){
    // we are on the first page and last page is calculated based on number of pages
    offset.value = 0
    offsetLast.value = numPages - 2; // 2 => 0, 4 => 2, ...
    frontPageData.value = data[0]
    backPageData.value = data[1]
    template.data = data
  } else {
    console.log('[App.loadTemplate] unexpected data length', data.length)
    frontPageData.value = null
    backPageData.value = null
    template.data = []
  }
  activeTemplate.value = template;
  // restore modified state
  sheetModified.value = template.modified;
  console.log('[App.loadTemplate]', offset.value, offsetLast.value)
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

  // How does it work popup check
  showHowDoesItWork.value = LocalStore.showHowDoesItWork()
})


// Pages are manipulated via editor buttons
async function onEditorAction(ea) {
  console.log('[App.onEditoAction]', JSON.stringify(ea))
  let updateFront = false;
  let updateBack = false;
  let saveTemplate = false;



  if(ea.action == EditorAction._add2Pages) {
    // add two blank pages to the end
    activeTemplate.value.data.push(pageDataBlank)
    activeTemplate.value.data.push(pageDataBlank)
    offsetLast.value += 2
    saveTemplate = true;
  } else if(ea.action == EditorAction._changeOffset) {
    onOffset(ea.offset)
  } else if(ea.action == EditorAction._copyPage) {
    const pageData = activeTemplate.value.data[ea.offset]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    showToast( getToastData('Page ' + ea.offset + ' copied to clipboard'))
  } else if(ea.action == EditorAction._delete2Pages) {
    // protection against invalid offset
    if(ea.offset < 0 || ea.offset > offsetLast.value) {
      console.log('[Add.onEditorAction] delete page invalid offset')
      return
    }
    // protection against last page removal
    if( offset.value == 0 && offsetLast.value == 0) {
      showToast( getToastData( 'Delete Pages', 'Last two pages cannot be deleted. Delete the template instead.', toastError))
      return;
    }
    // 1. Remove pages from template
    // 2. Refresh offsets
    // 3. Refresh displayed pages

    // remove pages from template
    activeTemplate.value.data.splice(ea.offset, 2)
    saveTemplate = true; // that enough because we are not changing page content
    // reduce the whole size
    offsetLast.value -= 2;
    // shift offset left if we are removing the last page
    if(offset.value < offsetLast.value) {
      offset.value = offsetLast.value;
    } 
    // refresh active pages
    frontPageData.value = activeTemplate.value.data[offset.value]
    backPageData.value = activeTemplate.value.data[offset.value+1]

  } else if(ea.action == EditorAction._swapPages) {

    const swap = duplicate(frontPageData.value)
    frontPageData.value = duplicate(backPageData.value)
    backPageData.value = swap;
    updateFront = true;
    updateBack = true;
  } else if(ea.action == EditorAction._resetPage) {
    if( ea.offset % 2 == 0) {
      frontPageData.value = duplicate(pageDataBlank)
      updateFront = true;
    } else {
      backPageData.value = duplicate(pageDataBlank)
      updateBack = true;
    }
  } else if(ea.action == EditorAction._pastePage) {
    readPageFromClipboard().then( page => {
        if( ea.offset % 2 == 0) {
          frontPageData.value = page;
          activeTemplate.value.data[offset.value] = page
        } else {
          backPageData.value = page;
          activeTemplate.value.data[offset.value + 1] = page
        }
        saveActiveTemplate(true)
    }).catch( e => {
        showToast(getToastData('Cannot Paste', e, toastError))
    }) 
  } else {
    reportError('[App.oneditorAction] unknown action ' + ea)
  }
  // update active template with new values
  if(updateFront) activeTemplate.value.data[offset.value] = frontPageData.value
  if(updateBack) activeTemplate.value.data[offset.value + 1] = backPageData.value
  // Save new template if we had any changes
  if(updateFront||updateBack||saveTemplate) saveActiveTemplate(true)
}

/**
 * Copy all left tiles from left to right
 */
function onEditor() {
  if(!showEditor.value && sheetModified.value) {
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
      Templates.getPublication(code).then( template => {
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
    loadTemplate(getSheetDemoTiles())
    saveActiveTemplate()
  }
  // Analytics
  inject();
})

function onOffset(newOffset) {
  // console.log('[App.onOffset]', newOffset, offsetLast.value)
  if(!activeTemplate.value || newOffset < 0 || newOffset > offsetLast.value){
    console.log('[App.onOffset] invalid offset')
    return;
  } 
  offset.value = newOffset;
  frontPageData.value = activeTemplate.value.data[newOffset]
  backPageData.value = activeTemplate.value.data[newOffset+1]
  console.log('[App.onOffset]', JSON.stringify(frontPageData.value))
}

function onPrint(options) {
  // console.log('[App.onPrint]')
  flipMode.value = options.flipped;
  showPageOne.value = options.showFront;
  showPageTwo.value = options.showBack;
  // These things don't change
  showVersion.value = false;
  showSheetName.value = false
  showMenu.value = false
  showEditor.value = false;
  showHowDoesItWork.value = false;

  // print window content after a short timeout to let flipmode kickin
  setTimeout(doPrint, 500);
}

function onPrintOptions(options) {
  // console.log('[App.onPrintOptions]', JSON.stringify(options))
  if( options) {
    flipMode.value = options.flipped;
    showPageOne.value = options.showFront;
    showPageTwo.value = options.showBack;
  } else {
    restorePrintOptions();
  }
}

function onPageUpdateBack( pageData) {
  // console.log('[App.onPageUpdateBack]', JSON.stringify(pageData))
  backPageData.value = pageData;
  activeTemplate.value.data[offset.value + 1] = pageData
  saveActiveTemplate(true)
}

function onPageUpdateFront(pageData) {
  // console.log('[App.onPageUpdateFront]')
  frontPageData.value = pageData
  activeTemplate.value.data[offset.value] = pageData
  saveActiveTemplate(true)
}

function restorePrintOptions() {
    // Bring everything back to normal
    flipMode.value = false;
    showVersion.value = true;
    showMenu.value = true
    showSheetName.value = true;
    showPageOne.value = true;
    showPageTwo.value = true;
    showEditor.value = false;
    showHowDoesItWork.value = false;
}

function saveActiveTemplate(modified=false) {
  // console.log('[App.saveActiveSheet]', modified)
  LocalStore.saveTemplate(activeTemplate.value, modified)
  sheetModified.value = modified
}

function showToast(data) {
  toast.add(data)
}
</script>

<template>
  <div class="main">
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Editor v-if="showEditor" :template="activeTemplate" :offset="offset"
      @action="onEditorAction" @offset="onOffset"/>
    <Toast />
    <div class="sheetName" v-show="showSheetName"
      :class="{'sheetNameOffset':menuOpen, 'sheetNameModified': sheetModified}">
      <div>{{ getSheetName() }}</div>
      <div class="sheetNumber">{{ getSheetNumber() }}</div>
    </div>
    <div class="pageGroup">
      <i class="pi pi-chevron-circle-left offsetButton" :class="{'noShow':(offset == 0 || showEditor)}"
        title="Previous Pages"
        @click="onOffset(offset - 2)"></i>
      <div :class="{'twoPages':showPageOne && showPageTwo}">
        <Page :data="frontPageData" v-if="showPageOne" class="pageOne"
          @update="onPageUpdateFront" 
          @toast="toast.add" />
        <Page :data="backPageData" v-if="showPageTwo" class="pageTwo" :class="{flipMode:flipMode}"
          @update="onPageUpdateBack" 
          @toast="toast.add" />
      </div>
      <i class="pi pi-chevron-circle-right offsetButton"  :class="{'noShow':(offset >= offsetLast || showEditor)}"
        title="Next Pages"
        @click="onOffset(offset + 2)"></i>
    </div>
    <Menu class="menu" :activeTemplate="activeTemplate" v-show="showMenu" v-if="!showEditor" title="Toggle Menu"
      @howDoesItWork="showHowDoesItWork=true"
      @load="onMenuLoad" 
      @print="onPrint" @printOptions="onPrintOptions"
      @save="onMenuSave"
      @toast="toast.add" @toggle="onMenuToggle"
      >
    </Menu>
    <i class="pi pi-file-edit editorButton clickable" v-show="showMenu" :class="{'editorButtonActive':showEditor}"
      @click="onEditor" title="Toggle Editor Mode"></i>
    <div class="versionDialog" v-show="showVersion">{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span>
    </div>
  </div>
  
</template>

<style scoped>
.editorButton {
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-size: 1.5rem;
  color: darkgrey;
}

.editorButtonActive {
  color:blue
}

.main {
  display: flex;
  flex-flow: column;
  gap: 1rem;
}
.pageGroup {
  display: flex;
  gap: 2rem;
  align-items: center;
  /* position: absolute; */
  /* right: 5px; */
}
.pageOne, .pageTwo {
  background:white;
}

.twoPages {
  display: grid;
  grid-template-columns: auto auto;
  gap: 80px;
}
.onePage {
  display:flex
}
.offsetButton {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
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
