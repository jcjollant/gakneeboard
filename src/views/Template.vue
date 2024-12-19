<template>
  <div class="main">
    <Menu :name="getTemplateName()" @about="emits('about')" />
    <Editor v-if="showEditor" v-model="activeTemplate" :offset="offset"
      @discard="onEditorDiscard" 
      @offset="onOffset" 
      @save="onEditorSave" />

    <!-- <div class="sheetName"
      :class="{ 'sheetNameModified': templateModified}"
      :title="templateModified ? 'Template has been modified' : ''">
      <div>{{ getTemplateName() }}</div>
    </div> -->
    <div class="pageGroup" :class="{'editor':showEditor}" >
      <div class="templateMenu">
        <MenuButton id="btnEditor" v-if="!showEditor"
          icon="pen-to-square" title="Toggle Edit Tools" label="Show Tools" :active="showEditor"
          :class="{'editorButtonActive':showEditor}" class="editorButton" 
          @click="onEditor"/>
        <MenuButton id="btnPrint" icon="print" title="Print Template" label="Print"
          @click="onPrint"/>
        <MenuButton id="btnSave" icon="save" title="Save Template" label="Save"
          @click="onSave"/>
        <MenuButton id="btnExport" icon="file-export" title="Export Template" label="Export"
          @click="onSave"/>
      </div>
      <i class="pi pi-chevron-circle-left offsetButton" :class="{'noShow':(offset == 0)}"
        title="Previous Page" id="offsetPrev"
        @click="onOffset(offset - 1)"></i>
      <div v-if="activeTemplate" class="pageAll" :class="{'editor':showEditor}">
        <Page v-for="(data,index) in activeTemplate.data" 
          v-show="index >= offset"
          :data="data" :index="index" :class="'page'+index" :ver="activeTemplate.ver"
          @update="onPageUpdate" />
      </div>
      <i class="pi pi-chevron-circle-right offsetButton"  :class="{'noShow':(offset >= offsetLast)}"
        title="Next Page" id="offsetNext"
        @click="onOffset(offset + 1)"></i>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { duplicate, newCurrentUser } from '../assets/data.js'
import { getTemplateDemoTiles } from '../assets/sheetData.js'
import html2canvas from 'html2canvas'
import { LocalStore } from '../lib/LocalStore.ts'
import { TemplateData } from '../assets/TemplateData.ts'
import { Toaster } from '../assets/Toaster.ts'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'

// Components
import Editor from '../components/editor/Editor.vue'
import Menu from '../components/menu/Menu.vue'
import MenuButton from '../components/menu/MenuButton.vue'
import Page from '../components/page/Page.vue'

const activeTemplate = ref(null)
let cssPageGap = -1
let cssPageWidth = -1
const emits = defineEmits(['about','template'])
const confirm = useConfirm()
const offset = ref(0)
const offsetLast = ref(0)
const route = useRoute()
const showEditor = ref(false)
const singlePage = ref(false)
let templateBeforeEdit = null;
const templateModified = ref(false)
const toaster = new Toaster(useToast())

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
function loadTemplate(template=null,saveToLocalStorage=false) {
  // console.log( '[Template.loadTemplate]', typeof data, JSON.stringify(sheet))

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
  // console.log('[Template.loadTemplate] template version', JSON.stringify(template.ver))
  updateOffsets()

  // restore modified state
  templateModified.value = template.modified;
  // console.log('[Template.loadTemplate]', offset.value, offsetLast.value)

  // asynchronous localstorage maintenance
  setTimeout( async() => {
    return new Promise( async(resolve, reject) => {
      // save the template to local storage
      if(saveToLocalStorage) {
        saveTemplateToLocalStore(false)
      }
      resolve(true)
    })
  }, 1000)
}

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
  // Save template if we are logged in and template already has an Id
  // This is preventing unwanted saves of new pages and demos
  if(newCurrentUser.loggedIn && activeTemplate.value.id) {
    TemplateData.save(activeTemplate.value).then(t => {
        let message = 'Template "' + t.name + '" saved';
        toaster.success( 'Clear', message)
        saveTemplateToLocalStore(false,true);
      }).catch( e => {
        console.log('[Template.onEditorSave] error', e)
        saveTemplateToLocalStore(true,false);
      })
  } else {
    saveTemplateToLocalStore(true,false);
  }
}

// function onMenuLoad(template) {
//   // console.log('[Template.onMenuLoad]', JSON.stringify(sheet))

//   if(!template || !template.data) {
//     console.log('[Template.onMenuLoad] could not load', JSON.stringify(template))
//     return
//   }

//   const title = 'Load Template "' + template.name + '"'
//   if( templateModified.value) {
//     confirm.require({
//         message: 'Do you want to replace all pages in the current template?',
//         header: title,
//         rejectLabel: 'No',
//         acceptLabel: 'Yes, Replace',
//         accept: () => {
//           loadTemplate(template, true)
//         }
//       })
//   } else {
//     loadTemplate(template, true)
//   }
// }

async function onSave() {
  if( !newCurrentUser.loggedIn) {
    warnNoUser()
    return
  }
  try {
      // retreive data from active template
      template.data = activeTemplate.value.data;
      toaster.info( 'Say Request', 'Saving template ' + template.name)
      await TemplateData.save(template).then(t => {
        // console.log('[Menu.onTemplateSave]', JSON.stringify(t))
        let message = 'Template "' + t.name + '" saved';
        if(t.publish && t.code) {
          message += '\nShare code is ' + t.code
        }
        emits('save', t)
        toaster.success( 'Clear', message)
      })
  } catch( e) {
    console.log('[Menu.onTemplateSave]', e)
    toaster.error('Save Template','Could not save template "' + template.name + '"')
  }  
}

onMounted(() =>{
  // console.log('[Template.onMounted]')
  try {
    if(route.params.id && route.params.id > 0) {
      TemplateData.get(route.params.id).then( template => {
        if(template) {
          loadTemplate(template, true)
          emits('template',template)
        } else {
          toaster.error( 'Load Template','Invalid Template Id ' + route.params.id)
          // restore last template
          loadTemplate(LocalStore.getTemplate())
        }
      })
    } else { 
      // no template id => load local template
      loadTemplate(LocalStore.getTemplate())
    }
  } catch(e) {
    console.log('[Template.onMounted] failed loading template ' + e)
    // revert to demo tiles
    loadTemplate(getTemplateDemoTiles(), true)
  }


  // position the resize listener and invoke once
  window.addEventListener('resize', updateOffsets)
  updateOffsets()
  // window.addEventListener('afterprint', afterPrint)
})

onUnmounted(() => {
  // remove event listeners
  window.removeEventListener('resize', updateOffsets)
})


// Validate and assign new offset value
function onOffset(newOffset) {
  // console.log('[Template.onOffset]', newOffset, offsetLast.value)
  if(newOffset < 0 || newOffset > offsetLast.value){
    console.log('[Template.onOffset] invalid offset', newOffset)
    return;
  } 

  offset.value = newOffset;
  updateOffsets()
}

function onPageUpdate(pageData) {
  // console.log('[Template.onPageUpdate] index', pageData.index)
  // save template data without index
  activeTemplate.value.data[pageData.index] = {data:pageData.data,type:pageData.type}
  saveTemplateToLocalStore(true)
}

function saveTemplateToLocalStore(modified=false,updateThumbnail=false) {
  // console.log('[Template.saveActiveSheet]', modified)
  LocalStore.saveTemplate(activeTemplate.value, modified)
  templateModified.value = modified
  if(updateThumbnail) {
    updateThumbnail()
  }
}

function updateOffsets() {
  // console.log('[Template.onResize]', window.innerWidth)
  if(!activeTemplate.value) return;

  if( cssPageGap == -1) {
    const elt = getComputedStyle(document.body)
    // transform

    cssPageGap = parseInt(elt.getPropertyValue('--pages-gap'));
    cssPageWidth = parseInt(elt.getPropertyValue('--page-width'));
    // console.log('[Template.updateOffset] cssPageGap', cssPageGap)
  }

  // how many pages can fit in the new width?
  const pageFit = Math.floor((window.innerWidth - cssPageGap) / (cssPageWidth + cssPageGap))
  const pageCount = activeTemplate.value.data.length;
  // cssPageGap * (1 + numPages) +  cssPageWidth * numPages
  const maxOffset = Math.max(pageCount - pageFit, 0)
  // console.log('[Template.onResize] fitting', fittingPages, 'offsetLast', offsetLast.value)

  // adjust offset if we have blankspace
  if(offset.value > maxOffset) offset.value = maxOffset
  singlePage.value = pageFit == 1;
  offsetLast.value = maxOffset;
  // console.log('[Template.updateOffset] offsetLast', maxOffset)
}

function updateThumbnail() {
  // console.log('[Template.updateThumbnail]', activeTemplate.value?.id)
  if( activeTemplate.value && activeTemplate.value.id) {
    // Capture page 0 into an image
    html2canvas(document.querySelector(".page0")).then(canvas => {
      // scale image to fit the thummbnail
      const scaledCanvas = document.createElement('canvas')
      const scaleFactor = 0.5
      scaledCanvas.width = canvas.width * scaleFactor
      scaledCanvas.height = canvas.height * scaleFactor
      const scaledCtx = scaledCanvas.getContext('2d')
      scaledCtx.scale(scaleFactor, scaleFactor)
      scaledCtx.drawImage(canvas, 0, 0)
      const scaledImg = scaledCanvas.toDataURL('image/png')

      // actually save image
      LocalStore.thumbnailSave(activeTemplate.value.id, scaledImg)

      // trigger image download
      // const link = document.createElement('a')
      // link.download = 'thumbnail.png'
      // link.href = scaledImg
      // link.click()
    })
  }
}

</script>

<style scoped>

.main {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 1rem;
  min-height: 100vh;
}

.pageGroup {
  position: relative;
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

.templateMenu {
  position: absolute;
  left: var(--menu-border-offset);
  top: var(--menu-border-offset);
  display: flex;
  flex-flow: column;
  gap: var(--menu-border-offset)
}


.twoPages {
    display: flex;
    gap: var(--pages-gap);
}

.offsetButton {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
}

.sheetName {
  position : absolute;
  font-size: 2rem;
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

</style>
