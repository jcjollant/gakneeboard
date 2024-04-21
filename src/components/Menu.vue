<script setup>
import {ref} from 'vue';

const emits = defineEmits(['loadTemplate'])
const displayMenu = ref(false)

// Toggle menu visibility which will update component layout
function toggleMenu() {
    displayMenu.value = !displayMenu.value;
}

function onLoadTemplate( name) {
    emits('loadTemplate',name)    
}
</script>

<template>
    <div class="container">
        <div class="menuIcon" :class="{change: displayMenu}" @click="toggleMenu">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>
        <div v-show="displayMenu" class="buttonsList">
            <button @click="onLoadTemplate('KBVS')">KBVS</button>
            <button @click="onLoadTemplate('KBFI')">KBFI</button>
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
    display: flex;
    flex-flow: row;
    gap:20px;
}
.menuIcon {
  display: inline-block;
  cursor: pointer;
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