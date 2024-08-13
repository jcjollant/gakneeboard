<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { inject } from "@vercel/analytics"
import Menu from './components/menu/Menu.vue'
import Page from './components/Page.vue'
import { duplicate, getBackend, keyUser, setCurrentUser, sheetGetByCode } from './assets/data.js'
import { backendVersion, version } from './assets/data.js'
import { getSheetDemoTiles, getSheetLocal, localSheetSave, normalizeSheetData } from './assets/sheetData'
import { getToastData, toastError } from './assets/toast'
import HowDoesItWork from './components/HowDoesItWork.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

const frontPageData = ref(null)
const backPageData = ref(null)
const activeSheet = ref(null)
const sheetModified = ref(false)

const flipMode = ref(false)
const keyHowDoesItWork = 'howDoesItWork'
const showHowDoesItWork = ref(true)
const toast = useToast()
const versionVisible = ref(true)
const menuVisible = ref(true)
const menuOpen = ref(false)
const sheetNameVisible = ref(true)
const pageOneVisible = ref(true)
const pageTwoVisible = ref(true)
const versionText = ref('')

function doPrint() {
  return new Promise( resolve => {
    window.print();
    // then bring everythign back to normal
    flipMode.value = false;
    versionVisible.value = true;
    menuVisible.value = true
    sheetNameVisible.value = true;
    pageOneVisible.value = true;
    pageTwoVisible.value = true;
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

onBeforeMount(()=>{
  // console.log('[App.onBeforeMount]')
  getBackend().then(() => {
    versionText.value = version + '/' + backendVersion
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

function onMaintenanceDialog() {
  showToast( getToastData("Maintenance", "Window"))
}

/**
 * Copy all left tiles from left to right
 */
function onMenuCopy() {
  // console.log('[App.onMenuCopy]')
  backPageData.value = duplicate(frontPageData.value)
  activeSheet.value.data = [frontPageData.value, backPageData.value];
  saveActiveSheet(true)
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
  console.log('[App.onPrint]', JSON.stringify(options))
  if( options) {
    flipMode.value = options.flipBack;
    versionVisible.value = options.showVersion
    pageOneVisible.value = options.showFront;
    pageTwoVisible.value = options.showBack;

    // these don't change
    sheetNameVisible.value = false
    menuVisible.value = false
  }

  // print window content after a short timeout to let flipmode kickin
  setTimeout(doPrint, 500);
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
  <div class="sheetName" v-show="sheetNameVisible"
    :class="{'sheetNameOffset':menuOpen, 'sheetNameModified': sheetModified}">{{ getSheetName() }}</div>
  <div :class="{'twoPages':pageOneVisible && pageTwoVisible}">
    <Page :data="frontPageData" v-if="pageOneVisible" class="pageOne"
      @update="onPageUpdateFront" 
      @toast="showToast" />
    <Page :data="backPageData" v-if="pageTwoVisible" class="pageTwo" :class="{flipMode:flipMode}"
      @update="onPageUpdateBack" 
      @toast="showToast" />
  </div>
  <div class="menuContainer">
    <Menu class="menu" :pageData="activeSheet?activeSheet.data:null" v-show="menuVisible"
      @load="onMenuLoad" 
      @print="onPrint"
      @copy="onMenuCopy"
      @howDoesItWork="showHowDoesItWork=true"
      @save="onMenuSave"
      @toast="showToast" @toggle="onMenuToggle"
      >
    </Menu>
  </div>
  <div class="versionDialog" v-show="versionVisible">{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span>
  </div>
  
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.sheetName {
  position : absolute;
  font-size: 3rem;
  font-weight: 700;
  opacity: 0.1;
  width: 1050px;
  top:0;
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
