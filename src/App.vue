<template>
  <div v-if="printPreview" @click="restorePrintOptions">
    <div v-if="activeTemplate">
      <div v-if="printSingles" v-for="(page,index) in activeTemplate.data" class="printOnePage printPageBreak">
        <div class="onePage">
          <Page :data="page"
            :class="{flipMode:(index % 2 == 1 && printFlipMode)}"/>
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in activePages">
        <Page :data="page.front" />
        <Page :data="page.back" :class="{flipMode:printFlipMode}" />
      </div>
    </div>
  </div>
  <div v-else class="main">
    <HowDoesItWork v-model:visible="showHowDoesItWork" @close="onCloseHowDoesItWork" />
    <Feedback v-model:visible="showFeedback"
      @close="showFeedback=false" @toast="toast.add" />

    <Editor v-if="showEditor" v-model="activeTemplate" :offset="offset"
      @discard="onEditorDiscard" 
      @offset="onOffset" 
      @save="onEditorSave" 
      @toast="toast.add"/>
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
        <Page v-for="(data,index) in activeTemplate.data" 
          v-show="index >= offset"
          :data="data" :index="index" :class="'page'+index"
          @update="onPageUpdate" @toast="toast.add" />
      </div>
      <i class="pi pi-chevron-circle-right offsetButton"  :class="{'noShow':(offset >= offsetLast)}"
        title="Next Page" id="offsetNext"
        @click="onOffset(offset + 1)"></i>
    </div>
    <MenuButton icon="comments" class="feedbackButton" label="Give Feedback"
      @click="showFeedback=true" />
    <MenuButton id="btnEditor" v-if="!showEditor"
      icon="pen-to-square" title="Toggle Editor Mode" label="Page Editor" :active="showEditor"
     :class="{'editorButtonActive':showEditor}" class="editorButton" 
      @click="onEditor"/>
    <div class="versionDialog" :title="'Frontend/Backend versions ' + versionText" >{{ versionText }}<span class="maintenanceDialog" v-show="true" @click="onMaintenanceDialog">&nbsp</span></div>
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
import { inject } from "@vercel/analytics"
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'

import { backend, duplicate, getBackend, newCurrentUser, postPrint, version } from './assets/data.js'
import { getTemplateDemoTiles } from './assets/sheetData'
import { TemplateData } from './assets/Templates'
import { getToastData, toastError } from './assets/toast'
import { LocalStore } from './lib/LocalStore.ts'

import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import Editor from './components/editor/Editor.vue'
import HowDoesItWork from './components/HowDoesItWork.vue'
import Feedback from './components/menu/Feedback.vue'
import Menu from './components/menu/Menu.vue'
import MenuButton from './components/menu/MenuButton.vue'
import Page from './components/page/Page.vue'


// const frontPageData = ref(null)
// const backPageData = ref(null)
const activeTemplate = ref(null)
const activePages = ref(null)
let cssPageGap = -1
let cssPageWidth = -1
const confirm = useConfirm()
const offset = ref(0)
const offsetLast = ref(0)
const templateModified = ref(false)
let templateBeforeEdit = null;

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
function loadTemplate(template=null,save=false) {
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
  updateOffsets()

  // restore modified state
  templateModified.value = template.modified;
  // console.log('[App.loadTemplate]', offset.value, offsetLast.value)

  // save the template to local storage
  if(save) {
    saveTemplateLocally(false)
  }
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

function onEditor() {
  templateBeforeEdit = duplicate(activeTemplate.value)
  showEditor.value = true;
}

function onEditorDiscard() {
  activeTemplate.value = templateBeforeEdit;
  showEditor.value = false;
}

function onEditorSave() {
  showEditor.value = false;
  if(newCurrentUser.loggedIn) {
    TemplateData.save(activeTemplate.value).then(t => {
        let message = 'Template "' + t.name + '" saved';
        showToast( getToastData( 'Clear', message))
        saveTemplateLocally(false);
      }).catch( e => {
        console.log('[App.onEditorSave] error', e)
        saveTemplateLocally(true);
      })
  } else {
    saveTemplateLocally(true);
  }
}

function onMenuLoad(template) {
  // console.log('[App.onMenuLoad]', JSON.stringify(sheet))

  if(!template || !template.data) {
    console.log('[App.onMenuLoad] could not load', JSON.stringify(template))
    return
  }

  const title = 'Load Template "' + template.name + '"'
  if( templateModified.value) {
    confirm.require({
        message: 'Do you want to replace all pages in the current template?',
        header: title,
        rejectLabel: 'No',
        acceptLabel: 'Yes, Replace',
        accept: () => {
          loadTemplate(template, true)
        }
      })
  } else {
    loadTemplate(template, true)
  }
}

function onMenuSave(template) {
  // console.log('[App.onMenuSave]', JSON.stringify(template))
  activeTemplate.value = template;
  saveTemplateLocally(false)
}

function onMenuToggle(value) {
  menuOpen.value = value
}

onMounted(async () => {
  // console.log('[App.onMounted]')
  try {
    // console.log( '[App.onMounted]', JSON.stringify(window.location.search))
    // Do we have anything to load from URL?
    let urlParams = new URLSearchParams(window.location.search);
    if( urlParams.has('sheet') || urlParams.has('t')) {
      const code = urlParams.has('t') ? urlParams.get('t') : urlParams.get('sheet')
      // console.log('[App.onMounted] sheet code', sheetCode)

      // Get that publication data
      TemplateData.getPublication(code).then( template => {
        // console.log('[App.onMounted] sheet', JSON.stringify(sheet))
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
    loadTemplate(getTemplateDemoTiles(), true)
  }


  // position the resize listener and invoke once
  window.addEventListener('resize', updateOffsets)
  updateOffsets()
  // window.addEventListener('afterprint', afterPrint)

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
  updateOffsets()
}

function onPageUpdate(pageData) {
  // console.log('[App.onPageUpdate] index', pageData.index)
  // save template data without index
  activeTemplate.value.data[pageData.index] = {data:pageData.data,type:pageData.type}
  saveTemplateLocally(true)
}

function onPrint(options) {
  // console.log('[App.onPrint]')
  onPrintPreview(true)
  printFlipMode.value = options.flipBackPage;
  printSingles.value = (options.pagePerSheet == 1)

  // These things don't change
  showEditor.value = false;
  showHowDoesItWork.value = false;

  // print window content after a short timeout to let flipmode kickin
  setTimeout( async () => {
    return new Promise( (res) => {
      postPrint(options)
      const preTime = new Date().getTime();
      window.print();
      const postTime = new Date().getTime();
      // on iOS, window.print returns immediately
      if(postTime - preTime > 500) { 
        restorePrintOptions();
      }
      res(true)
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
  if(show) {
    // build a list of neighbor pages, used for printing
    const pageList = []
    const templateData = activeTemplate.value.data
    for( let index = 0; index < templateData.length; index+=2) {
      const pages = {front:templateData[index], back:templateData[index+1]??null}
      pageList.push(pages)
    }
    activePages.value = pageList
  }
}

onUnmounted(() => {
  // remove event listeners
  window.removeEventListener('resize', updateOffsets)
})

function restorePrintOptions() {
    // Bring everything back to normal
    printPreview.value = false;
    printFlipMode.value = false;
    showEditor.value = false;
    showHowDoesItWork.value = false;
}

function saveTemplateLocally(modified=false) {
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

  if( cssPageGap == -1) {
    const elt = getComputedStyle(document.body)
    // transform

    cssPageGap = parseInt(elt.getPropertyValue('--pages-gap'));
    cssPageWidth = parseInt(elt.getPropertyValue('--page-width'));
    // console.log('[App.updateOffset] cssPageGap', cssPageGap)
  }

  // how many pages can fit in the new width?
  const pageFit = Math.floor((window.innerWidth - cssPageGap) / (cssPageWidth + cssPageGap))
  const pageCount = activeTemplate.value.data.length;
  // cssPageGap * (1 + numPages) +  cssPageWidth * numPages
  const maxOffset = Math.max(pageCount - pageFit, 0)
  // console.log('[App.onResize] fitting', fittingPages, 'offsetLast', offsetLast.value)

  // adjust offset if we have blankspace
  if(offset.value > maxOffset) offset.value = maxOffset
  singlePage.value = pageFit == 1;
  offsetLast.value = maxOffset;
  // console.log('[App.updateOffset] offsetLast', maxOffset)
}

</script>

<style scoped>
.editorButton {
  position: fixed;
  right: var(--menu-border-offset);;
  top: var(--menu-border-offset);;
}

.feedbackButton {
  position: fixed;
  left: var(--menu-border-offset);;
  bottom: var(--menu-border-offset);;
}

.main {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 100vh;
}

.pageGroup {
  display: grid;
  grid-template-columns: var(--pages-gap) 1fr var(--pages-gap);
  align-items: center;
  width: 100%;
}

.pageAll {
  display: flex;
  gap: var(--pages-gap);
  flex-wrap: wrap;
  height: var(--page-height);
  justify-content: center;
  overflow: hidden;
}

.printOnePage {
  display: flex;
  width: 100%;
  justify-content: center;
}
.printTwoPages {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 var(--pages-gap);
  width: fit-content;
}
.twoPages {
    display: flex;
    gap: var(--pages-gap);
}

.onePage {
  display:flex;
  justify-content: center;
}
.offsetButton {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
}
.menu {
  position: fixed;
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
  opacity: 0.3;
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

.versionDialog {
  position: fixed;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  margin:auto;
  color: darkslategrey;
}

</style>
