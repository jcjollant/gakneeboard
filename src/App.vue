<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Menu from './components/menu/Menu.vue'
import Widget from './components/Tile.vue'
import { onBeforeMount, onMounted,ref} from 'vue'
import { getDemoSheet, getBlankSheet, version, saveCustomSheet } from './assets/data.js'
import { inject } from "@vercel/analytics"
import { setCurrentUser, sheetNameDemo, sheetNameReset, sheetNameLocal} from './assets/data.js'
import HowDoesItWork from './components/HowDoesItWork.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';


var pageData = null;
const currentPage = ref('page1')
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
const printMode = ref(false)
const keyUser = 'kb-user'
const keyHowDoesItWork = 'howDoesItWork'
const showHowDoesItWork = ref(true)
const toast = useToast()

// update all widgets with provided data
async function loadSheetData(data) {
  // console.log( 'App loadPageData ' + JSON.stringify(data))

  // if we don't know what to show, we load a copy of the demo page
  if( data == null) data = getDemoSheet();

  // assigns their values to all widgets
  allWidgets.forEach((widget, index) => {
      widget.value = data[index];
  });
  pageData = data;
  // savePageData();
}

function onAuthentication(user) {
  // console.log('[App.onAuthentication] ' + JSON.stringify(user))
  if( user) {
    localStorage.setItem(keyUser,JSON.stringify(user))
    toast.add({ severity: 'success', summary: 'Clear', detail: 'Welcome ' + user.name, life: 3000});  
  } else {
    localStorage.removeItem(keyUser)
  }

  // reload the page
  location.reload
}

function onCloseHowDoesItWork() {
  showHowDoesItWork.value =  false
  localStorage.setItem(keyHowDoesItWork, "false")
}

onBeforeMount(()=>{
  // activate the last known user
  setCurrentUser( JSON.parse(localStorage.getItem(keyUser)))
  if( localStorage.getItem( keyHowDoesItWork) == 'false') {
    showHowDoesItWork.value = false;
  }
})

function onMenuLoadSheet(name) {
  // console.log('onLoadPage ' + JSON.stringify(name))
  // page 1 and page 2 come from localstorage
  if( name=='page1' || name==sheetNameLocal) {
    currentPage.value = name;
    let data = localStorage.getItem(name);
    if( data && data != 'undefined') { // first time around
      loadSheetData( JSON.parse(data))
    } else {
      loadSheetData( getDemoSheet())
    }
  } else if( name==sheetNameDemo) {
    loadSheetData( getDemoSheet())
    savePageData()
  } else if( name==sheetNameReset) {
    loadSheetData( getBlankSheet())
    savePageData()
  } else {
    console.log('unknown sheet ' + name)
  }
}

async function onMenuSaveSheet(name) {
  await saveCustomSheet(name, pageData).then(() => {
    toast.add({ severity: 'success', summary: 'Roger', detail: 'Sheet "' + name + '" saved successfully', life: 3000});  
  }).catch((e) => {
    toast.add({ severity: 'error', summary: 'Save Page', detail: 'Could not save sheet "' + name + '"', life: 3000});  
  })
}

onMounted(() => {
  onMenuLoadSheet(currentPage.value)
  // Analytics
  inject();
  // console.log( Object.keys(airports).join(', ').toUpperCase());
})

// save page data if it's page 1 or 2
function savePageData() {
  localStorage.setItem(currentPage.value, JSON.stringify( pageData))
}

function updateWidget(newWidgetData) {
  // console.log('App : Tile updated with ' + JSON.stringify(newWidgetData))
  pageData[newWidgetData.id] = newWidgetData;
  savePageData();
}

</script>

<template>
  <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
  <Toast />
  <div class="twoPages">
    <div class="onePage">
      <Widget v-for='widget in widgetsOne' :widget="widget.value" @update="updateWidget"/>
    </div>
    <div class="onePage" :class="{flipMode: printMode}">
      <Widget v-for='widget in widgetsTwo' :widget="widget.value" @update="updateWidget"/>
    </div>
  </div>
  <div class="menuContainer">
    <Menu class="menu" :page="currentPage"
      @authentication="onAuthentication"
      @load-page="onMenuLoadSheet" 
      @save-page="onMenuSaveSheet"
      @print="printMode=!printMode"
      @howDoesItWork="showHowDoesItWork=true"
      >
    </Menu>
  </div>
  <div class="versionDialog">{{ version }}</div>
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
.onePage {
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
