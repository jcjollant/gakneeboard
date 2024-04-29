<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Menu from './components/Menu.vue'
import Widget from './components/Widget.vue'
import Feedback from './components/Feedback.vue';
import About from './components/About.vue';
import {onMounted,ref} from 'vue'
import {demoPage,blankPage} from './assets/data.js'
import { inject } from "@vercel/analytics"

var pageData = null;
var currentPage = 'page1';
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
const showFeedback = ref()
const showAbout = ref()

function onLoadPage(name) {
  // console.log('onLoadPage ' + JSON.stringify(name))
  let newPageData = blankPage
  if( name=='page1' || name =='page2') {
    currentPage = name;
    let data = localStorage.getItem(currentPage);
    if( data == null) { // first time around, default to demo
      newPageData = demoPage
    } else {
      newPageData = JSON.parse(data)
    }

  } else if( name == 'demo') {
    newPageData = demoPage;
  }
  onLoadPageData(newPageData)
  savePageData();
}

function onLoadPageData(data) {
  // console.log( 'App loadPageData ' + JSON.stringify(data))
  if( data == null) data = demoPage;
  widget0.value = data[0]
  widget1.value = data[1];
  widget2.value = data[2];
  widget3.value = data[3];
  widget4.value = data[4];
  widget5.value = data[5];
  widget6.value = data[6];
  widget7.value = data[7];
  widget8.value = data[8];
  widget9.value = data[9];
  widget10.value = data[10];
  widget11.value = data[11];
  pageData = data;
}

onMounted(() => {
  onLoadPage(currentPage)
  inject();
  // console.log( Object.keys(airports).join(', ').toUpperCase());
})

function savePageData() {
  localStorage.setItem(currentPage, JSON.stringify( pageData))
}

function updateWidget(widget) {
  // console.log('App : widget updated with ' + JSON.stringify(widget))
  pageData[widget.id] = widget;
  savePageData();
}

</script>

<template>
  <div class="menuContainer">
    <Menu class="menu" @load-page="onLoadPage" 
      @show-feedback="showFeedback=true" 
      @show-about="showAbout=true">
    </Menu>
  </div>
  <div class="twoPages">
    <div class="onePage">
      <Widget v-for='widget in widgetsOne' :widget="widget.value" @update="updateWidget"/>
    </div>
    <div class="onePage">
      <Widget v-for='widget in widgetsTwo' :widget="widget.value" @update="updateWidget"/>
    </div>
  </div>
  <Feedback :v-if="showFeedback" :isOpen="showFeedback" name='feedback-modal' @close="showFeedback=false"/>
  <About :v-if="showAbout" :isOpen="showAbout" name='about-modal' @close="showAbout=false"/>
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
