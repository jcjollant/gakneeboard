<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './Feedback.vue';
import Sheets from './Sheets.vue'
import SignIn from './SignIn.vue';
import Warning from './Warning.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';
import { getBlankSheet, getCurrentUser, getDemoSheet, setCurrentUser, customSheetSave } from '../../assets/data'
import { sheetNameDemo, sheetNameReset } from '../../assets/data'

const emits = defineEmits(['authentication','copy','load','print','howDoesItWork'])

const confirm = useConfirm()
const printMode = ref(false)
const showFeedback = ref(false)
const showMenu = ref(false)
const showSignIn = ref(false)
const showWarning = ref(false)
const showSheets = ref(false)
const toast = useToast()
const user = ref(null)
const pageMode = ref('load')
let pageData = null;

const props = defineProps({
  pageData: { type: Object, default: null},
  user: { type: Object, default: null},
})

/**
 * Sends a message and hide the menu
 * @param {*} message 
 */
function emitAndClose(message) {
  // console.log('emitAndClose ' + message)
  emits(message)
  showMenu.value = false
}

function confirmAndLoad(title, sheet) {
  confirm.require({
      message: 'Do you want to replace all tiles in the current sheet?',
      header: title,
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        emits('load', sheet)
        showMenu.value = false
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
    showMenu.value = false
    emits('authentication', userParam)
  } else {
    toast.add({ severity: 'warn', summary: 'Engine Roughness', detail: 'Authentication failed', life: 3000});  
  }
}

function onFeedbackSent() {
  // console.log('[menu] onFeedbackSent')
  showMenu.value = false;
  showFeedback.value = false
  toast.add({ severity: 'info', summary: 'Readback Correct', detail: 'Thanks for your feedback!', life: 3000});  
}

onMounted(() => {
  user.value = getCurrentUser()
  loadProps(props)
})  

function onPrint() {
  printMode.value = !printMode.value
  emitAndClose('print')  
}

function onSheet(mode) {
  if( user.value) {
    // console.log("[Menu.onSaveAs] valid request")
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
  showSheets.value = false
  const title = (sheetName == sheetNameDemo ? 'Load Demo Tiles' : 'Reset All Tiles')
  const sheetData = sheetName == sheetNameDemo ? getDemoSheet() : getBlankSheet()
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
  window.open('https://ga-kneeboard.blogspot.com/', '_blank');
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
        <div class="separator"></div>
        <Button label="New" icon="pi pi-file" title="Reset all tiles on the sheet" @click="onSheetLoadDefault(sheetNameReset)"></Button>
        <Button label="Load" icon="pi pi-folder-open" title="Open existing sheet" @click="onSheet('load')"></Button>
        <Button label="Save" icon="pi pi-save" title="Save this sheet" @click="onSheet('save')"></Button>
        <Button label="Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" @click="onSheetLoadDefault(sheetNameDemo)"></Button>
        <div class="separator"></div>
        <Button label="Mirror" icon="pi pi-sign-out" title="Copy left page onto right" 
          @click="emitAndClose('copy')"></Button>
        <Button label="Flip" icon="pi pi-sort-alt" title="Flip right page vertically" :class="{active: printMode}" 
          @click="onPrint"></Button>
        <div class="separator"></div>
        <Button icon="pi pi-megaphone" title="Send Feedback"
          @click="showFeedback=true" ></Button>
        <Button icon="pi pi-exclamation-triangle" title="Warnings" severity="warning"
          @click="showWarning=true"></Button>
        <Button icon="pi pi-question"  title="How does it work?"
          @click="emits('howDoesItWork')"></Button>
        <div class="separator"></div>
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