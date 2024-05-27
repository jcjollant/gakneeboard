<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './Feedback.vue';
import SignIn from './SignIn.vue';
import Warning from './Warning.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';
import { getCurrentUser } from '../../assets/data'

const emits = defineEmits(['authentication','loadPage','print','showFeedback','showAbout'])

const activePage = ref('')
const confirm = useConfirm()
const printMode = ref(false)
const showFeedback = ref(false)
const showMenu = ref(false)
const showSignIn = ref(false)
const showWarning = ref(false)
const toast = useToast()
const user = ref(null)

const props = defineProps({
  page: { type: String, default: null},
  user: { type: Object, default: null},
})

function emitAndClose(message) {
  // console.log('emitAndClose ' + message)
  emits(message)
  showMenu.value = false
}

function getConfirmation(headerParam, pageName) {
  confirm.require({
      message: 'Do you want to replace all tiles in this page?',
      header: headerParam,
      rejectLabel: 'No',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        onLoadPage(pageName)
      }
    })
}


function loadProps( newProps) {
  // console.log('Menu loadProps ' + props.page)
  activePage.value = newProps.page;
}

function onAuthentication(userParam) {
  console.log('[Menu.onAuthentication] ' + JSON.stringify(userParam))
  showSignIn.value = false
  if( userParam) {
    user.value = userParam
    toast.add({ severity: 'success', summary: 'Clear', detail: 'Welcome ' + userParam.name, life: 3000});  
    showMenu.value = false
    emits('authentication', userParam)
  } else {
    toast.add({ severity: 'warn', summary: 'Engine Roughness', detail: 'Authentication failed', life: 3000});  
  }
}

function onDemo() {
  getConfirmation('Load Demo Tiles', 'demo')
}

function onFeedbackSent() {
  // console.log('[menu] onFeedbackSent')
  showMenu.value = false;
  showFeedback.value = false
  toast.add({ severity: 'info', summary: 'Readback Correct', detail: 'Thanks for your feedback!', life: 3000});  
}

function onLoadPage( name) {
  emits('loadPage', name)
  showMenu.value = false
}  

onMounted(() => {
  user.value = getCurrentUser()
  loadProps(props)
})  

function onPrint() {
  printMode.value = !printMode.value
  emitAndClose('print')  
}

function onReset() {
  getConfirmation('Reset All Tiles', 'reset')
}

function onSignOut() {
  emits('authentication',null)
  user.value = null
}

function openBlog() {
  window.open('https://ga-kneeboard.blogspot.com/', '_blank');
  // window.open('https://blogjollant.wordpress.com/', '_blank');  
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
    <ConfirmDialog></ConfirmDialog>
    <Toast />
    <Feedback v-model:visible="showFeedback" :user="user" @sent="onFeedbackSent" />
    <Warning v-model:visible="showWarning" @close="showWarning=false" />
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" @authentication="onAuthentication" />
    <div class="menuIcon" :class="{change: showMenu}" @click="toggleMenu">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
    <div v-show="showMenu" class="expandedMenu">
      <div class="buttonsList">
        <Button v-if="user" :label="user.name" icon="pi pi-user" title="Sign Out" class="active"
          @click="onSignOut">
        </Button>
        <Button v-else label="Sign In" icon="pi pi-user" title="Sign In to enable custom data"
          @click="showSignIn=true">
        </Button>
        <!-- <Button label="1" icon="pi pi-clipboard" title="Load Page 1 Tiles"
          @click="onLoadPage('page1')" :class="{active: activePage == 'page1'}"></Button>
        <Button label="2" icon="pi pi-clipboard" title="Load Page 2 Tiles"
          @click="onLoadPage('page2')" :class="{active: activePage == 'page2'}"></Button> -->
        <div class="separator"></div>
        <Button label="Print" icon="pi pi-print" title="Toggle Print Mode" :class="{active: printMode}" 
          @click="onPrint">
        </Button>
        <div class="separator"></div>
        <Button label="Reset" icon="pi pi-trash" title="Replace All Tiles" @click="onReset">
        </Button>
        <Button label="Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles"
          @click="onDemo">
        </Button>
        <div class="separator"></div>
        <Button label="Feedback" icon="pi pi-megaphone" title="Send Feedback"
          @click="showFeedback=true" ></Button>
        <Button label="Warnings" icon="pi pi-exclamation-triangle" title="Stuff You Should Know" severity="warning"
          @click="showWarning=true"></Button>
        <div class="separator"></div>
        <Button label="Blog" @click="openBlog" title="Recent Features" link></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
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
</style>