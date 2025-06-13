<template>
  <div class="main">
    <Menu :name="getTemplateName()"></Menu>
    <TemplateExport v-model:visible="showExport" :template="activeTemplate"
      @close="showExport=false" @export="onExported" />
    <TemplateSettings v-model:visible="showSettings" :template="activeTemplate"
      @close="showSettings=false" @save="onSettings" />
    <div class="navigationButtons">
      <i class="pi pi-chevron-circle-left offsetButton" :class="{'disabled':(offset == 0)}"
        title="Previous Page" id="offsetPrev"
        @click="onOffset(offset - 1)"></i>
      <i class="pi pi-chevron-circle-right offsetButton" :class="{'disabled':(offset >= offsetLast)}"
        title="Next Page" id="offsetNext"
        @click="onOffset(offset + 1)"></i>
    </div>
    <Editor v-if="showEditor" v-model="activeTemplate" :offset="offset"
      @offset="onOffset" @update="onPageUpdate" />
    <div class="pageGroup" :class="{'editor':showEditor}" >
      <div class="templateMenu">
        <MenuButton id="btnPrint" icon="print" title="Print Template" label="Print"
          @click="onPrint"/>
        <MenuButton id="btnSave" icon="save" title="Save Template to the Cloud" label="Save"  :disabled="activeTemplate.isInvalid()"
          @click="onSave"/>
        <MenuButton id="btnEditor"
          icon="screwdriver-wrench" title="Toggle Edit Tools" label="Editor Tools" :active="showEditor"
          :class="{'editorButtonActive':showEditor}" class="editorButton" 
          @click="onEditor"/>
        <MenuButton id="btnExport" icon="file-export" title="Export Template to Various Formats" label="Export"
          @click="onExport"/>
        <MenuButton id="btnSettings" icon="gear" title="Template Name and Description" label="Settings"
          @click="showSettings=true"/>
        <MenuButton id="btnDelete" icon="trash" title="Delete Template" label="Delete" :danger="true" :disabled="activeTemplate.isInvalid()"
          @click="onDelete"/>
      </div>
      <div v-if="activeTemplate" class="pageAll" :class="{'editor':showEditor}">
        <Page v-for="(data,index) in activeTemplate.data" 
          v-show="index >= offset" :data="data" :class="'page'+index" :ver="activeTemplate.ver"
          @update="onPageUpdate(index, $event)" />
      </div>
      <div v-else class="pageAll">
        <LoadingPage></LoadingPage>
        <LoadingPage></LoadingPage>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentUser } from '../assets/data.js'
import { DemoData } from '../assets/DemoData.ts'
import { LocalStore } from '../lib/LocalStore.ts'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterNames } from '../router/index.js'
import { Template, TemplatePage } from '../model/Template'
import { TemplateData } from '../assets/TemplateData.ts'
import { useConfirm } from 'primevue/useconfirm'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../assets/Toaster.ts'

// Components
import html2canvas from 'html2canvas'
import Editor from '../components/editor/Editor.vue'
import Menu from '../components/menu/Menu.vue'
import MenuButton from '../components/menu/MenuButton.vue'
import LoadingPage from '../components/page/LoadingPage.vue'
import Page from '../components/page/Page.vue'
import TemplateExport from '../components/templates/TemplateExport.vue'
import TemplateSettings from '../components/templates/TemplateSettings.vue'
import { computeSHA256 } from '../assets/Sha.ts'

const noTemplate = Template.noTemplate()
const activeTemplate = ref(noTemplate)
let cssPageGap = -1
let cssPageWidth = -1
const emits = defineEmits(['about','template'])
const confirm = useConfirm()
const offset = ref(0)
const offsetLast = ref(0)
const route = useRoute()
const router = useRouter()
const showEditor = ref(false)
const showExport = ref(false)
const showSettings = ref(false)
const singlePage = ref(false)
const templateModified = ref(false)
const toast = useToast()
const toaster = useToaster(toast)

onMounted(() =>{
  // console.log('[TemplateViewer.onMounted]')
  try {
    const templateId = Number(route.params.id) || 0
    if(templateId) {
      // Create a temporary template with a matching number of pages
      const userTemplate = currentUser.templates.find( t => t.id == templateId)
      const temporaryTemplate = Template.noTemplate(userTemplate ? userTemplate.pages : 2);
      activeTemplate.value = temporaryTemplate;

      TemplateData.get(templateId).then( template => {
        if(template.id) {
          loadTemplate(template, true)
          emits('template',template)
        } else {
          toaster.error( 'Load Template','Invalid Template Id ' + route.params.id)
          // restore last template
          loadTemplate(LocalStore.getTemplate())
        }
      }).catch( (err) => {
          toaster.error( 'Load Template','Could not reach server')
      })
    } else { 
      // no template id => load local template
      loadTemplate(LocalStore.getTemplate())
    }
  } catch(e) {
    console.log('[TemplateViewer.onMounted] failed loading template ' + e)
    // revert to demo tiles
    loadTemplate(DemoData.tiles(), true)
  }


  // position the resize listener and invoke once
  window.addEventListener('resize', updateOffsets)
  updateOffsets()
  // window.addEventListener('afterprint', afterPrint)
  window.onbeforeprint = () => {
    if(route.name != RouterNames.Print) {
      confirm.require({
          message: "Please use the \"Print\" button to access print settings and layout selection.",
          header: "Print Template",
          rejectLabel: 'Do Not Print',
          acceptLabel: "Open Print Template",
          accept: () => {
            router.push('/print')
          }
        })

      // console.log('[TemplateViewer.onBeforePrint]')
    }
  }
})

onUnmounted(() => {
  // remove event listeners
  window.removeEventListener('resize', updateOffsets)
})

function getTemplateName() {
  let name = ''
  if( !activeTemplate.value.name) {
    name = 'New Template'
  } else {
    name = activeTemplate.value.name
  } 
  if( templateModified.value) name += '*'
  return name;
}

// update all widgets with provided data
function loadTemplate(template:Template,saveToLocalStorage:boolean=false) {
  // console.log( '[TemplateViewer.loadTemplate]', template)

  // if we don't know what to show, we load a copy of the demo page
  if( template.isInvalid()) {
    template = DemoData.tiles();
  }

  // make sure data is at the latest format
  const data = TemplateData.normalize(template.data)

  // we are on the first page and last page is calculated based on number of pages
  offset.value = 0
  template.data = data

  activeTemplate.value = template;
  // console.log('[TemplateViewer.loadTemplate] template version', JSON.stringify(template.ver))
  updateOffsets()
  
  // Update the browser tab title with the template name
  document.title = template.name ? template.name : 'New Template';

  // console.log('[TemplateViewer.loadTemplate]', offset.value, offsetLast.value)

  // asynchronous localstorage maintenance
  setTimeout( async() => {
    return new Promise( async(resolve, reject) => {
      // save the template to local storage
      if(saveToLocalStorage) {
        saveTemplateToLocalStore()
      }
      updateThumbnail(template)
      resolve()
    })
  }, 1000)
}

function onDelete() {
  if(activeTemplate.value.isInvalid()) return;

  // if the template is new there is nothing to delete
  if(!activeTemplate.value.id) {
    router.push('/')
    return;
  }
  const name = activeTemplate.value.name
  confirm.require({
      message: 'Do you want to delete "' + name +'"',
      header: "Delete Template",
      rejectLabel: 'No',
      acceptLabel: "Yes, Delete",
      accept: async () => {
        toaster.info( 'Calling Tower', 'Requesting deletion of ' + name)
        await TemplateData.delete(activeTemplate.value).then( () => {
          // go back to home page
          router.push('/')
          // and give visual feedback
          toaster.success( 'Clear', 'Template "' + name + '" deleted')
        })
      }
    })

}

function onEditor() {
  if( !currentUser.loggedIn) {
    toaster.warning('Squawk and Ident','Please sign in to use the editor')
    return
  }

  showEditor.value = !showEditor.value;
}

function onExport() {
  if(activeTemplate.value.id == 0) {
    toaster.warning('Line up and Wait','Please save your template before exporting')
    return
  }
  showExport.value=true  
}

function onExported(format:any) {
  showExport.value = false;
  toaster.info( 'Exporting', activeTemplate.value.name)
  TemplateData.export(activeTemplate.value, format).then( eo => {
    // create file link in browser's memory
    // console.log('[TemplateViewer.onExported] blob', eo.blob.size)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(eo.blob)
    link.download = eo.filename
    link.click()
    URL.revokeObjectURL(link.href)
  }).catch( e => {
    console.log('[Menu.onExportExported] failed ' + e)
    toaster.error( 'Export Error', e.message)
  })  
}

// Validate and assign new offset value
function onOffset(newOffset:number) {
  // console.log('[TemplateViewer.onOffset]', newOffset, offsetLast.value)
  if(newOffset < 0 || newOffset > offsetLast.value){
    // console.log('[TemplateViewer.onOffset] invalid offset', newOffset)
    return;
  } 

  offset.value = newOffset;
  updateOffsets()
}

function onPageUpdate(index:number, pageData:TemplatePage) {
  // console.log('[TemplateViewer.onPageUpdate]', index, pageData)
  templateModified.value = true

  // save template data for that page
  activeTemplate.value.data[index] = pageData

  // save template locally
  saveTemplateToLocalStore()
}


function onPrint() {
  if( !currentUser.loggedIn) {
    toaster.warning('Squawk and Ident','Please sign in before printing')
    return
  }

  // if( templateModified.value) {
  //   toaster.warning('Line up and Wait', 'Please save your template before printing')
  //   return
  // }

  // go to print mode
  const printTemplateId = activeTemplate.value?.id || 0
  // Only pass templateModified if the template has an ID
  const isModified = activeTemplate.value?.id > 0 && templateModified.value
  router.push({
    path: '/print/' + printTemplateId,
    query: { modified: isModified ? '1' : '0' }
  })
}

async function onSave() {
  if( activeTemplate.value.isInvalid()) return;

  if( !currentUser.loggedIn) {
    toaster.warning('Squawk and Ident','Please sign in to use custom templates')
    return
  }
  // give page time to update the thumbnail
  setTimeout( () => updateThumbnail(activeTemplate.value), 1000)
  try {
      // retrieve data from active template
      toaster.info( 'Say Request', 'Saving template ' + activeTemplate.value.name, 4000)
      TemplateData.save(activeTemplate.value).then(ts => {
        // console.log('[TemplateViewer.onSave]', activeTemplate.value.id, JSON.stringify(t))
        const t = ts.template
        let message = 'Template "' + t.name + '" saved';
        if(t.publish && t.code) {
          message += '\nShare code is ' + t.code
        }
        toast.removeAllGroups()
        toaster.success( 'Clear', message)
        if(ts.code == 202) {
          toaster.warning('Max Templates', 'You have reached your template maximum. Please consider upgrading promptly', 6000)
        }
        // update version number
        activeTemplate.value.ver = t.ver
        // update code
        activeTemplate.value.code = t.code

        // mark the template as not modified anymore
        templateModified.value = false

        // did we just get an id?
        if(!activeTemplate.value.id) {
          activeTemplate.value.id = t.id
          router.push('/template/' + t.id)
        }
      }).catch( e => {
        toaster.error( 'Could not save', e, 6000)
      })
  } catch( e) {
    // console.log('[Menu.onTemplateSave]', e)
    toaster.error('Save Template','Could not save template "' + activeTemplate.value?.name + '"')
  }  
}

function onSettings(settings) {
  // console.log('[TemplateViewer.onSettings]', settings)
  showSettings.value = false;
  if( activeTemplate.value.name != settings.name 
    || activeTemplate.value.desc != settings.desc 
    || activeTemplate.value.publish != settings.publish) {
    activeTemplate.value.name = settings.name
    activeTemplate.value.desc = settings.desc
    activeTemplate.value.publish = settings.publish
    // We consider the template as modified if it's a cloud template
    templateModified.value = activeTemplate.value.id > 0
    saveTemplateToLocalStore()
    // save template if relevant
    if(currentUser.loggedIn && activeTemplate.value.id ) onSave()
  }
}

function saveTemplateToLocalStore() {
  // console.log('[TemplateViewer.saveTemplateToLocaStore]', thumbnail)
  LocalStore.saveTemplate(activeTemplate.value)
}

function updateOffsets() {
  // console.log('[TemplateViewer.onResize]', window.innerWidth)
  if(activeTemplate.value.isInvalid()) return;

  if( cssPageGap == -1) {
    const elt = getComputedStyle(document.body)
    // transform

    cssPageGap = parseInt(elt.getPropertyValue('--pages-gap'));
    cssPageWidth = parseInt(elt.getPropertyValue('--page-width'));
    // console.log('[TemplateViewer.updateOffset] cssPageGap', cssPageGap)
  }

  // how many pages can fit in the new width?
  const pageFit = Math.floor((window.innerWidth - cssPageGap) / (cssPageWidth + cssPageGap))
  const pageCount = activeTemplate.value.data.length;
  // cssPageGap * (1 + numPages) +  cssPageWidth * numPages
  const maxOffset = Math.max(pageCount - pageFit, 0)
  // console.log('[TemplateViewer.onResize] fitting', fittingPages, 'offsetLast', offsetLast.value)

  // adjust offset if we have blankspace
  if(offset.value > maxOffset) offset.value = maxOffset
  singlePage.value = pageFit == 1;
  offsetLast.value = maxOffset;
  // console.log('[TemplateViewer.updateOffset] offsetLast', maxOffset)
}

function updateThumbnail(template:Template) {
  // console.log('[TemplateViewer.updateThumbnail] template', template.id, template.thumb)
  // console.log('[TemplateViewer.updateThumbnail]', activeTemplate.value?.id)
  if(template.id <= 0 || activeTemplate.value.isInvalid() || !currentUser.loggedIn) {
    // console.log('[TemplateViewer.updateThumbnail] not ready to save')
    return;
  }
  const index = template.id
  const element:HTMLElement|null = document.querySelector(".page0")
  if(element == null) return;

  // Capture page 0 into an image
  html2canvas(element).then( async (canvas) => {
    // scale image to fit the thumbnail
    const scaledCanvas = document.createElement('canvas')
    const scaleFactor = 200 / canvas.width;
    scaledCanvas.width = canvas.width * scaleFactor
    scaledCanvas.height = canvas.height * scaleFactor
    const scaledCtx = scaledCanvas.getContext('2d')
    if(scaledCtx == null) return
    scaledCtx.scale(scaleFactor, scaleFactor)
    scaledCtx.drawImage(canvas, 0, 0)
    scaledCanvas.toBlob( async (blob) => {
      // push thumbnail image to backend
      if(blob == null) return
      const sha256 = await computeSHA256(blob)
      if(sha256 != template.thumbHash) {
        // console.log('[TemplateViewer.updateThumbnail] sha256', sha256, template.thumbHash)
        activeTemplate.value.thumbUrl = await TemplateData.updateThumbnail(index, blob, sha256)
      } else {
        console.log('[TemplateViewer.updateThumbnail] skipping unchanged thumbnail')
      }
    }, 'image.png')
  }).catch((e) => console.log('[TemplateViewer.updateThumbnail] failed', e))

}
</script>

<style scoped>
#btnDelete {
  margin-top: 40px;;
}

.main {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: var(--main-gap);
  min-height: 100vh;
}

.pageGroup {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.pageAll {
  display: flex;
  gap: var(--pages-gap);
  /* justify-content: center; */
  /* max-height: calc(2 * var(--page-height) + var(--pages-gap)); */
  overflow: hidden;
}

/* Ensure all pages have the same width */
.pageAll > * {
  width: var(--page-width);
  min-width: var(--page-width);
  max-width: var(--page-width);
  flex: 0 0 var(--page-width);
}

@media (min-width: 550px) {
  .pageAll {
    margin-left: var(--pages-gap);
  }
}
@media (min-height: 1750px) {
  .pageAll {
    flex-wrap: wrap;
  } 
}

.templateMenu {
  position: absolute;
  left: var(--menu-border-offset);
  top: 0;
  display: flex;
  flex-flow: column;
  gap: var(--menu-border-offset);
  z-index: 2;
}


.twoPages {
    display: flex;
    gap: var(--pages-gap);
}

.navigationButtons {
  position: fixed;
  bottom: var(--menu-border-offset);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.offsetButton {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
}

.offsetButton.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
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
