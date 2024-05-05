<script setup>
import { watch } from 'vue';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button'

const emits = defineEmits(['loadPage','showFeedback','showAbout'])
const showMenu = ref(false)
const activePage = ref('')

const props = defineProps({
    page: { type: String, default: null}, // expects {'code':'ICAO','rwy':'XX-YY'}
})


// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
}

function loadProps( newProps) {
  // console.log('Menu loadProps ' + props.page)
  activePage.value = newProps.page;
}

function onLoadPage( name) {
  emits('loadPage', name)
  showMenu.value = false
}

onMounted(() => {
  loadProps(props)
})

function emitAndClose(message) {
  // console.log('emitAndClose ' + message)
  emits(message)
  showMenu.value = false
}

watch( props, async() => {
  loadProps( props)
})

</script>

<template>
  <div class="container" :class="{grow: showMenu}">
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
        <Button label="Demo" icon="pi pi-clipboard" class="menuButton"
          @click="onLoadPage('demo')" :class="{active: activePage == 'demo'}"></Button>
        <div class="separator"></div>
        <Button label="Reset" icon="pi pi-trash"  class="menuButton"
          @click="onLoadPage('reset')" />
        <div class="separator"></div>
        <Button label="Feedback" icon="pi pi-megaphone" class="menuButton"
          @click="emitAndClose('showFeedback')" ></Button>
        <Button label="Warning" icon="pi pi-exclamation-triangle" class="menuButton"
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