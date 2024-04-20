<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Runway from './components/Runway.vue';
import {ref} from 'vue';


const airportCodes = defineModel()
const airportsList = ref([])
const airportsData = {
  'kbvs':{'airportCode':'KBVS', 'airportName':'Skagit Rgnl',    'elev':145, 'tpa':1100, 'weather':{'freq':'121.125','type':'AWOS-3'}, 'traffic':{'freq':'123.075','type':'CTAF'},'rwy':[{'name':'11-29',  'length':5480,'surface':{'type':'ASPH','condition':'EXCELLENT'},'11':{'orientation':110,'pattern':'left'},'29':{'orientation':290,'pattern':'left'}},{'name':'04-22','length':3000,'surface':{'type':'ASPH','condition':'POOR'},'04':{'orientation':40,'pattern':'left'},'22':{'orientation':220,'pattern':'left'}}]},
  'kpae':{'airportCode':'KPAE', 'airportName':'Paine FLD INTL', 'elev':607, 'tpa':1600, 'weather':{'freq':'128.650','type':'ATIS'},   'traffic':{'freq':'122.200','type':'TWR'}, 'rwy':[{'name':'16L-34R','length':3004,'surface':{'type':'ASPH','condition':'GOOD'},'16L':{'orientation':164,'pattern':'left'},'34R':{'orientation':344,'pattern':'right'}},{'name':'16R-34L','length':9010, 'surface':{'type':'ASPH','condition':'GOOD'},'16R':{'orientation':163,'pattern':'right'},'34L':{'orientation':343,'pattern':'left'}}]},
  'krnt':{'airportCode':'KRNT', 'airportName':'Renton Muni',    'elev':32,  'tpa':1000, 'weather':{'freq':'126.950','type':'ATIS'},   'traffic':{'freq':'124.700','type':'TWR'}, 'rwy':[{'name':'16-34',  'length':5382,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':159,'pattern':'left'},'34':{'orientation':339,'pattern':'right'}}]},
  's43': {'airportCode':'S43',  'airportName':'Harvey Fld',     'elev':23,  'tpa':1000, 'weather':{'freq':'123.000','type':'PTT3'},   'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'15L-33R','length':2672,'surface':{'type':'ASPH','condition':'EXCELLENT'},'15L':{'orientation':150,'pattern':'right'},'33R':{'orientation':330,'pattern':'left'}},{'name':'15R-33L','length':2430,'surface':{'type':'TURF','condition':'EXCELLENT'},'15R':{'orientation':150,'pattern':'right'},'33L':{'orientation':330,'pattern':'left'}}]},
  's50': {'airportCode':'S50',  'airportName':'Auburn Muni',    'elev':63,  'tpa':1100, 'weather':{'freq':'128.000','type':'PTT3'},   'traffic':{'freq':'122.975','type':'CTAF'},'rwy':[{'name':'16-34',  'length':3842,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':160,'pattern':'right'},'34':{'orientation':340,'pattern':'left'}}]},
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
  <ul>
    <li v-for="code in airportsList"><div ><Runway :airport="airportsData[code]"/></div></li>
  </ul>
  <input v-model="airportCodes" @input="onCodeUpdate" placeholder="Airport Code(s)" />
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
    columns: 2;
    border: 1px solid red;
    width: 500px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    
}
li {
  margin: 5px;
}
</style>
