<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './Feedback.vue';
import Print from './Print.vue'
import Sheets from './Sheets.vue'
import SignIn from './SignIn.vue';
import Warning from './Warning.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';
import { customSheetSave } from '../../assets/data'
import { blogUrl, getCurrentUser, setCurrentUser } from '../../assets/data'
import { sheetNameDemoTiles, sheetNameDemoChecklist, sheetNameReset, sheetNameNew } from '../../assets/sheetData'
import { getSheetBlank, getSheetDemoTiles, getSheetDemoChecklist, getPageBlank } from '../../assets/sheetData'

const emits = defineEmits(['authentication','copy','load','print','printOptions','howDoesItWork'])

const confirm = useConfirm()
const showFeedback = ref(false)
const showMenu = ref(false)
const showPrint = ref(false)
const showSignIn = ref(false)
const showWarning = ref(false)
const showSheets = ref(false)
const toast = useToast()
const user = ref(null)
const pageMode = ref('load')
let pageData = null;

const props = defineProps({
  pageData: { type: Object, default: null},
})

function confirmAndCopy() {
  confirm.require({
      message: 'Do you want to duplicate left page onto right?',
      header: "Mirror",
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        emits('copy')
      }
    })

}

function confirmAndLoad(title, sheet) {
  confirm.require({
      message: 'Do you want to replace both pages in the current sheet?',
      header: title,
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        emits('load', sheet)
      }
    })
}

function loadProps( props) {
  // console.log('Menu loadProps', JSON.stringify(props))
  pageData = props.pageData;
}

function onAuthentication(userParam) {
  // console.log('[Menu.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( userParam) {
    user.value = userParam
    emits('authentication', userParam)
  } else {
    toast.add({ severity: 'warn', summary: 'Engine Roughness', detail: 'Authentication failed', life: 3000});  
  }
}

function onFeedbackSent() {
  // console.log('[menu] onFeedbackSent')
  showFeedback.value = false
  toast.add({ severity: 'info', summary: 'Readback Correct', detail: 'Thanks for your feedback!', life: 3000});  
}

onMounted(() => {
  user.value = getCurrentUser()
  loadProps(props)
})  

function onPrint() {
  showPrint.value = true;
  toggleMenu()
  // printMode.value = !printMode.value
  // emits('flip')  
}

function onPrintClose() {
  // console.log('[Menu.onPrintClose]')
  showPrint.value = false;
}

function onPrintPrint(options) {
  showPrint.value = false;
  emits('print', options);
}

function onSheet(mode) {
  if( user.value) {
    // console.log("[Menu.onSaveAs] valid request")
    user.value = getCurrentUser()
    showSheets.value = true;
    pageMode.value = mode
  } else {
    showToast('warn','Squawk and Ident','Please sign in to use custom sheets')
  }
}

function onSheetDelete(sheet) {
  showToast('success', 'Clear', 'Sheet "' + sheet.name + '" deleted')
}

/**
 * Page dialog wants us to save the page
 * @param {*} sheet 
 */
 function onSheetLoad(sheet) {
  // console.log('[menu.onPageLoad]',pageName)
  showSheets.value = false
  const title = 'Load "' + sheet.name + '" Sheet'
  confirmAndLoad( title, sheet)
}

/**
 * Load demo or blank sheet
 * @param {*} sheetName 
 */
function onSheetLoadDefault(sheetName) {
  // console.log('[Menu.onSheetLoadDefault]', sheetName)
  showSheets.value = false
  let title = '?'
  let sheetData = {}
  if( sheetName == sheetNameDemoTiles) {
    title = 'Load Demo Tiles';
    sheetData = getSheetDemoTiles();
  } else if( sheetName == sheetNameDemoChecklist) {
    title = 'Load Demo Checklist';
    sheetData = getSheetDemoChecklist();
  } else if( sheetName == sheetNameNew) { 
    title = 'Start New Sheet';
    sheetData = getSheetBlank();
  } else if( sheetName == sheetNameReset) { 
    title = 'Reset Pages';
    // console.log('[Menu.onSheetLoadDefault]', JSON.stringify(pageData))
    if(pageData) {
      const blankFrontPage = getPageBlank( pageData[0].type)
      const blankBackPage = getPageBlank( pageData[1].type)
      sheetData = [blankFrontPage,blankBackPage];
    } else {
      sheetData = getSheetBlank()
    }
  }
  const sheet = {name:sheetName,data:sheetData}
  confirmAndLoad( title, sheet)
}

/**
 * Page Dialog wants to save a page
 * @param {*} sheet 
 */
 function onSheetSave(sheet) {
  // console.log('[menu.onPageSave]',pageName)
  showSheets.value = false;
  try {
      sheet.data = pageData;
      customSheetSave(sheet).then(() => {
        showToast('success','Clear','Sheet "' + sheet.name + '" saved')
      })
  } catch( e) {
    console.log('[Menu.onSheetSave]', e)
    showToast('error','Save Page','Could not save sheet "' + sheet.name + '"')
  }
}

function onSignOut() {
  setCurrentUser(null)
  user.value = null
  // notifiy parent
  emits('authentication',null)
}

function openBlog() {
  window.open( blogUrl, '_blank');
}


function showToast(severity, summary, detail) {
  toast.add({ severity: severity, summary: summary, detail: detail, life: 3000});  
}

// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
}

/**
 * Something has changed in the props
 */
watch( props, async() => {
  loadProps( props)
})


</script>

<template>

  <div class="container" :class="{grow: showMenu}">
    <ConfirmDialog />
    <Toast />
    <Feedback v-model:visible="showFeedback" :user="user" 
      @sent="onFeedbackSent" @close="showFeedback=false" />
    <Print v-model:visible="showPrint"
      @close="onPrintClose" @print="onPrintPrint" />
    <Warning v-model:visible="showWarning" @close="showWarning=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <Sheets v-model:visible="showSheets" :mode="pageMode" :user="user"
      @delete="onSheetDelete"
      @load="onSheetLoad" 
      @load-default="onSheetLoadDefault"
      @save="onSheetSave" />
    <div class="menuIcon" :class="{change: showMenu}" @click="toggleMenu">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
    <div v-show="showMenu" class="expandedMenu">
      <div class="buttonsList">
        <Button v-if="user" :label="user.name" icon="pi pi-user" title="Sign Out" class="active"
          @click="onSignOut"></Button>
        <Button v-else label="Sign In" icon="pi pi-user" title="Sign In to enable custom data"
          @click="showSignIn=true"></Button>
        <Button icon="pi pi-print" label="Print" title="Print the active sheet"
          @click="onPrint" />
        <div class="separator"></div>
        <Button label="Reset" icon="pi pi-file" title="Reset both pages" @click="onSheetLoadDefault(sheetNameReset)"></Button>
        <Button label="Load" icon="pi pi-folder-open" title="Open existing sheet" @click="onSheet('load')"></Button>
        <Button label="Save" icon="pi pi-save" title="Save this sheet" @click="onSheet('save')"></Button>
        <Button label="Demo" icon="pi pi-clipboard" title="Load demo tiles" @click="onSheetLoadDefault(sheetNameDemoTiles)"></Button>
        <div class="separator"></div>
        <Button label="Mirror" icon="pi pi-sign-out" title="Copy left page onto right" 
          @click="confirmAndCopy"></Button>
        <div class="separator"></div>
        <Button icon="pi pi-megaphone" title="Send Feedback"
          @click="showFeedback=true" ></Button>
        <Button icon="pi pi-exclamation-triangle" title="Warnings" severity="warning"
          @click="showWarning=true"></Button>
        <Button icon="pi pi-question"  title="How does it work?"
          @click="emits('howDoesItWork')"></Button>
        <Button label="Blog" @click="openBlog" title="Recent Features and Annoucements" link></button>
      </div>
    </div>
  </div>
</template>

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