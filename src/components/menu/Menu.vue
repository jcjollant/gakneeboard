<template>
  <div class="container" :class="{grow: showMenu}">
    <About v-model:visible="showAbout" @close="showAbout=false" @hdiw="onHdiw"/>
    <ConfirmDialog />
    <DemoSelection v-model:visible="showDemoSelection" @load="onTemplateLoad" />
    <Maintenance v-model:visible="showMaintenance" 
      @maintenance="onMaintenance" @toast="onToast" />
    <Print v-model:visible="showPrint" :refresh="refreshPrint"
      @close="onPrintClose" 
      @options="onPrintOptions"
      @print="onPrintPrint"
       />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <TemplateExport v-model:visible="showTemplateExport"
      @close="showTemplateExport=false"
      @export="onExportExport" />
    <TemplateLoad v-model:visible="showTemplateLoad" :time="templateTime" 
      @close="onTemplateCloseLoad"
      @load="onTemplateLoad" 
      @toast="onToast" />
    <TemplateSave v-model:visible="showTemplateSave" :mode="templateDialogMode" :time="templateTime" :template="activeTemplate"
      @close="onTemplateCloseSave"
      @delete="onTemplateDelete"
      @save="onTemplateSave"
      @mode="onTemplateMode"
      @overwrite="onTemplateOverwrite"
      @toast="onToast" />
    <div class="menuIcon" :class="{change: showMenu}" @click="toggleMenu" title="Toggle Menu">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
    <div v-show="showMenu" class="expandedMenu">
      <div class="buttonsList">
        <Button v-if="user.loggedIn" :label="user.name" icon="pi pi-user" title="Sign Out" class="active"
          @click="onSignOut"></Button>
        <Button v-else label="Sign In" icon="pi pi-user" title="Sign In to enable custom data"
          @click="showSignIn=true"></Button>
        <Button icon="pi pi-print" :label="singlePage?'':'Print'" title="Print Active Template"
          @click="onPrint"></Button>
        <div class="separator"></div>
        <Button :label="singlePage?'':'New'" icon="pi pi-file" id="menuNew" title="Reset Template" @click="onTemplateLoad(getTemplateBlank())"></Button>
        <Button :label="singlePage?'':'Load'" icon="pi pi-folder-open" id="menuLoad" title="Open Existing Template" @click="onMenuLoad"></Button>
        <Button :label="singlePage?'':'Save'" icon="pi pi-save" id="menuSave" title="Save Active Template" @click="onMenuSave"></Button>
        <Button :label="singlePage?'':'Export'" icon="pi pi-file-export" id="menuExport" title="Export Active Template" @click="onMenuExport"></Button>
        <Button :label="singlePage?'':'Demos'" icon="pi pi-clipboard" id="menuDemos" title="Load Demo Template" @click="showDemoSelection=true" severity="secondary"></Button>
        <div class="separator" @click="showMaintenance=true"></div>
        <Button icon="pi pi-info-circle" id="menuAbout" title="About / Guides / Warnings" severity="secondary"
          @click="showAbout=true"></Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';

import { newCurrentUser } from '../../assets/data'
import { getTemplateBlank } from '../../assets/sheetData'
import { emitToast, emitToastError, emitToastInfo, emitToastWarning } from '../../assets/toast'
import { TemplateData, TemplateSaveDialogMode } from '../../assets/Templates'

import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';

import About from './About.vue'
import DemoSelection from '../demos/DemoSelection.vue';
import Maintenance from './Maintenance.vue'
import Print from './Print.vue'
import SignIn from '../signin/SignIn.vue';
import TemplateLoad from '../templates/TemplateLoad.vue'
import TemplateSave from '../templates/TemplateSave.vue'
import TemplateExport from '../templates/TemplateExport.vue';


const emits = defineEmits(['authentication','howDoesItWork','load','print','printOptions', 'printPreview','save','toast','toggle'])

const activeTemplate = ref(null)
const confirm = useConfirm()
const refreshPrint = ref(0)
const showAbout = ref(false)
const showDemoSelection = ref(false)
const showMaintenance = ref(false)
const showMenu = ref(false)
const showPrint = ref(false)
const showSignIn = ref(false)
const showTemplateExport = ref(false)
const showTemplateSave = ref(false)
const showTemplateLoad = ref(false)
const singlePage = ref(false)
const user = ref(newCurrentUser)
const templateDialogMode = ref('load')
const templateTime = ref(0)
let readyToPrint = false;

//---------------------
// Props management
const props = defineProps({
  activeTemplate: { type: Object, default: null},
  singlePage: {type:Boolean, default: false}
})

function loadProps( props) {
  // console.log('Menu loadProps', JSON.stringify(props))
  activeTemplate.value = props.activeTemplate;
  singlePage.value = props.singlePage;
}

onMounted( () => {
  newCurrentUser.addListener(onUserUpdate)
  
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

watch(showPrint, async( newValue, oldValue) => {
  // console.log('[Menu.watch] oldP', oldP, 'newP', newP)
  if(!newValue) {
    // this mechanism prevent options reset when you are about to print
    if( readyToPrint) {
      readyToPrint = false;
    } else {
      emits('printPreview', false)
    }
  }

})

// End props management
//---------------------

function confirmAndLoad(title, template) {
  confirm.require({
      message: 'Do you want to replace all pages in the current template?',
      header: title,
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        activeTemplate.value = template
        emits('load', template)
      }
    })
}


function onAuthentication(newUser) {
  // console.log('[Menu.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( newUser) {
    emitToast(emits, 'Clear', 'Welcome ' + newUser.name)
  } else {
    emitToastWarning(emits, 'Engine Roughness', 'Authentication failed');  
  }
}

function onExportExport(format) {
  showTemplateExport.value = false;
  TemplateData.export(activeTemplate.value, format).then( eo => {
    // create file link in browser's memory
    // console.log('[Menu.onMenuExport] blob', eo.blob.size)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(eo.blob)
    link.download = eo.filename
    link.click()
    URL.revokeObjectURL(link.href)
  })
}

// how does it work? close about and emit to parent
function onHdiw() {
  showAbout.value = false;
  emits('howDoesItWork')
}

// maintenance user
function onMaintenance() {
  showMaintenance.value = false;
}

async function onMenuExport() {
  // make sure we have a usable template
  if( !activeTemplate.value.id) {
    emitToastWarning(emits, 'Please save your template or load an existing template before exporting')
    return;
  }
  showTemplateExport.value = true;
}

function onMenuLoad() {
  if( newCurrentUser.loggedIn) {
    templateTime.value = Date.now()
    showTemplateLoad.value = true;
  } else {
    warnNoUser()
  }
}

function onMenuSave() {
  // console.log('[Menu.onTemplateDialog]', save, JSON.stringify(activeTemplate.value))
  if( newCurrentUser.loggedIn) {
    showTemplateSave.value = true;
    templateTime.value = Date.now()
    // console.log('[Menu.onTemplateDialog]', JSON.stringify(activeTemplate.value))
    templateDialogMode.value = (activeTemplate.value && activeTemplate.value.id) ? TemplateSaveDialogMode.save : 'saveAs'
  } else {
    warnNoUser()
  }
}


function onPrint() {
  showPrint.value = true;
  refreshPrint.value++;
  toggleMenu()
  emits('printPreview', true);
}

function onPrintClose() {
  // console.log('[Menu.onPrintClose]')
  showPrint.value = false;
}

function onPrintOptions(options) {
  emits('printOptions', options);
}

function onPrintPrint(options) {
  readyToPrint = true;
  showPrint.value = false;
  emits('print', options);
}

function onSignOut() {
  confirm.require({
      message: 'You will loose access to your custom content.',
      header: 'Close Session',
      rejectLabel: 'Stay in',
      acceptLabel: 'Sign Out',
      accept: () => {
        // logout and remo
        newCurrentUser.logout()

        // reload the page
        location.reload()
      }
    })
}

/**
 * Hide the sheet dialog
 */
function onTemplateCloseSave() {
  showTemplateSave.value = false;
}

function onTemplateCloseLoad() {
  showTemplateLoad.value = false;
}

// a sheet has been deleted, it should be removed from the user
function onTemplateDelete(template) {
  // newCurrentUser.removeTemplate(template.id)
  // emitToast(emits, 'Clear', 'Template "' + template.name + '" deleted')
}

/**
 * We are about to change template
 * @param {*} template 
 */
 function onTemplateLoad(template) {
  // console.log('[menu.onPageLoad]',pageName)
  showTemplateSave.value = false
  showTemplateLoad.value = false
  showDemoSelection.value = false
  
  const title = 'Load Template "' + template.name + '"'
  confirmAndLoad( title, template)
}

function onTemplateMode(mode) {
  templateDialogMode.value=mode
}

function onTemplateOverwrite(from,to) {
  if(!from || !to) {
    emitToastError('Overwrite', 'Invalid Templates')
    return;
  }
  confirm.require({
      message: "\'" + to.name + "\' template is about to be overwritten with \'" + from.name  + "\'. ",
      header: "Overwrite Template",
      rejectLabel: 'Do Not Overwrite',
      acceptLabel: 'Overwrite',
      accept: () => {
        // activeTemplate.value = template
        // emits('load', template)
      }
    })

}

/**
 * Page Dialog wants to save a page
 * @param {*} template 
 */
 async function onTemplateSave(template) {
  // console.log('[Menu.onTemplateSave]',JSON.stringify(template))
  showTemplateSave.value = false;
  try {
      // retreive data from active template
      template.data = activeTemplate.value.data;
      emitToastInfo( emits, 'Say Request', 'Saving template ' + template.name)
      await TemplateData.save(template).then(t => {
        // console.log('[Menu.onTemplateSave]', JSON.stringify(t))
        let message = 'Template "' + t.name + '" saved';
        if(t.publish && t.code) {
          message += '\nShare code is ' + t.code
        }
        emits('save', t)
        emitToast(emits, 'Clear', message)
      })
  } catch( e) {
    console.log('[Menu.onTemplateSave]', e)
    emitToastError(emits, 'Save Template','Could not save template "' + template.name + '"')
  }
}

// pass on toast events to App
function onToast(data) {
  emits('toast', data)
}

function onUserUpdate(currentUser) {
  // console.log('[Menu.onUserUpdate]', JSON.stringify(currentUser))
  user.value = currentUser
  templateTime.value = Date.now()
}

// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
    emits('toggle', showMenu.value)
}

function warnNoUser() {
  emitToastWarning(emits, 'Squawk and Ident','Please sign in to use custom templates')
}

</script>


<style scoped>
.container {
  position:relative;
  display: flex;
  flex-flow: row;
  gap: 40px;
  padding-right: 10px;
}
.grow {
  background-color: lightgrey;
  opacity: 1;
  border-radius: 10px;
}

.buttonsList {
  text-align: left;
  display: flex;
  flex-flow: row;
  gap:20px;
  color: white;
}
.menuIcon {
  padding-left: 5px;
  padding-top: 5px;
  display: inline-block;
  cursor: pointer;
}
.expandedMenu {
  position: relative;
  width: 100%;
  padding: 5px;
}
.separator {
  border-left: 1px solid darkgrey;
  border-right: 1px solid darkgrey;
  width:2px;
  height: 25px;
  margin:auto;
}

.bar1, .bar2, .bar3 {
  width: 35px;
  height: 5px;
  background-color: darkgrey;
  margin: 6px 0;
  transition: 0.4s;
  pointer-events: none;
}

.change .bar1 {
  transform: translate(0, 11px) rotate(-45deg);
}

.change .bar2 {opacity: 0;}

.change .bar3 {
  transform: translate(0, -11px) rotate(45deg);
}

.active {
  background: white;
  color: black;
}

.version {
  position:absolute;
}
</style>