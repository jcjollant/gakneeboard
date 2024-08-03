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
import { customSheetSave, keyUser } from '../../assets/data'
import { blogUrl, getCurrentUser, setCurrentUser, sheetGetList } from '../../assets/data'
import { getSheetBlank, getSheetDemoTiles } from '../../assets/sheetData'
import { getToastData, toastError, toastSuccess, toastWarning, toastInfo } from '../../assets/toast'

const emits = defineEmits(['authentication','copy','load','print','printOptions','howDoesItWork','toast'])

const confirm = useConfirm()
const showFeedback = ref(false)
const showMenu = ref(false)
const showPrint = ref(false)
const showSignIn = ref(false)
const showWarning = ref(false)
const showSheets = ref(false)
const user = ref(null)
const pageMode = ref('load')
let pageData = null;

//---------------------
// Props management
const props = defineProps({
  pageData: { type: Object, default: null},
})

function loadProps( props) {
  // console.log('Menu loadProps', JSON.stringify(props))
  pageData = props.pageData;
}

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------

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


function onAuthentication(newUser) {
  // console.log('[Menu.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( newUser) {
    userChange(newUser)
    emits('toast', getToastData( 'Clear', 'Welcome ' + newUser.name))
  } else {
    emits('toast', getToastData('Engine Roughness', 'Authentication failed', toastWarning));  
  }
}

function onFeedbackSent() {
  // console.log('[menu] onFeedbackSent')
  showFeedback.value = false
  showToast('Readback Correct', 'Thanks for your feedback!', toastInfo)
}

onMounted( () => {
  userChange(getCurrentUser(), false)
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

function onSheetDialog(mode) {
  if( user.value) {
    // console.log("[Menu.onSaveAs] valid request")
    showSheets.value = true;
    pageMode.value = mode
  } else {
    showToast('Squawk and Ident','Please sign in to use custom sheets', toastWarning)
  }
}

/**
 * Hide the sheet dialog
 */
function onSheetClose() {
  showSheets.value = false;
}

// a sheet has been deleted, it should be removed from the user
function onSheetDelete(sheet) {
    if(!user.value || !user.value.sheets) return;

    const newList = user.value.sheets.filter( s => s.id != sheet.id)
    userUpdateSheets(newList);
    showToast('Clear', 'Sheet "' + sheet.name + '" deleted')
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
 * Page Dialog wants to save a page
 * @param {*} sheet 
 */
 async function onSheetSave(sheet) {
  // console.log('[Menu.onSheetSave]',JSON.stringify(sheet))
  showSheets.value = false;
  try {
      sheet.data = pageData;
      await customSheetSave(sheet).then(returnSheet => {
        // console.log('[Menu.onSheetSave]', JSON.stringify(returnSheet))
        showToast('Clear','Sheet "' + returnSheet.name + '" saved')
        if(returnSheet.publish && returnSheet.code) {
          showToast('Published', 'Sheet is accessible with code ' + returnSheet.code)
        }
        userUpdateSheets(getCurrentUser().sheets)
      })
  } catch( e) {
    // console.log('[Menu.onSheetSave]', e)
    showToast('Save Page','Could not save sheet "' + sheet.name + '"', toastError)
  }
}

function onSignOut() {
  userChange(null)
  // reload the page
  location.reload()
}

function onToast(data) {
  emits('toast', data)
}

function openBlog() {
  window.open( blogUrl, '_blank');
}


function showToast( summary, detail, severity=toastSuccess) {
  emits('toast', getToastData(summary, detail, severity))
}

// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
}

/**
 * A new user should be considered
 * @param {*} newUser 
 * @param {*} save Save Cookie and update user in data.
 */
function userChange(newUser, save=true) {
  user.value = newUser

  // request sheets after waiting 2 seconds
  if(newUser) {
    // save the cookie
    if(save) {
      setCurrentUser(newUser)
      localStorage.setItem(keyUser,JSON.stringify(newUser))
    }

    setTimeout( async () => {
      // console.log( '[data.setCurrentUser] refreshing sheets')
      const sheets = await sheetGetList();
      // console.log('[Menu.onMounted] sheets', JSON.stringify(sheets))
      userUpdateSheets(sheets)
    }, 2000)
  } else {
    if(save) {
      setCurrentUser(null)
      // remove the cookie
      localStorage.removeItem(keyUser)

    }
  }

}

function userUpdateSheets(newList) {
  if(!user.value) return;
  const tempUser = JSON.parse(JSON.stringify(user.value))
  tempUser.sheets = newList;
  user.value = tempUser
  // console.log('[Menu.userUpdateSheets] new list', JSON.stringify(newList))
}

</script>

<template>

  <div class="container" :class="{grow: showMenu}">
    <ConfirmDialog />
    <Feedback v-model:visible="showFeedback" :user="user" 
      @sent="onFeedbackSent" @close="showFeedback=false" />
    <Print v-model:visible="showPrint"
      @close="onPrintClose" @print="onPrintPrint" />
    <Warning v-model:visible="showWarning" @close="showWarning=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" 
      @authentication="onAuthentication" />
    <Sheets v-model:visible="showSheets" :mode="pageMode" :user="user"
      @close="onSheetClose"
      @delete="onSheetDelete"
      @load="onSheetLoad" 
      @save="onSheetSave"
      @toast="onToast" />
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
        <Button label="New" icon="pi pi-file" title="Reset both pages" @click="onSheetLoad(getSheetBlank())"></Button>
        <Button label="Load" icon="pi pi-folder-open" title="Open existing sheet" @click="onSheetDialog('load')"></Button>
        <Button label="Save" icon="pi pi-save" title="Save this sheet" @click="onSheetDialog('save')"></Button>
        <Button label="Demo" icon="pi pi-clipboard" title="Load demo tiles" @click="onSheetLoad(getSheetDemoTiles())"></Button>
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