<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { inject } from "@vercel/analytics"
import Menu from './components/menu/Menu.vue'
import Page from './components/Page.vue'
import { version, setCurrentUser, keyUser } from './assets/data.js'
import { getSheetDemoTiles, normalizeSheetData, sheetNameLocal } from './assets/sheetData'
import HowDoesItWork from './components/HowDoesItWork.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

const frontPageData = ref(null)
const backPageData = ref(null)
const sheetData = ref(null)

const flipMode = ref(false)
const keyHowDoesItWork = 'howDoesItWork'
const showHowDoesItWork = ref(true)
const toast = useToast()
const versionVisible = ref(true)
const menuVisible = ref(true)

// update all widgets with provided data
function loadSheetData(data) {
  // console.log( '[App.loadSheetData]', typeof data, JSON.stringify(data))

  // if we don't know what to show, we load a copy of the demo page
  if( !data) {
    const demoSheet = getSheetDemoTiles();
    data = demoSheet.data;
  }
  data = normalizeSheetData(data)

  if( data.length == 2){
    frontPageData.value = data[0]
    backPageData.value = data[1]
  } else {
    console.log('[App.loadSheetData] unexpected data length', data.length)
    frontPageData.value = null
    backPageData.value = null
  }
  sheetData.value = [frontPageData.value, backPageData.value]
}

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  localStorage.setItem(keyHowDoesItWork, "false")
}

onBeforeMount(()=>{
  // console.log('[App.onBeforeMount]')
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

/**
 * Copy all left tiles from left to right
 */
function onMenuCopy() {
  // console.log('[App.onMenuCopy]')
  backPageData.value = frontPageData.value
  sheetData.value = [frontPageData.value, backPageData.value];
  saveSheet()
}

function onMenuLoad(sheet) {
  // console.log('[App.onMenuLoad]', JSON.stringify(sheet))
  if(sheet && sheet.data) {
    loadSheetData(sheet.data)
    saveSheet()
  } else {
    console.log('[App.onMenuLoad] could not load', JSON.stringify(sheet))
  }
}

onMounted(() => {
  // console.log('[App.onMounted]')
  try {

    let data = JSON.parse(localStorage.getItem(sheetNameLocal))
    loadSheetData(data)
  } catch(e) {
    console.log('[App.onMounted] local data is corrupted')
    loadSheetData(null)
    saveSheet()
  }
  // Analytics
  inject();
})

function onPrint(options) {
  //  console.log('[App.onPrint]', JSON.stringify(options))
  if( options) {
    flipMode.value = options.includes('flip')
    versionVisible.value = !options.includes('version')
    menuVisible.value = false
  }

  // print window content after a short timeout to let flipmode kickin
  setTimeout(() => {
    window.print()
    flipMode.value = false;
    versionVisible.value = true;
    menuVisible.value = true
  }, 300);
}

function onPageUpdateBack( pageData) {
  // console.log('[App.onPageUpdateBack]', JSON.stringify(pageData))
  backPageData.value = pageData;
  sheetData.value[1] = pageData
  saveSheet()

}

function onPageUpdateFront(pageData) {
  frontPageData.value = pageData
  sheetData.value[0] = pageData
  saveSheet()
}

// Save sheet data to browser
function saveSheet() {
  // const sheetData = [frontPageData.value, backPageData.value]
  localStorage.setItem(sheetNameLocal, JSON.stringify( sheetData.value))
}

function showToast(data) {
  toast.add(data)
}

function showToastSuccess( summary, detail) {
  showToast({ severity: 'success', summary: summary, detail: detail, life: 2500});  
}

</script>

<template>
  <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
  <Toast />
  <div class="twoPages">
    <Page :data="frontPageData" @update="onPageUpdateFront" @toast="showToast" class="pageOne"/>
    <Page :data="backPageData" @update="onPageUpdateBack" @toast="showToast" class="pageTwo"/>
  </div>
  <div class="menuContainer">
    <Menu class="menu" :pageData="sheetData" v-show="menuVisible"
      @load="onMenuLoad" 
      @print="onPrint"
      @copy="onMenuCopy"
      @howDoesItWork="showHowDoesItWork=true"
      @toast="showToast"
      >
    </Menu>
  </div>
  <div class="versionDialog" v-show="versionVisible">{{ version }}</div>
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
.twoPages {
  display: grid;
  grid-template-columns: auto auto;
  gap: 80px;
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
