<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Atis from './components/Atis.vue'
import Airport from './components/Airport.vue'
import Notes from './components/Notes.vue'
import Menu from './components/Menu.vue'
import List from './components/List.vue'
import Selector from './components/Selector.vue'
import {ref} from 'vue'
import * as data from './assets/data.js'

const template = ref('KBVS')

function onLoadTemplate(name) {
  // console.log( 'loadTemplate ' + name)
  template.value = name;
}

function onLoadWidget(name) {
  console.log('Load widget ' + name)
}

</script>

<template>
  <div class="menuContainer"><Menu class="menu" @load-template="onLoadTemplate"></Menu></div>
  <div class="twoPages" v-if="template=='KBVS'">
    <div class="onePage">
      <div><Airport :airport="data.airports['krnt']"/></div>
      <div><Airport :airport="data.airports['s43']"/></div>
      <div><Airport :airport="data.airports['kawo']"/></div>
      <div><Airport :airport="data.airports['kbvs']"/></div>
      <div><Atis/></div>
      <div><Atis/></div>
    </div>
    <div class="onePage">
      <div><Airport :airport="data.airports['kbvs']"/></div>
      <div><Airport :airport="data.airports['kawo']"/></div>
      <div><Airport :airport="data.airports['s43']"/></div>
      <div><Airport :airport="data.airports['krnt']"/></div>
      <div><Atis/></div>
      <div><Atis/></div>
    </div>
  </div>
  <div class="twoPages" v-if="template=='KBFI'">
    <div class="onePage">
      <div><Airport :airport="data.airports['krnt']"/></div>
      <div><Airport :airport="data.airports['kbfi']"/></div>
      <div><Atis/></div>
      <div><Atis/></div>
      <div><List :title="'Approach'" :items="'ATIS,Altimeter,Comms,Calls,Brief'"/></div>
      <div><Notes/></div>
    </div>
    <div class="onePage">
      <div><Selector @load-widget="onLoadWidget"/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes @click="data.validate()"/></div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.twoPages {
  display: grid;
  grid-template-columns: auto auto;
  gap: 80px;
}
.onePage {
  display: grid;
  grid-template-columns: auto auto;
  gap: 5px;
}
.menu {
  position: absolute;
  left:5px;
  top:5px;
}
</style>
