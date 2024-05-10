<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Menu from './components/Menu.vue'
import Widget from './components/Tile.vue'
import {onMounted,ref} from 'vue'
import { getDemoPage, getBlankPage } from './assets/data.js'
import { inject } from "@vercel/analytics"

var pageData = null;
const currentPage = ref('page1')
const widget0 = ref({})
const widget1 = ref({})
const widget2 = ref({})
const widget3 = ref({})
const widget4 = ref({})
const widget5 = ref({})
const widget6 = ref({})
const widget7 = ref({})
const widget8 = ref({})
const widget9 = ref({})
const widget10 = ref({})
const widget11 = ref({})
const widgetsOne = [widget0,widget1,widget2,widget3,widget4,widget5]
const widgetsTwo = [widget6,widget7,widget8,widget9,widget10,widget11]
const allWidgets = widgetsOne.concat(widgetsTwo)

// update all widgets with provided data
async function loadPageData(data) {
  // console.log( 'App loadPageData ' + JSON.stringify(data))

  // if we don't know what to show, we load a copy of the demo page
  if( data == null) data = getDemoPage();

  allWidgets.forEach((widget, index) => {
      widget.value = data[index];
  });
  pageData = data;
  savePageData();
}

function onMenuLoadPage(name) {
  // console.log('onLoadPage ' + JSON.stringify(name))
  let newPageData = null
  if( name=='page1' || name =='page2') {
    currentPage.value = name;
    let data = localStorage.getItem(name);
    if( data && data != 'undefined') { // first time around
      loadPageData( JSON.parse(data))
    } else {
      loadPageData( getDemoPage())
    }
  } else if( name=='demo') {
    loadPageData( getDemoPage())
  } else if( name=='reset') {
    loadPageData( getBlankPage())
  } else {
    console.log('unknown page ' + name)
  }
}

onMounted(() => {
  onMenuLoadPage(currentPage.value)
  inject();
  // console.log( Object.keys(airports).join(', ').toUpperCase());
})

// save page data if it's page 1 or 2
function savePageData() {
  localStorage.setItem(currentPage.value, JSON.stringify( pageData))
}

function updateWidget(widget) {
  // console.log('App : widget updated with ' + JSON.stringify(widget))
  pageData[widget.id] = widget;
  savePageData();
}

</script>

<template>
  <div class="twoPages">
    <div class="onePage">
      <Widget v-for='widget in widgetsOne' :widget="widget.value" @update="updateWidget"/>
    </div>
    <div class="onePage">
      <Widget v-for='widget in widgetsTwo' :widget="widget.value" @update="updateWidget"/>
    </div>
  </div>
  <div class="menuContainer">
    <Menu class="menu" :page="currentPage"
      @load-page="onMenuLoadPage" 
      @show-feedback="showFeedback=true" 
      @show-about="showAbout=true">
    </Menu>
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
