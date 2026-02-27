<template>
  <div class="main">
    <Menu :name="getTemplateName()"></Menu>
    <TemplateExport v-model:visible="showExport" :template="activeTemplate"
      @close="showExport=false" @export="onExported" />
    <TemplateSettingsDialog v-model:visible="showSettings" :template="settingsTemplate"
      @close="showSettings=false" @save="onNewSettings" @recall="onRecallVersion" />
    <!-- <Editor v-if="showEditor" v-model="activeTemplate" :offset="offset"
      @offset="onOffset" @update="onPageUpdate" /> -->
    <div class="pageGroup">
        <TemplateViewerMenu
          v-model:isCollapsed="menuCollapsed"
          :isTemplateValid="!activeTemplate.isInvalid()"
          :activeEditor="showEditor"
          :activeScroll="showScroll"
          :hasVersion="activeTemplate.ver > 0"
          :showDelete="activeTemplate.id > 0"
          :showEditor="activeTemplate.format === TemplateFormat.Kneeboard"
          :showExport="templateContainsChecklist"
          :showSave="activeTemplate.format === TemplateFormat.Kneeboard"
          :showScroll="templateContainsTiles"
          :isModified="templateModified"
          :hasId="activeTemplate.id > 0"
          @print="onPrint"
          @save="onSave"
          @scroll="onScroll"
          @editor="onEditor"
          @export="onExport"
          @settings="onSettings"
          @delete="onDelete"
          @undo="onUndo"
        />
      </div>
      <div v-if="showScroll && activeTemplate" class="scrollView">
          <Tile v-for="(item, index) in scrollTiles" :key="index"
            :tile="item.tile"
            @update="onScrollUpdate(item.pageIndex, item.tileIndex, $event)"
          />
      </div>
      <div v-else-if="activeTemplate" class="pageAll" :class="{'editor':showEditor}">
        <div v-for="(data,index) in activeTemplate.data" class="pageGrid" :class="{'fullpage-grid': activeTemplate.format === TemplateFormat.FullPage}">
          <Page :data="data" :class="'page'+index"
            :format="activeTemplate.format" @update="onPageUpdate(Number(index), $event)" @delete="onPageDelete(Number(index))" 
            :captureMode="showCapture" @capture="handleCaptureEvent(Number(index), $event)"/>
          
          <VerticalActionBar v-if="showEditor" :offset="Number(index)" :last="Number(index) == activeTemplate.data.length - 1"
            @action="onAction" />
          <div v-else></div>
          <HorizontalActionBar v-if="showEditor" @action="onAction" :index="Number(index)" :blockDelete="activeTemplate.data.length < 2" 
            :isTilePage="data.type == PageType.tiles" :captureMode="showCapture"/>
          <div></div>
          <div></div>
        </div>
        <div class="pageGrid pagePlaceholderGrid" v-if="activeTemplate.format === TemplateFormat.Kneeboard">
             <div class="pagePlaceholder" @click="onAddPage" title="Add New Page to this Kneeboard">
                  <div class="addPageContent">
                       <font-awesome-icon icon="plus" class="addIcon" />
                       <div class="addText">Add Page</div>
                  </div>
             </div>
             <div></div>
             <div></div>
             <div></div>
        </div>
      </div>
      <div v-else class="pageAll">
        <LoadingPage></LoadingPage>
        <LoadingPage></LoadingPage>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computeSHA256 } from '../assets/Sha.ts'
import { currentUser } from '../assets/data.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { DemoData } from '../assets/DemoData.ts'
import { duplicate } from '../assets/data'
import { EditorAction } from '../assets/EditorAction.ts'
import { LocalStoreService } from '../services/LocalStoreService.ts'
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { TemplateFormat } from '@gak/shared'
import { PageType } from '../assets/PageType.ts'
import { RouterNames } from '../router/index.js'
import { Template, TemplatePage } from '../models/Template'
import { TemplateService } from '../services/TemplateService'
import { TemplateSettings } from '../components/templates/TemplateSettings.ts'
import { TileData } from '../models/TileData'
import { readPageFromClipboard, readTileFromClipboard } from '../assets/sheetData'
import { useConfirm } from 'primevue/useconfirm'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../assets/Toaster.ts'

// Components
import html2canvas from 'html2canvas-pro'
import Menu from '../components/menu/Menu.vue'
import TemplateViewerMenu from '../components/menu/TemplateViewerMenu.vue'
import LoadingPage from '../components/page/LoadingPage.vue'
import Page from '../components/page/Page.vue'
import TemplateExport from '../components/templates/TemplateExport.vue'
import TemplateSettingsDialog from '../components/templates/TemplateSettingsDialog.vue'
import Tile from '../components/tiles/Tile.vue'
import VerticalActionBar from '../components/editor/VerticalActionBar.vue'
import HorizontalActionBar from '../components/editor/HorizontalActionBar.vue'

const noTemplate = Template.noTemplate()
const activeTemplate = ref(noTemplate)
const settingsTemplate = ref(noTemplate)
let cssPageGap = -1
let cssPageWidth = -1
const emits = defineEmits(['about','template'])
const confirm = useConfirm()
const menuCollapsed = ref(false)
const offset = ref(0)
const offsetLast = ref(0)
const route = useRoute()
const router = useRouter()
const showEditor = ref(false)
const showCapture = ref(false)
const showScroll = ref(false)
const showExport = ref(false)
const showSettings = ref(false)
const isInitializing = ref(false)
const singlePage = ref(false)
const templateModified = ref(false)
const toast = useToast()
const toaster = useToaster(toast)

watch([templateModified, () => activeTemplate.value?.id], ([newMod, newId]: [boolean, number|undefined]) => {
    if (newId !== undefined) {
        localStorage.setItem('template-modified-id', String(newId))
        localStorage.setItem('template-modified', newMod ? '1' : '0')
    }
})

onMounted(() =>{
  // console.log('[TemplateViewer.onMounted]')
  try {
    const templateId = Number(route.params.id) || 0
    // Check if we have a current session in the generic 'template' slot
    const sessionTemplate = LocalStoreService.getTemplate()
    const savedModifiedId = localStorage.getItem('template-modified-id')
    const savedIsModified = localStorage.getItem('template-modified') === '1'
    const isSessionModified = (savedModifiedId === String(templateId) && savedIsModified)

    if(templateId) {
      // Create a temporary template with a matching number of pages
      const userTemplate = currentUser.templates.find( t => t.id == templateId)
      const tempPages = userTemplate ? userTemplate.pages : 2
      const tempFormat = userTemplate ? userTemplate.format : TemplateFormat.Kneeboard
      const temporaryTemplate = Template.noTemplate( tempPages, tempFormat);
      // console.log('[TemplateViewer.onMounted] temporaryTemplate', temporaryTemplate)
      activeTemplate.value = temporaryTemplate;

      // Check if we have a local copy that matches the expected version
      const localTemplate = LocalStoreService.getTemplateById(templateId)

      // Priority 1: Current session that matches the requested ID
      if (sessionTemplate && sessionTemplate.id === templateId) {
          // console.debug('[TemplateViewer.onMounted] loading from generic session', templateId)
          loadTemplate(sessionTemplate, false, isSessionModified)
          emits('template', sessionTemplate)
      } 
      // Priority 2: Local cache that is up to date with the user object
      else if (userTemplate && localTemplate && localTemplate.ver >= userTemplate.ver) {
          // console.debug('[TemplateViewer.onMounted] loading from local cache', templateId)
          loadTemplate(localTemplate, true)
          emits('template', localTemplate)
      } else {
        // console.debug('[TemplateViewer.onMounted] loading from backend', templateId)
        TemplateService.get(templateId).then( template => {
          if(template.id) {
            loadTemplate(template, true)
            // Save to local cache
            LocalStoreService.saveTemplateById(template.id, template)
            emits('template',template)
          } else {
            toaster.error( 'Load Template','Invalid Template Id ' + route.params.id)
            // restore last template
            loadTemplate(LocalStoreService.getTemplate())
          }
        }).catch( (err) => {
            if(localTemplate) {
              // fallback to local cache if network fails
              toaster.warning( 'Load Template','Could not reach server, using cached version')
              loadTemplate(localTemplate, true)
              emits('template', localTemplate)
            } else {
              toaster.error( 'Load Template','Could not reach server')
            }
        })
      }
    } else { 
      // no template id => load local template active session
      loadTemplate(sessionTemplate, false, isSessionModified)
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

function doSave() {
  try {
      // retrieve data from active template
      toaster.info( 'Say Request', 'Saving template ' + activeTemplate.value.name, 4000)
      TemplateService.save(activeTemplate.value).then(ts => {
        // console.debug('[TemplateViewer.doSave]', activeTemplate.value.id, JSON.stringify(t))
        const t = ts.template
        let message = 'Template "' + t.name + '" saved with version ' + t.ver;
        if(t.publish && t.code) {
          message += '\nShare code is ' + t.code
        }
        toast.removeAllGroups()
        toaster.success( 'Clear', message)
        if(ts.code == 202) {
          toaster.warning('Max Templates', 'You have reached your template maximum. Please consider upgrading promptly', 6000)
        }
        // update ID if we just got one
        if(!activeTemplate.value.id) {
          activeTemplate.value.id = t.id
        }
        // update version number
        activeTemplate.value.ver = t.ver
        // update code
        activeTemplate.value.code = t.code

        // Update the generic local storage slot as well
        saveTemplateToLocalStoreService()

        // Update local cache with new version
        LocalStoreService.saveTemplateById(activeTemplate.value.id, activeTemplate.value)

        // mark the template as not modified anymore
        templateModified.value = false

        // were we on a local template? redirect to the new permanent URL
        if(route.params.id == 'local' || !route.params.id) {
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

// update all widgets with provided data
function loadTemplate(template:Template,saveToLocalStorage:boolean=false, isModified:boolean=false) {
  // console.log( '[TemplateViewer.loadTemplate]', template)
  isInitializing.value = true

  // if we don't know what to show, we load a copy of the demo page
  if( template.isInvalid()) {
    template = DemoData.tiles();
  }

  // make sure data is at the latest format
  const data = TemplateService.normalize(template.data)

  // we are on the first page and last page is calculated based on number of pages
  offset.value = 0
  template.data = data
  
  activeTemplate.value = template;
  templateModified.value = isModified;
  // console.log('[TemplateViewer.loadTemplate] template version', JSON.stringify(template.ver))
  updateOffsets()
  
  // Update the browser tab title with the template name
  document.title = template.name || 'New Template';


  // console.log('[TemplateViewer.loadTemplate]', offset.value, offsetLast.value)

  // asynchronous localstorage maintenance
  setTimeout( async() => {
    return new Promise<void>( async(resolve, reject) => {
      // save the template to local storage
      if(saveToLocalStorage) {
        saveTemplateToLocalStoreService()
      }
      updateThumbnail(template)
      resolve()
    })
  }, 1000)

  nextTick(() => {
    // necessary to correctly update the modified flag
    isInitializing.value = false
  })
}

function onAction(action:EditorAction) {
  let confirmation:any|undefined = undefined
  if(action.action == EditorAction.DUPLICATE_PAGE) confirmation = {message:'Please confirm you want to overwrite page ' + (action.offsetTo + 1), header:'Overwrite Page', acceptLabel:'Yes, Overwrite'}
  if(action.action == EditorAction.DELETE_PAGE && activeTemplate.value.data[action.offset].type != PageType.selection) {
    confirmation = {message:'Please confirm you want to delete page ' + (action.offset + 1), header:'Delete Page', acceptLabel:'Yes, Delete'}
  }

  if(confirmation) {
    confirm.require({
        message: confirmation.message,
        header: confirmation.header,
        rejectLabel: 'No',
        acceptLabel: confirmation.acceptLabel,
        accept: () => {
          onEditorAction(action)
        }
      })
  } else {
    onEditorAction(action)
  }
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
        await TemplateService.delete(activeTemplate.value).then( () => {
          // go back to home page
          router.push('/')
          // and give visual feedback
          toast.removeAllGroups()
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
  if(showEditor.value) showScroll.value = false;
  if(!showEditor.value) showCapture.value = false;
}

function onCapture() {
  showCapture.value = !showCapture.value
}

function onScroll() {
  showScroll.value = !showScroll.value
  if(showScroll.value) showEditor.value = false;
}

// Pages are manipulated via editor buttons
async function onEditorAction(ea:EditorAction) {
  // console.log('[Editor.onEditorAction]', ea, activeTemplate.value)
  let updateOffset = false;
  const updatedPages:number[] = []

  // if we dont have a template, we can leave
  if(!activeTemplate.value) return;

  if(ea.action == EditorAction.COPY_PAGE_TO_CLIPBOARD) {

    const pageData = activeTemplate.value.data[ea.offset]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(pageData));
    toaster.success('Editor', 'Page ' + (ea.offset+1) + ' copied to clipboard')

  } else if(ea.action == EditorAction.COPY_TILE_TO_CLIPBOARD) {

    const tileData = activeTemplate.value.data[ea.offset].data[ea.offsetTo]
    // grab data and show toast
    navigator.clipboard.writeText(JSON.stringify(tileData));
    toaster.success('Editor', 'Tile ' + (ea.offsetTo+1) + ' copied to clipboard')

  } else if(ea.action == EditorAction.DUPLICATE_PAGE) {

    activeTemplate.value.data[ea.offsetTo] = duplicate(activeTemplate.value.data[ea.offset])
    updatedPages.push(ea.offsetTo)

  } else if(ea.action == EditorAction.DELETE_PAGE) {

    // protection against last page removal
    if( activeTemplate.value.data.length == 1) {
      toaster.warning('Cannot Delete Page', 'Last page cannot be deleted. Delete the template instead.')
      return;
    }
    // remove page from active template
    activeTemplate.value.data.splice(ea.offset, 1)
    // updatedPages.push(ea.offset)
    updateOffset = true

  } else if(ea.action == EditorAction.INSERT_PAGE) {

    // validate offset
    if( isNaN(ea.offset) || ea.offset < 0) return;
    if( ea.offset >= activeTemplate.value.data.length) {
      // append blank page to last position
      activeTemplate.value.data.push( TemplatePage.SELECTION)
    } else {
      // insert blank page at position
      activeTemplate.value.data.splice(ea.offset, 0, TemplatePage.SELECTION)
    }
    updatedPages.push(ea.offset)
    updateOffset = true;

  } else if(ea.action == EditorAction.PASTE_PAGE) {

    readPageFromClipboard().then( page => {
      if(activeTemplate.value) {
        activeTemplate.value.data[ea.offset] = page;
        updatedPages.push(ea.offset)
      }
    }).catch( e => {
        toaster.error('Editor', 'Cannot Paste ' + e)
    }) 

  } else if(ea.action == EditorAction.PASTE_TILE) {
    
    readTileFromClipboard().then( tile => {
      console.log('[Editor.onEditorAction]', ea.offset, ea.offsetTo, activeTemplate.value)
      if( isNaN(ea.offset) || isNaN(ea.offsetTo) || !activeTemplate.value) return;
      // offset has the page number, offsetTo has the tile number
      // console.log('[App.onEditorAction] pasteTile', ea.offset, ea.offsetTo, page.sourceTile, page)
      const newPageValue = JSON.parse( JSON.stringify(activeTemplate.value.data[ea.offset]));
      newPageValue.data[ea.offsetTo] = tile;
      activeTemplate.value.data[ea.offset] = newPageValue
      // activeTemplate.value.data[ea.offset].data[ea.offsetTo].id = ea.offsetTo;
      updatedPages.push(ea.offset)
    }).catch( e => {
        toaster.error('Editor','Cannot Paste Tile' + e)
    }) 

  } else if(ea.action == EditorAction.RESET_PAGE) {

    activeTemplate.value.data[ea.offset] = duplicate(TemplatePage.SELECTION)
    updatedPages.push(ea.offset)

  } else if(ea.action == EditorAction.SWAP_PAGE) {

    const swap = duplicate(activeTemplate.value.data[ea.offset])
    activeTemplate.value.data[ea.offset] = activeTemplate.value.data[ea.offset + 1]
    activeTemplate.value.data[ea.offset + 1] = swap;
    updatedPages.push(ea.offset)
    updatedPages.push(ea.offset + 1)

  } else if(ea.action == EditorAction.TOGGLE_CAPTURE) {

    onCapture()

  } else if(ea.action == EditorAction.SWAP_TILES) {

    // is this a tile page?
    if(activeTemplate.value.data[ea.offset].type != PageType.tiles) return;
    const tileFrom = ea.params?.from
    const tileTo = ea.params?.to
    if(tileFrom === undefined || tileTo === undefined) return;

    const temp = duplicate(activeTemplate.value.data[ea.offset].data[tileFrom])
    // console.log('[Editor.onEditorAction]', temp, activeTemplate.value.data[ea.offset].data[tileTo], tileFrom, tileTo)
    const newPageValue = JSON.parse( JSON.stringify(activeTemplate.value.data[ea.offset]));
    newPageValue.data[tileFrom] = activeTemplate.value.data[ea.offset].data[tileTo]
    newPageValue.data[tileTo] = temp
    // reset span and hide
    newPageValue.data[tileFrom]['span2'] = false
    newPageValue.data[tileFrom]['hide'] = false
    newPageValue.data[tileTo]['span2'] = false
    newPageValue.data[tileTo]['hide'] = false
    activeTemplate.value.data[ea.offset] = newPageValue
    updatedPages.push(ea.offset)

  } else {
    reportError('[App.onEditorAction] unknown action ' + ea)
  }

  // console.log('[Editor.editoAction] ', updatedPages)
  for( const index of updatedPages) {
    // console.log('[Editor.editoAction] updatePage', ea.action, index)
    // emits('update', index, activeTemplate.value.data[index]) 
  }

  if(isInitializing.value) return

  // only mark as modified if we actually changed something
  if (ea.action != EditorAction.COPY_PAGE_TO_CLIPBOARD && ea.action != EditorAction.COPY_TILE_TO_CLIPBOARD && ea.action != EditorAction.TOGGLE_CAPTURE) {
    templateModified.value = true
  }
}

function onExport() {
  if (currentUser.canExportPdf) {
    toaster.upgrade()
    return
  }
  if(activeTemplate.value.id == 0) {
    toaster.warning('Line up and Wait','Please save your template before exporting')
    return
  }
  showExport.value=true  
}

function onExported(format:any) {
  showExport.value = false;
  toaster.info( 'Exporting', activeTemplate.value.name)
  TemplateService.export(activeTemplate.value, format).then( eo => {
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

function onPageDelete(index:number) {
  // console.debug('[TemplateViewer.onPageDelete]', index)
    if(isInitializing.value) return
    templateModified.value = true
    activeTemplate.value.data.splice(index, 1)
    saveTemplateToLocalStoreService()
}

function onPageUpdate(index:number, pageData:TemplatePage) {
  // console.debug('[TemplateViewer.onPageUpdate]', index, pageData)
  if(isInitializing.value) return
  templateModified.value = true

  // save template data for that page
  activeTemplate.value.data[index] = pageData

  // save template locally
  saveTemplateToLocalStoreService()
}


function onPrint() {
  if( !currentUser.loggedIn) {
    toaster.warning('Squawk and Ident','Please sign in before printing')
    return
  }

  // go to print mode
  const printTemplateId = activeTemplate.value?.id || 0
  // Pass templateModified if the template is modified OR if it's a new template (id=0)
  const isModified = templateModified.value || !activeTemplate.value?.id
  router.push({
    path: '/print/' + printTemplateId,
    query: { modified: isModified ? '1' : '0' }
  })
}

async function onSave(clone:boolean=false) {
  // console.debug('[TemplateViewer.onSave]', clone, activeTemplate.value)
  // If there is nothing to save, just get out
  if( activeTemplate.value.isInvalid()) return;

  if( !currentUser.loggedIn) {
    toaster.warning('Squawk and Ident','Please sign in to save templates')
    return
  }

  // Update thumbnail in the background after some time
  setTimeout( () => updateThumbnail(activeTemplate.value), 1000)

  // to duplicate this template, we reset the id to 0 while keeping the data
  if(clone) { 
    const newTemplate = Template.copy(activeTemplate.value)
    // console.debug('[TemplateViewer.onSave]', newTemplate)
    newTemplate.id = 0
    newTemplate.name = 'Copy of ' + activeTemplate.value.name
    newTemplate.ver = 0
    settingsTemplate.value = newTemplate;
    showSettings.value = true;
  } else { // this is a normal save
    // if this template has never been saved before, show the settings dialog to get a proper name
    if(!activeTemplate.value.id) {
      settingsTemplate.value = activeTemplate.value
      showSettings.value = true;
    } else {
      doSave();
    }
  }
  
}

function onSettings() {
  settingsTemplate.value = activeTemplate.value
  showSettings.value = true;
}

function onNewSettings(settings:TemplateSettings) {
  // console.debug('[TemplateViewer.onSettings]', settings)

  // Hide settings
  showSettings.value = false;

  if( activeTemplate.value.id > 0 
    && settingsTemplate.value.name == settings.name 
    && settingsTemplate.value.desc == settings.desc 
    && settingsTemplate.value.publish == settings.publish) {
    toaster.warning('Repeat Last Transmission','Nothing to save, settings unchanged')
    return;
  }
  // settingsTemplate.value is a proxy to activeTemplate, but it might have been reset.
  // We should just update the properties directly on activeTemplate to prevent losing data.
  activeTemplate.value.name = settings.name
  activeTemplate.value.desc = settings.desc
  activeTemplate.value.publish = settings.publish

  // We consider the template as modified if it's a cloud template
  templateModified.value = activeTemplate.value.id > 0
  saveTemplateToLocalStoreService()
  doSave()
}


function onUndo() {
  const templateId = activeTemplate.value.id
  if (!templateId) return

  confirm.require({
    message: 'Discard all unsaved changes to "' + activeTemplate.value.name + '"?',
    header: 'Undo Changes',
    rejectLabel: 'Cancel',
    acceptLabel: 'Yes, Undo',
    accept: () => {
      const savedTemplate = LocalStoreService.getTemplateById(templateId)
      if (savedTemplate) {
        loadTemplate(savedTemplate, true, false)
        toaster.success('Undo', 'Changes discarded')
      } else {
        // Fetch from server if not in local cache
        toaster.info('Undo', 'Reloading template from server...')
        TemplateService.get(templateId).then(template => {
          loadTemplate(template, true, false)
          LocalStoreService.saveTemplateById(template.id, template)
          toaster.success('Undo', 'Changes discarded')
        }).catch(e => {
          toaster.error('Undo', 'Failed to reload template: ' + e.message)
        })
      }
    }
  })
}

function onRecallVersion({id, ver}: {id:number, ver:number}) {
  showSettings.value = false;
  toaster.info('Recalling', 'Loading version ' + ver + '...');
  TemplateService.get(id, ver).then( template => {
    if(template.id) {
      loadTemplate(template, false);
      toaster.success('Recalled', 'Version ' + ver + ' loaded successfully');
    } else {
      toaster.error('Recall Failed', 'Could not load version ' + ver);
    }
  }).catch( e => {
    if (e.response && e.response.status === 403) {
      toaster.error('Recall Failed', 'Restoring old version is not supported on your current plan. Please consider upgrading.', 10000);
    } else {
      toaster.error('Recall Failed', e.message || 'Unknown error');
    }
  })
}

function saveTemplateToLocalStoreService() {
  // console.log('[TemplateViewer.saveTemplateToLocaStore]', thumbnail)
  LocalStoreService.saveTemplate(activeTemplate.value)
}

function updateOffsets() {
  // console.log('[TemplateViewer.onResize]', window.innerWidth)
  if(activeTemplate.value.isInvalid()) return;

  const elt = getComputedStyle(document.body)
  if( cssPageGap == -1) {
    cssPageGap = parseInt(elt.getPropertyValue('--pages-gap'));
  }

  // Get the appropriate page width based on the template format
  const widthProp = activeTemplate.value.format === 'fullpage' 
    ? '--fullpage-width' : '--page-width';
  cssPageWidth = parseInt( elt.getPropertyValue( widthProp))

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

  menuCollapsed.value = window.innerWidth <= cssPageWidth + cssPageGap
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
  html2canvas(element, { logging: false}).then( async (canvas) => {
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
        activeTemplate.value.thumbUrl = await TemplateService.updateThumbnail(index, blob, sha256)
      } else {
        // console.log('[TemplateViewer.updateThumbnail] skipping unchanged thumbnail')
      }
    }, 'image.png')
  }).catch((e) => console.log('[TemplateViewer.updateThumbnail] failed', e))

}

function onAddPage() {
    if(isInitializing.value) return
    if(!activeTemplate.value) return;
    activeTemplate.value.data.push(duplicate(TemplatePage.SELECTION));
    templateModified.value = true;
    updateOffsets();
    saveTemplateToLocalStoreService();
}

/**
 * Computed property to get all tiles from all tile pages, flattened and forced to single column.
 */
const scrollTiles = computed(() => {
  const tiles: { tile: TileData, pageIndex: number, tileIndex: number }[] = []
  if (!activeTemplate.value) return []
  
  // typecast data into array of Pages
  activeTemplate.value.data.forEach((page: TemplatePage, pageIndex: number) => {
    if (page.type === PageType.tiles) {
      page.data.forEach((tile: TileData, tileIndex: number) => {
         // Create a copy to avoid mutating original immediately and to force single column
         // We assume TileData.copy or simple JSON copy works. 
         // Since we imported TileData, let's try to use a static copy method if it exists, 
         // but TilePage used TileData.copy(tile).
         const tileCopy = JSON.parse(JSON.stringify(tile))
         tileCopy.span2 = false
         tileCopy.hide = false
         tiles.push({ tile: tileCopy, pageIndex, tileIndex })
      })
    }
  })
  return tiles
})

/**
 * Computed property to check if the template contains at least one checklist page.
 */
const templateContainsChecklist = computed(() => {
  return activeTemplate.value?.data.some((page: TemplatePage) => page.type === PageType.checklist) || false
})

/**
 * Computed property to check if the template contains at least one tile page.
 */
const templateContainsTiles = computed(() => {
  return activeTemplate.value?.data.some((page: TemplatePage) => page.type === PageType.tiles) || false
})

function onScrollUpdate(pageIndex: number, tileIndex: number, newTile: TileData) {
  // We need to update the original tile in activeTemplate.
  // We should try to preserve the original span2/hide properties if the user didn't change the type,
  // or if we just want to avoid Roll mode destroying layout settings.
  
  const originalPage = activeTemplate.value.data[pageIndex]
  if (!originalPage || !originalPage.data[tileIndex]) return

  const originalTile = originalPage.data[tileIndex]
  
  // If the type changed, we probably accept the new defaults.
  // If the type is the same, we might want to preserve the original layout (span2).
  // However, Tile component emits the FULL state.
  
  // Let's create the final tile data to save.
  const finalTile = TileData.copy(newTile)
  
  // Restore layout if type matches (assuming Roll mode shouldn't change layout)
  if (originalTile.name === newTile.name) {
      finalTile.span2 = originalTile.span2
      finalTile.hide = originalTile.hide
  } else {
      // If type changed, newTile has the defaults for that type (usually span2=false)
      // which is probably what we want.
  }

  // Update the template
  activeTemplate.value.data[pageIndex].data[tileIndex] = finalTile
  if(!isInitializing.value) templateModified.value = true
  saveTemplateToLocalStoreService()
}


function handleCaptureEvent(pageIndex: number, event: any) {
  if (event.page || (event.shift === false)) {
      onCapturePage(pageIndex);
  } else {
      onCaptureTile(pageIndex, event.index);
  }
}

async function onCapturePage(pageIndex: number) {
    if(!showCapture.value) return;

  const selector = `.page${pageIndex}`;
  const element = document.querySelector(selector) as HTMLElement;
  if(!element) {
        toaster.error('Capture', 'Could not find page to capture')
        return
  }

  try {
      toaster.info('Capture', 'Capturing page...')
      const canvas = await html2canvas(element, { 
          useCORS: true, 
          logging: false, 
          scale: 2,
          ignoreElements: (element) => element.classList.contains('capture-overlay')
      })
      canvas.toBlob(blob => {
            if(blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank')
            }
      })
  } catch(e) {
      // console.error(e)
      toaster.error('Capture', 'Failed to capture page')
  }
}

async function onCaptureTile(pageIndex: number, tileIndex: number) {
  if(!showCapture.value) return;

  const selector = `.page${pageIndex} .tile${tileIndex}`;
  const element = document.querySelector(selector) as HTMLElement;
  if(!element) {
        toaster.error('Capture', 'Could not find tile to capture')
        return
  }

  try {
      toaster.info('Capture', 'Capturing tile...')
      const canvas = await html2canvas(element, { 
          useCORS: true, 
          logging: false, 
          scale: 2,
          ignoreElements: (element) => element.classList.contains('capture-overlay')
      })
      canvas.toBlob(blob => {
            if(blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank')
            }
      })
  } catch(e) {
      // console.error(e)
      toaster.error('Capture', 'Failed to capture tile')
  }
}
</script>

<style scoped>


.main {
  position: relative;
  display: flex;
  flex-flow: column;
  gap: var(--main-gap);
  min-height: 100vh;
  
}

.pageGroup {
  position: relative;
  display: flex;
  justify-content: left;
  align-items: left;
  width: 100%;
}

.pageAll {
  display: flex;
  align-items: center;
  overflow: auto;
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

@media (min-height: 1750px) {
  .pageAll {
    flex-wrap: wrap;
  } 
}

.scrollView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  padding-top: var(--menu-border-offset); /* Align with menu */
  padding-bottom: 50px;
  min-height: 100vh;
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

 .pageGrid {
  /* create a 2x2 grid */
  display: grid;
  grid-template-columns: var(--page-width) var(--pages-gap);
  grid-template-rows: var(--page-height) var(--pages-gap);
}

.pageGrid.fullpage-grid {

  grid-template-columns: auto var(--pages-gap);
  grid-template-rows: auto var(--pages-gap);
  /* grid-template-columns: var(--fullpage-width) var(--pages-gap);
  grid-template-rows: var(--fullpage-height) var(--pages-gap); */
}

.pagePlaceholder {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed lightgrey;
    border-radius: 10px;
    background-color: rgba(0,0,0,0.03);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    height: 100%;
}
.pagePlaceholder:hover {
    background-color: rgba(0,0,0,0.08);
    border-color: darkgrey;
}
.addPageContent {
    text-align: center;
    color: grey;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.addIcon {
    font-size: 2em;
    display: block;
}
.addText {
    font-size: 1.1em;
    font-weight: 600;
}

</style>
