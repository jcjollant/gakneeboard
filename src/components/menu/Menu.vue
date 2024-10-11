<template>
  <div class="container" :class="{grow: showMenu}">
    <ConfirmDialog />
    <Maintenance v-model:visible="showMaintenance" 
      @maintenance="onMaintenance" @toast="onToast" />
    <Print v-model:visible="showPrint" :refresh="refreshPrint"
      @close="onPrintClose" 
      @options="onPrintOptions"
      @print="onPrintPrint"
       />
    <About v-model:visible="showAbout" @close="showAbout=false" @hdiw="onHdiw"/>
    <DemoSelection v-model:visible="showDemoSelection" @load="onTemplateLoad" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <TemplateSave v-model:visible="showTemplateSave" :mode="templateDialogMode" :time="templateTime" :template="activeTemplate"
      @close="onTemplateCloseSave"
      @delete="onTemplateDelete"
      @save="onTemplateSave"
      @mode="onTemplateMode"
      @overwrite="onTemplateOverwrite"
      @toast="onToast" />
    <TemplateLoad v-model:visible="showTemplateLoad" :time="templateTime" 
      @close="onTemplateCloseLoad"
      @load="onTemplateLoad" 
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
        <Button icon="pi pi-print" label="Print" title="Print Active Template"
          @click="onPrint"></Button>
        <div class="separator"></div>
        <Button label="New" icon="pi pi-file" title="Reset Template" @click="onTemplateLoad(getTemplateBlank())"></Button>
        <Button label="Load" icon="pi pi-folder-open" title="Open Existing Template" @click="onMenuLoad"></Button>
        <Button label="Save" icon="pi pi-save" title="Save Active Template" @click="onMenuSave"></Button>
        <!-- <Button label="Export" icon="pi pi-file-export" title="Export Active Template" @click="onMenuExport"></Button> -->
        <Button label="Demos" icon="pi pi-clipboard" title="Load Demo Template" @click="showDemoSelection=true"></Button>
        <div class="separator" @click="showMaintenance=true"></div>
        <Button icon="pi pi-info-circle" title="About / Guides / Warnings"
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
import Feedback from './Feedback.vue';
import Maintenance from './Maintenance.vue'
import Print from './Print.vue'
import SignIn from '../signin/SignIn.vue';
import TemplateLoad from '../templates/TemplateLoad.vue'
import TemplateSave from '../templates/TemplateSave.vue'


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
const showTemplateSave = ref(false)
const showTemplateLoad = ref(false)
const user = ref(newCurrentUser)
const templateDialogMode = ref('load')
const templateTime = ref(0)
let readyToPrint = false;

//---------------------
// Props management
const props = defineProps({
  activeTemplate: { type: Object, default: null},
})

function loadProps( props) {
  // console.log('Menu loadProps', JSON.stringify(props))
  activeTemplate.value = props.activeTemplate;
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
  const data = await TemplateData.export(activeTemplate.value, 'ace')
    // create file link in browser's memory
    const href = URL.createObjectURL(data);

    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'file.ace'); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);  
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
      header: 'Sign Out',
      rejectLabel: 'Stay in',
      acceptLabel: 'Ok',
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
 * Page dialog wants us to save the page
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