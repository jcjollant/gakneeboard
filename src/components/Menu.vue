<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog';
import Feedback from './Feedback.vue';
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';


const emits = defineEmits(['loadPage','showFeedback','showAbout'])

const showMenu = ref(false)
const activePage = ref('')
const showFeedback = ref(false)
const toast = useToast()
const confirm = useConfirm()

const props = defineProps({
  page: { type: String, default: null},
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

function onDemo() {
  getConfirmation('Load Demo Tiles', 'demo')
}

function onLoadPage( name) {
  emits('loadPage', name)
  showMenu.value = false
}

onMounted(() => {
  loadProps(props)
})

function onFeedbackSent() {
  // console.log('[menu] onFeedbackSent')
  showMenu.value = false;
  showFeedback.value = false
  toast.add({ severity: 'info', summary: 'Thank you', detail: 'Feedback sent', life: 3000});  
}

function onReset() {
  getConfirmation('Reset All Tiles', 'reset')
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
    <Feedback v-model:visible="showFeedback" @sent="onFeedbackSent"></Feedback>
    <div class="menuIcon" :class="{change: showMenu}" @click="toggleMenu">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
    <div v-show="showMenu" class="expandedMenu">
      <div class="buttonsList">
        <Button label="1" icon="pi pi-clipboard" class="menuButton"
          @click="onLoadPage('page1')" :class="{active: activePage == 'page1'}"></Button>
        <Button label="2" icon="pi pi-clipboard" class="menuButton"
          @click="onLoadPage('page2')" :class="{active: activePage == 'page2'}"></Button>
          <div class="separator"></div>
        <Button label="Demo" icon="pi pi-clipboard" class="menuButton"
          @click="onDemo" :class="{active: activePage == 'demo'}"></Button>
        <Button label="Reset" icon="pi pi-trash"  class="menuButton"
          @click="onReset"></Button>
        <div class="separator"></div>
        <Button label="Feedback" icon="pi pi-megaphone" class="menuButton"
          @click="showFeedback=true" ></Button>
        <Button label="Warnings" icon="pi pi-exclamation-triangle" class="menuButton"
          @click="emitAndClose('showAbout')"></Button>
        <!-- <div class="separator"></div>
        <button @click="getAirport('krnt')">Fetch</button> -->
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
.menuButton {
  color:white;
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
.version {
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  margin:auto;
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