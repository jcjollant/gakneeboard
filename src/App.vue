<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { inject } from "@vercel/analytics"

import { duplicate, getBackend, keyUser, reportError, setCurrentUser, sheetGetByCode } from './assets/data.js'
import { backend, version } from './assets/data.js'
import { EditorAction } from './assets/Editor.ts'
import { getSheetDemoTiles, getSheetLocal, localSheetSave, normalizeSheetData, pageDataBlank, readPageFromClipboard } from './assets/sheetData'
import { getToastData, toastError, toastWarning } from './assets/toast'

import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

import Editor from './components/Editor.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Menu from './components/menu/Menu.vue'
import Page from './components/Page.vue'


const frontPageData = ref(null)
const backPageData = ref(null)
const activeSheet = ref(null)
const sheetModified = ref(false)

const flipMode = ref(false)
const keyHowDoesItWork = 'howDoesItWork'
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
  if( !activeSheet.value || !activeSheet.value.name) return ''
  return activeSheet.value.name 
}

// update all widgets with provided data
function loadSheet(sheet=null) {
  // console.log( '[App.loadSheet]', typeof data, JSON.stringify(sheet))

  // if we don't know what to show, we load a copy of the demo page
  if( !sheet) {
    sheet = getSheetDemoTiles();
  }

  // make sure data is at the latest format
  const data = normalizeSheetData(sheet.data)
  if( data.length == 2){
    frontPageData.value = data[0]
    backPageData.value = data[1]
  } else {
    console.log('[App.loadSheet] unexpected data length', data.length)
    frontPageData.value = null
    backPageData.value = null
  }
  sheet.data = [frontPageData.value, backPageData.value]
  activeSheet.value = sheet;
  sheetModified.value = sheet.modified;
}

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  localStorage.setItem(keyHowDoesItWork, "false")
}

// Before the app starts, we request backend information, load user and potentially show how does it work
onBeforeMount(()=>{
  // console.log('[App.onBeforeMount]')
  getBackend().then(() => {
    versionText.value = version + '/' + backend.version
  })
  // activate the last known user
  const user = JSON.parse(localStorage.getItem(keyUser))
  if( user) {
    setCurrentUser( user)
  }

  // How does it work popup check
  if( localStorage.getItem( keyHowDoesItWork) == 'false') {
    showHowDoesItWork.value = false;
  }
})

async function onEditorAction(action) {
  if(action == EditorAction.swapPages) {
    const swap = duplicate(frontPageData.value)
    frontPageData.value = duplicate(backPageData.value)
    backPageData.value = swap;
  } else if(action == EditorAction.resetFront) {
    frontPageData.value = duplicate(pageDataBlank)
  } else if(action == EditorAction.resetBack) {
    backPageData.value = duplicate(pageDataBlank)
  } else if(action == EditorAction.copyFront || action == EditorAction.copyBack) {
    const front = (action == EditorAction.copyFront);
    const pageData = ( front ? frontPageData.value : backPageData.value)
    const which = (front ? 'Front' : 'Back')
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    showToast( getToastData('Clear',which + ' page copied to clipboard'))
  } else if(action == EditorAction.pasteBack || action == EditorAction.pasteFront) {
    readPageFromClipboard().then( page => {
        if( action == EditorAction.pasteBack) {
          backPageData.value = page;
        } else {
          frontPageData.value = page;
        }
    }).catch( e => {
        showToast(getToastData('Cannot Paste', e, toastError))
    }) 
  } else {
    reportError('[App.oneditorAction] unknown action ' + action)
  }
  // update active sheet with new values
  activeSheet.value.data = [frontPageData.value, backPageData.value];
  saveActiveSheet(true)

}

/**
 * Copy all left tiles from left to right
 */
function onMenuEditor() {
  if(!showEditor.value && sheetModified.value) {
    showToast( getToastData('Editing Modified Page','Save your page before editing to undo potential mistakes', toastWarning, 5000))
  }
  showEditor.value = !showEditor.value;
}

function onMenuLoad(sheet) {
  // console.log('[App.onMenuLoad]', JSON.stringify(sheet))
  if(sheet && sheet.data) {
    loadSheet(sheet)
    saveActiveSheet(false)
  } else {
    console.log('[App.onMenuLoad] could not load', JSON.stringify(sheet))
  }
}

function onMenuSave(sheet) {
  activeSheet.value = sheet;
  saveActiveSheet(false)
}

function onMenuToggle(value) {
  menuOpen.value = value
}

onMounted(async () => {
  // console.log('[App.onMounted]')
  try {
    // console.log( '[App.onMounted]', JSON.stringify(window.location.search))
    let urlParams = new URLSearchParams(window.location.search);
    if( urlParams.has('sheet')) {
      const sheetCode = urlParams.get('sheet')
      // console.log('[App.onMounted] sheet code', sheetCode)

      // TODO go get that sheet
      sheetGetByCode(sheetCode).then( sheet => {
        // console.log('[App.onMounted] sheet', JSON.stringify(sheet))
        // showToast('Fetch', 'Sheet found')
        if(sheet) {
          loadSheet(sheet)
        } else {
          showToast( getToastData( 'Load Sheet','Sheet Code not found ' + sheetCode, toastError))
          loadSheet(getSheetLocal())
        }
      }).catch(e => {
          showToast( getToastData( 'Load Sheet','Error fetching sheet ' + sheetCode, toastError))
          loadSheet(getSheetLocal())
      }) 
    } else {
      loadSheet(getSheetLocal())
    }
  } catch(e) {
    console.log('[App.onMounted] local data is corrupted', JSON.stringify(e))
    // revert to demo tiles
    loadSheet(getSheetDemoTiles())
    saveActiveSheet()
  }
  // Analytics
  inject();
})

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
  activeSheet.value.data[1] = pageData
  saveActiveSheet(true)
}

function onPageUpdateFront(pageData) {
  // console.log('[App.onPageUpdateFront]')
  frontPageData.value = pageData
  activeSheet.value.data[0] = pageData
  saveActiveSheet(true)
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

function saveActiveSheet(modified=false) {
  // console.log('[App.saveActiveSheet]', modified)
  localSheetSave(activeSheet.value, modified)
  sheetModified.value = modified
}

function showToast(data) {
  toast.add(data)
}
</script>

<template>
  <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
  <Toast />
  <div class="sheetName" v-show="showSheetName"
    :class="{'sheetNameOffset':menuOpen, 'sheetNameModified': sheetModified}">{{ getSheetName() }}</div>
  <div :class="{'twoPages':showPageOne && showPageTwo}">
    <Page :data="frontPageData" v-if="showPageOne" class="pageOne"
      @update="onPageUpdateFront" 
      @toast="toast.add" />
    <Page :data="backPageData" v-if="showPageTwo" class="pageTwo" :class="{flipMode:flipMode}"
      @update="onPageUpdateBack" 
      @toast="toast.add" />
  </div>
  <Editor v-if="showEditor" @action="onEditorAction" />
  <Menu class="menu" :pageData="activeSheet?activeSheet.data:null" v-show="showMenu"
    @howDoesItWork="showHowDoesItWork=true"
    @load="onMenuLoad" 
    @print="onPrint" @printOptions="onPrintOptions"
    @save="onMenuSave"
    @toast="toast.add" @toggle="onMenuToggle"
    >
  </Menu>
  <i class="pi pi-file-edit editorButton clickable" v-show="showMenu"
    @click="onMenuEditor" title="Toggle Page Editor"></i>
  <div class="versionDialog" v-show="showVersion">{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span>
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
.sheetName {
  position : absolute;
  font-size: 3rem;
  font-weight: 700;
  opacity: 0.1;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
}

.sheetNameOffset {
  top: 3rem;
}

.sheetNameModified {
  font-style: italic;
  color: orange;
  opacity: 0.4;
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
.menu {
  position: absolute;
  left:5px;
  top:5px;
}
.flipMode {
  transform: scale(-1,-1);
}
</style>
