<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Runway from './components/Runway.vue';

const kbvs = {'airportCode':'KBVS', 'airportName':'Skagit Rgnl', 'elev':145, 'tpa':1100, 'weather':{'freq':'121.125','type':'AWOS-3'}, 'traffic':{'freq':'123.075','type':'CTAF'},'rwy1':{'name':'11','orientation':110,'pattern':'left'},'rwy2':{'name':'29','orientation':290,'pattern':'left'}}
const krnt = {'airportCode':'KRNT', 'airportName':'Renton Muni', 'elev':32, 'tpa':1000, 'weather':{'freq':'126.950','type':'ATIS'}, 'traffic':{'freq':'124.700','type':'TWR'},'rwy1':{'name':'16','orientation':159,'pattern':'left'},'rwy2':{'name':'34','orientation':339,'pattern':'right'}}
const s50 = {'airportCode':'S50', 'airportName':'Auburn Muni', 'elev':63, 'tpa':1100, 'weather':{'freq':'128.000','type':'PTT3'}, 'traffic':{'freq':'122.975','type':'CTAF'},'rwy1':{'name':'16','orientation':160,'pattern':'right'},'rwy2':{'name':'34','orientation':340,'pattern':'left'}}
const s43 = {'airportCode':'S43', 'airportName':'Harvey Fld', 'elev':23, 'tpa':1000, 'weather':{'freq':'123.000','type':'PTT3'}, 'traffic':{'freq':'123.000','type':'CTAF'},'rwy1':{'name':'15','orientation':150,'pattern':'right'},'rwy2':{'name':'33','orientation':330,'pattern':'left'}}

</script>

<template>
  <Runway :runway="kbvs"/>
  <Runway :runway="s43"/>
  <Runway :runway="krnt"/>
  <Runway :runway="s50"/>
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
</style>
