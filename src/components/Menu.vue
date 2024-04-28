<script setup>
import {ref} from 'vue';
import {validate, getAirport} from '../assets/data.js'

const emits = defineEmits(['loadPage','showFeedback','showAbout'])
const showMenu = ref(false)

// Toggle menu visibility which will update component layout
function toggleMenu() {
    showMenu.value = !showMenu.value;
}

function onLoadPage( name) {
  emits('loadPage', name)
  showMenu.value = false
}

function validateData() {
  validate()
  showMenu.value = false
}

function emitAndClose(message) {
  // console.log('emitAndClose ' + message)
  emits(message)
  showMenu.value = false
}

</script>

<template>
  <div class="container">
    <div class="menuIcon" :class="{change: showMenu}" @click="toggleMenu">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
    </div>
    <div v-show="showMenu" class="expandedMenu">
      <div class="buttonsList">
        <button @click="onLoadPage('page1')">Page 1</button>
        <button @click="onLoadPage('page2')">Page 2</button>
        <div class="separator"></div>
        <button @click="onLoadPage('demo')">Demo Tiles</button>
        <button @click="onLoadPage('reset')">Reset Tiles</button>
        <div class="separator"></div>
        <button @click="emitAndClose('showFeedback')">Feedback</button>
        <button @click="emitAndClose('showAbout')">Warning</button>
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
}
.buttonsList {
  text-align: left;
    display: flex;
    flex-flow: row;
    gap:20px;
}
.menuIcon {
  display: inline-block;
  cursor: pointer;
}
.expandedMenu {
  position: relative;
  width: 100%;
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
</style>