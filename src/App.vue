<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Menu from './components/Menu.vue'
import Widget from './components/Widget.vue'
import {onMounted,ref} from 'vue'

const demoPage = [
  {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':1,'name':'airport','data':{'code':'s43','rwy':'15L-33R'}},
  {'id':2,'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'id':3,'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'id':4,'name':'atis','data':{}},
  {'id':5,'name':'atis','data':{}},
  {'id':6,'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'id':7,'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'id':8,'name':'airport','data':{'code':'s43','rwy':'15L-33R'}},
  {'id':9,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':10,'name':'atis','data':{}},
  {'id':11,'name':'atis','data':{}},
]

var pageData = null;
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

function onLoadDemo() {
  onLoadPage( demoPage)
  savePageData();
}

function onLoadPage(data = demoPage) {
  // console.log( 'App loadPage ' + JSON.stringify(data))
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
  pageData = JSON.parse(localStorage.getItem('myPage'))
  // console.log('local storage page ' + JSON.stringify(pageData))
  onLoadPage(pageData)
})

function savePageData() {
  localStorage.setItem('myPage', JSON.stringify( pageData))
}

function updateWidget(widget) {
  // console.log('App : widget updated with ' + JSON.stringify(widget))
  pageData[widget.id] = widget;
  savePageData();
}

</script>

<template>
  <div class="menuContainer"><Menu class="menu" @load-page="onLoadDemo"></Menu></div>
  <div class="twoPages">
    <div class="onePage">
      <Widget v-for='widget in widgetsOne' :widget="widget.value" @load-widget="updateWidget"/>
    </div>
    <div class="onePage">
      <Widget v-for='widget in widgetsTwo' :widget="widget.value" @load-widget="updateWidget"/>
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
