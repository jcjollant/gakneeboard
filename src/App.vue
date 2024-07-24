<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { inject } from "@vercel/analytics"
import Menu from './components/menu/Menu.vue'
import Widget from './components/Tile.vue'
import { getDemoSheet, version } from './assets/data.js'
import { setCurrentUser, sheetNameLocal} from './assets/data.js'
import HowDoesItWork from './components/HowDoesItWork.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

const pageData = ref(null)
const widget0 = ref({})
const widget1 = ref({})
const widget2 = ref({})
const widget3 = ref({})
const widget4 = ref({})
const widget5 = ref({})
const widget6 = ref({})
const widget7 = ref({})
const widget8 = ref({})
const widget9 = ref({})
const widget10 = ref({})
const widget11 = ref({})
const widgetsOne = [widget0,widget1,widget2,widget3,widget4,widget5]
const widgetsTwo = [widget6,widget7,widget8,widget9,widget10,widget11]
const allWidgets = widgetsOne.concat(widgetsTwo)

const flipMode = ref(false)
const keyUser = 'kb-user'
const keyHowDoesItWork = 'howDoesItWork'
const showHowDoesItWork = ref(true)
const toast = useToast()
const versionVisible = ref(true)

// update all widgets with provided data
function loadSheetData(data) {
  // console.log( '[App.loadSheetData]', typeof data, JSON.stringify(data))

  // if we don't know what to show, we load a copy of the demo page
  if( !data) data = getDemoSheet();
  if( typeof data == 'string') data = JSON.parse(data)

  // assigns their values to all widgets
  allWidgets.forEach((widget, index) => {
      widget.value = data[index];
  });
  pageData.value = data;
}

function onAuthentication(user) {
  // console.log('[App.onAuthentication] user', JSON.stringify(user))
  if( user) {
    localStorage.setItem(keyUser,JSON.stringify(user))
    showToastSuccess('Clear','Welcome ' + user.name)
  } else {
    localStorage.removeItem(keyUser)
    // reload the page
    location.reload()
  }
}

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  localStorage.setItem(keyHowDoesItWork, "false")
}

onBeforeMount(()=>{
  // activate the last known user
  const user = JSON.parse(localStorage.getItem(keyUser))
  if( user) setCurrentUser( user, true)

  // How does it work popup check
  if( localStorage.getItem( keyHowDoesItWork) == 'false') {
    showHowDoesItWork.value = false;
  }
})

/**
 * Copy all left tiles from left to right
 */
function onMenuCopy() {
  // console.log('[App.onMenuCopy]', JSON.stringify(pageData.value))
  const newPageData = pageData.value;
  const list = [{from:0,to:6},{from:1,to:7},{from:2,to:8},{from:3,to:9},{from:4,to:10},{from:5,to:11}]
  for(const entry of list) {
    newPageData[entry.to].name = newPageData[entry.from].name 
    newPageData[entry.to].data = newPageData[entry.from].data
  }
  loadSheetData(newPageData)
  saveSheetData()
}

function onMenuLoad(sheet) {
  // console.log('[App.onMenuLoad]', JSON.stringify(sheet))
  if(sheet && sheet.data) {
    loadSheetData(sheet.data)
    saveSheetData()
  } else {
    console.log('[App.onMenuLoad] could not load', JSON.stringify(sheet))
  }
}

onMounted(() => {
  try {
    let data = JSON.parse(localStorage.getItem(sheetNameLocal))
    loadSheetData(data)
  } catch(e) {
    console.log('[App.onMounted] local data is corrupted')
    loadSheetData(null)
    saveSheetData()
  }
  // Analytics
  inject();
})

function onPrint(options) {
  //  console.log('[App.onPrint]', JSON.stringify(options))
  if( options) {
    flipMode.value = options.includes('flip')
    versionVisible.value = !options.includes('version')
  }

  // print window content after a short timeout to let flipmode kickin
  setTimeout(() => {
    window.print()
    flipMode.value = false;
    versionVisible.value = true;
  }, 300);
}

/**
 * Some widget data has been updated, we want to save this at least locally
 * @param {*} newWidgetData 
 */
 function onWidgetUpdated(newWidgetData) {
  // console.log('App : Tile updated with ' + JSON.stringify(newWidgetData))
  pageData.value[newWidgetData.id] = newWidgetData;
  saveSheetData();
}

// save page data if it's page 1 or 2
function saveSheetData() {
  localStorage.setItem(sheetNameLocal, JSON.stringify( pageData.value))
}

function showToastSuccess( summary, detail) {
  toast.add({ severity: 'success', summary: summary, detail: detail, life: 2500});  
}

</script>

<template>
  <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
  <Toast />
  <div class="twoPages">
    <div class="pageOne">
      <Widget v-for='widget in widgetsOne' :widget="widget.value" @update="onWidgetUpdated"/>
    </div>
    <div class="pageTwo" :class="{flipMode: flipMode}">
      <Widget v-for='widget in widgetsTwo' :widget="widget.value" @update="onWidgetUpdated"/>
    </div>
  </div>
  <div class="menuContainer">
    <Menu class="menu" :pageData="pageData"
      @authentication="onAuthentication"
      @load="onMenuLoad" 
      @print="onPrint"
      @copy="onMenuCopy"
      @howDoesItWork="showHowDoesItWork=true"
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
.pageOne, .pageTwo {
  display: grid;
  grid-template-columns: auto auto;
  gap: 5px;
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
