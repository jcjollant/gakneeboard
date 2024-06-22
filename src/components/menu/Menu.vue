<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './Feedback.vue';
import Pages from './Pages.vue'
import SignIn from './SignIn.vue';
import Warning from './Warning.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';
import { getCurrentUser, setCurrentUser } from '../../assets/data'
import { sheetNameDemo, sheetNameReset } from '../../assets/data'

const emits = defineEmits(['authentication','loadPage','print','savePage','howDoesItWork'])

const activePage = ref('')
const confirm = useConfirm()
const printMode = ref(false)
const showFeedback = ref(false)
const showMenu = ref(false)
const showSignIn = ref(false)
const showWarning = ref(false)
const showPages = ref(false)
const toast = useToast()
const user = ref(null)
const pageMode = ref('load')

const props = defineProps({
  page: { type: String, default: null},
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

function getConfirmation(headerParam, pageName) {
  confirm.require({
      message: 'Do you want to replace all tiles in the current sheet?',
      header: headerParam,
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        emits('loadPage', pageName)
        showMenu.value = false
      }
    })
}


function loadProps( newProps) {
  // console.log('Menu loadProps ' + props.page)
  activePage.value = newProps.page;
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

function onLoad() {
  showPages.value = true
  pageMode.value = 'load'
}

/**
 * Page dialog wants us to save the page
 * @param {*} pageName 
 */
function onPageLoad(pageName) {
  // console.log('[menu.onPageLoad]',pageName)
  showPages.value = false
  const title = (pageName == sheetNameDemo ? 'Load Demo Tiles' : pageName == sheetNameReset ? 'Reset All Tiles' : 'Load "' + pageName + '" Sheet')
  getConfirmation( title, pageName)
}

/**
 * Page Dialog wants to save a page
 * @param {*} pageName 
 */
function onPageSave(pageName) {
  // console.log('[menu.onPageSave]',pageName)
  showPages.value = false;
  emits('savePage', pageName)
}
onMounted(() => {
  user.value = getCurrentUser()
  loadProps(props)
})  

function onPrint() {
  printMode.value = !printMode.value
  emitAndClose('print')  
}

function onSaveAs() {
  if( user.value) {
    // console.log("[Menu.onSaveAs] valid request")
    showPages.value = true;
    pageMode.value = 'save'
  } else {
    toast.add({ severity: 'warn', summary: 'Squawk and Ident', detail: 'Please sign in to save your pages', life: 3000});  
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


// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
}

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
    <Pages v-model:visible="showPages" :mode="pageMode" 
      @load="onPageLoad" @save="onPageSave" />
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
        <Button v-if="!user" label="Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" @click="onPageLoad(sheetNameDemo)"></Button>
        <Button v-if="!user" label="Reset" icon="pi pi-trash" title="Reset all tiles on the sheet" @click="onPageLoad(sheetNameReset)"></Button>
        <Button v-else="user" label="Load" icon="pi pi-folder-open" title="Open existing sheet" @click="onLoad"></Button>
        <Button label="Save" icon="pi pi-save" title="Save this sheet" @click="onSaveAs"></Button>
          <div class="separator"></div>
        <Button label="Print" icon="pi pi-print" title="Toggle Print Mode" :class="{active: printMode}" 
          @click="onPrint"></Button>
        <div class="separator"></div>
        <Button label="Feedback" icon="pi pi-megaphone" title="Send Feedback"
          @click="showFeedback=true" ></Button>
        <Button label="Warnings" icon="pi pi-exclamation-triangle" title="Stuff You Should Know" severity="warning"
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