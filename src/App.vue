<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Atis from './components/Atis.vue'
import Airport from './components/Airport.vue'
import Notes from './components/Notes.vue'
import Menu from './components/Menu.vue'
import List from './components/List.vue'
import Widget from './components/Widget.vue'
import {onMounted, ref} from 'vue'
import * as data from './assets/data.js'

const demoPage = [
  {'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'name':'airport','data':{'code':'s43','rwy':'15L-33R'}},
  {'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'name':'atis','data':{}},
  {'name':'atis','data':{}},
  {'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'name':'airport','data':{'code':'s43','rwy':'15L-33R'}},
  {'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'name':'atis','data':{}},
  {'name':'atis','data':{}},
]
const page = ref(demoPage)
const mode = ref('')


function onLoadPage(name) {
  // console.log( 'loadPage ' + name)
  if( name == 'Demo') {
    page.value = demoPage;
  } else if( name='') {
    const blankPage = [];
    for( n in 12) blankPage.push({'name':'','data':{}})
    console.log(blankPage)
    page.value = blankPage;
  }
}

function onEditPage() {
  console.log('Edit mode')
  if(mode.value == 'edit')
    mode.value = ''
  else
    mode.value = 'edit'
}

// onMounted(() =>(
//   // load first page
//   // onLoadPage('Demo')
// ))

</script>

<template>
  <div class="menuContainer"><Menu class="menu" @load-page="onLoadPage" @edit-page="onEditPage"></Menu></div>
  <div class="twoPages">
    <div class="onePage">
      <Widget :name="page[0].name" :data="page[0].data" :mode="mode"/>
      <Widget :name="page[1].name" :data="page[1].data" :mode="mode"/>
      <Widget :name="page[2].name" :data="page[2].data" :mode="mode"/>
      <Widget :name="page[3].name" :data="page[3].data" :mode="mode"/>
      <Widget :name="page[4].name" :data="page[4].data" :mode="mode"/>
      <Widget :name="page[5].name" :data="page[5].data" :mode="mode"/>
    </div>
    <div class="onePage">
      <Widget :name="page[6].name" :data="page[6].data" :mode="mode"/>
      <Widget :name="page[7].name" :data="page[7].data" :mode="mode"/>
      <Widget :name="page[8].name" :data="page[8].data" :mode="mode"/>
      <Widget :name="page[9].name" :data="page[9].data" :mode="mode"/>
      <Widget :name="page[10].name" :data="page[10].data" :mode="mode"/>
      <Widget :name="page[11].name" :data="page[11].data" :mode="mode"/>
    </div>
  </div>
  <!-- <div class="twoPages">
    <div class="onePage">
      <div><Airport :params="demoPage[0].data" :mode="mode"/></div>
      <div><Airport :params="demoPage[1].data"/></div>
      <div><Airport :params="demoPage[2].data"/></div>
      <div><Airport :params="demoPage[3].data"/></div>
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
  </div> -->
  <!-- <div class="twoPages" v-if="false">
    <div class="onePage">
      <div><Airport :airport="data.airports['krnt']"/></div>
      <div><Airport :airport="data.airports['kbfi']"/></div>
      <div><Atis/></div>
      <div><Atis/></div>
      <div><List :title="'Approach'" :items="'ATIS,Altimeter,Comms,Calls,Brief'"/></div>
      <div><Notes/></div>
    </div>
    <div class="onePage">
      <div><Widget @load-widget="onLoadWidget" :mode="mode"/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes @click="data.validate()"/></div>
    </div>
  </div> -->
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
