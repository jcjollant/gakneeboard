<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Runway from './components/Runway.vue';
import {ref} from 'vue';


const airportCodes = defineModel()
const airportsList = ref([])
const airportsData = {
  'kbvs':{'airportCode':'KBVS', 'airportName':'Skagit Rgnl', 'elev':145, 'tpa':1100, 'weather':{'freq':'121.125','type':'AWOS-3'}, 'traffic':{'freq':'123.075','type':'CTAF'},'rwy1':{'name':'11','orientation':110,'pattern':'left'},'rwy2':{'name':'29','orientation':290,'pattern':'left'}},
  'krnt':{'airportCode':'KRNT', 'airportName':'Renton Muni', 'elev':32, 'tpa':1000, 'weather':{'freq':'126.950','type':'ATIS'}, 'traffic':{'freq':'124.700','type':'TWR'},'rwy1':{'name':'16','orientation':159,'pattern':'left'},'rwy2':{'name':'34','orientation':339,'pattern':'right'}},
  's50':{'airportCode':'S50', 'airportName':'Auburn Muni', 'elev':63, 'tpa':1100, 'weather':{'freq':'128.000','type':'PTT3'}, 'traffic':{'freq':'122.975','type':'CTAF'},'rwy1':{'name':'16','orientation':160,'pattern':'right'},'rwy2':{'name':'34','orientation':340,'pattern':'left'}},
  's43':{'airportCode':'S43', 'airportName':'Harvey Fld', 'elev':23, 'tpa':1000, 'weather':{'freq':'123.000','type':'PTT3'}, 'traffic':{'freq':'123.000','type':'CTAF'},'rwy1':{'name':'15L','orientation':150,'pattern':'right'},'rwy2':{'name':'33R','orientation':330,'pattern':'left'}}
}

// remove a code from the list
function remove(code) {
  // console.log( "Remove " + code);
  var array = airportsList.value;
  const index = array.indexOf(code);
  // console.log( "index of code " + index)
  if (index > -1) { // only splice array when item is found
    array.splice(index, 1); // 2nd parameter means remove one item only
    airportsList.value = array;
    // console.log(array)
  }
}

function onCodeUpdate(event) {
  // console.log(event.target.value)
  const tempCodes = event.target.value.toLowerCase().split(' ')

  tempCodes.forEach( tempCode => {
    // is this a valid and new code?
    if( airportsData[tempCode] !== undefined) {
      // console.log("Airport data found" )
      // console.log(airportsData[event.target.value]);
      if( !airportsList.value.includes(tempCode)) {
        airportsList.value.push( tempCode)
      }
    }
  })
}

</script>

<template>
  <input v-model="airportCodes" @input="onCodeUpdate" placeholder="Airport Code(s)" />
  <ul>
    <li v-for="code in airportsList"><div @click="remove(code)"><Runway :runway="airportsData[code]"/></div></li>
  </ul>
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
ul {
    list-style-type: none;
}
</style>
