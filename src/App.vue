<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import Atis from './components/Atis.vue'
import Runway from './components/Runway.vue';
import Notes from './components/Notes.vue'
import Menu from './components/Menu.vue'
import {ref} from 'vue';

const airportsList = ref([])
const airportsData = {
  'kawo':{'airportCode':'KAWO', 'airportName':'Arlington Muni', 'elev':142, 'tpa':1100, 'weather':{'freq':'135.625','type':'AWOS-3PT'}, 'traffic':{'freq':'122.725','type':'CTAF'},'rwy':[{'name':'11-29',  'length':3498,'surface':{'type':'ASPH','condition':'EXCELLENT'},'11':{'orientation':110,'pattern':'right'},'29':{'orientation':290,'pattern':'left'}},{'name':'16-34',  'length':5332,'surface':{'type':'ASPH','condition':'EXCELLENT'},'16':{'orientation':162,'pattern':'right'},'34':{'orientation':343,'pattern':'left'}}]},
  'kbfi':{'airportCode':'KBFI', 'airportName':'Boeing Fld',     'elev':22,  'tpa':1000, 'weather':{'freq':'127.750','type':'ATIS'},     'traffic':{'freq':'118.300','type':'TWR'}, 'rwy':[{'name':'14L-32R','length':3709,'surface':{'type':'ASPH','condition':'FAIR'},'freq':'118.300','14L':{'orientation':135,'pattern':'left'},'32R':{'orientation':315,'pattern':'right'}},{'name':'14R-32L','length':10007,'surface':{'type':'ASPH','condition':'GOOD'},'freq':'120.6','14R':{'orientation':135,'pattern':'right'},'32L':{'orientation':315,'pattern':'left'}}]},
  'kbvs':{'airportCode':'KBVS', 'airportName':'Skagit Rgnl',    'elev':145, 'tpa':1100, 'weather':{'freq':'121.125','type':'AWOS-3'},   'traffic':{'freq':'123.075','type':'CTAF'},'rwy':[{'name':'11-29',  'length':5480,'surface':{'type':'ASPH','condition':'EXCELLENT'},'11':{'orientation':110,'pattern':'left'},'29':{'orientation':290,'pattern':'left'}},{'name':'04-22','length':3000,'surface':{'type':'ASPH','condition':'POOR'},'04':{'orientation':40,'pattern':'left'},'22':{'orientation':220,'pattern':'left'}}]},
  'keln':{'airportCode':'KELN', 'airportName':'Bowers Fld',     'elev':1763,'tpa':2800, 'weather':{'freq':'118.375','type':'ASOS'},     'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'11-29',  'length':4300,'surface':{'type':'CONC','condition':'GOOD'},'11':{'orientation':117,'pattern':'left'},'29':{'orientation':297,'pattern':'left'}}]},
  'kesw':{'airportCode':'KESW', 'airportName':'Easton State',   'elev':2226,'tpa':3200, 'weather':{'freq':'135.275','type':'ASOS'},     'traffic':{'freq':'122.900','type':'CTAF'},'rwy':[{'name':'09-27',  'length':2640,'surface':{'type':'TURF','condition':'GOOD'},'09':{'orientation':98,'pattern':'left'},'27':{'orientation':278,'pattern':'left'}}]},
  'kpae':{'airportCode':'KPAE', 'airportName':'Paine Fld Intl', 'elev':607, 'tpa':1600, 'weather':{'freq':'128.650','type':'ATIS'},     'traffic':{'freq':'122.200','type':'TWR'}, 'rwy':[{'name':'16L-34R','length':3004,'surface':{'type':'ASPH','condition':'GOOD'},'16L':{'orientation':164,'pattern':'left'},'34R':{'orientation':344,'pattern':'right'}},{'name':'16R-34L','length':9010, 'surface':{'type':'ASPH','condition':'GOOD'},'16R':{'orientation':163,'pattern':'right'},'34L':{'orientation':343,'pattern':'left'}}]},
  'kplu':{'airportCode':'KPLU', 'airportName':'Pierce Country', 'elev':537, 'tpa':1500, 'weather':{'freq':'128.575','type':'AWOS-3'},   'traffic':{'freq':'122.700','type':'CTAF'},'rwy':[{'name':'17-35',  'length':3651,'surface':{'type':'ASPH','condition':'GOOD'},'17':{'orientation':165,'pattern':'left'},'35':{'orientation':345,'pattern':'left'}}]},
  'krnt':{'airportCode':'KRNT', 'airportName':'Renton Muni',    'elev':32,  'tpa':1000, 'weather':{'freq':'126.950','type':'ATIS'},     'traffic':{'freq':'124.700','type':'TWR'}, 'rwy':[{'name':'16-34',  'length':5382,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':159,'pattern':'left'},'34':{'orientation':339,'pattern':'right'}}]},
  's43': {'airportCode':'S43',  'airportName':'Harvey Fld',     'elev':23,  'tpa':1000, 'weather':{'freq':'-.-','type':'n/a'},          'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'15L-33R','length':2672,'surface':{'type':'ASPH','condition':'EXCELLENT'},'15L':{'orientation':150,'pattern':'right'},'33R':{'orientation':330,'pattern':'left'}},{'name':'15R-33L','length':2430,'surface':{'type':'TURF','condition':'EXCELLENT'},'15R':{'orientation':150,'pattern':'right'},'33L':{'orientation':330,'pattern':'left'}}]},
  's50': {'airportCode':'S50',  'airportName':'Auburn Muni',    'elev':63,  'tpa':1100, 'weather':{'freq':'128.000','type':'PTT3'},     'traffic':{'freq':'122.975','type':'CTAF'},'rwy':[{'name':'16-34',  'length':3842,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':160,'pattern':'right'},'34':{'orientation':340,'pattern':'left'}}]},
}
const template = ref('KBVS')

function testKey(key, code) {
  if( !(key in airportsData[code])) console.log( key +' missing from ' + code);

}
function testRunway(rwy, rwys, code) {
  if(!(rwy in rwys)) console.log('runway ' + JSON.stringify(rwy) + ' is declared but is not listed at ' + code)
  // test this runway has an orientation and pattern
  if(!('orientation' in rwys[rwy])) console.log('runway ' + JSON.stringify(rwy) + ' is missing orientation at ' + code)
  if(!('pattern' in rwys[rwy])) console.log('runway ' + JSON.stringify(rwy) + ' is missing pattern at ' + code)
  const pattern = rwys[rwy]['pattern'];
  if( pattern != 'left' && pattern != 'right') console.log('pattern value ' + pattern + ' is invalid for runway ' + rwy + ' at ' + code)
}

function validateAirportData() {
  Object.keys(airportsData).forEach((code)=>{
    // console.log('validating ' + code);
    // we want all the essential fields
    testKey('airportCode', code);
    testKey('airportName', code);
    testKey('elev', code);
    testKey('tpa', code);
    testKey('weather', code);
    testKey('traffic', code);
    testKey('rwy', code);
    // traffic pattern consistency
    if( airportsData[code].tpa - airportsData[code].elev > 1100) console.log('traffic pattern is too high at ' + code);
    if( airportsData[code].tpa - airportsData[code].elev < 900) console.log('traffic pattern is too low at ' + code);
    // test weather has a frequency and a type
    if( !('freq' in airportsData[code].weather)) console.log('weather is missing frequency at ' + code);
    if( !('type' in airportsData[code].weather)) console.log('weather is missing type at ' + code);
    // test trafic has a frequency and a type
    if( !('freq' in airportsData[code].traffic)) console.log('traffic is missing frequency at ' + code);
    if( !('type' in airportsData[code].traffic)) console.log('traffic is missing type at ' + code);
    // test runways are all showing up
    airportsData[code].rwy.forEach((rwys)=>{
      if(!('name' in rwys)) console.log( 'runway ' + JSON.stringify(rwys) + ' is missing a name at ' + code);
      if(!('length' in rwys)) console.log( 'runway ' + JSON.stringify(rwys) + ' is missing a length at ' + code);
      if(!('surface' in rwys)) console.log( 'runway ' + JSON.stringify(rwys) + ' is missing a surface at ' + code);
      if(!('type' in rwys['surface'])) console.log( 'runway ' + JSON.stringify(rwys) + ' is missing a surface type at ' + code);     
      if(!('condition' in rwys['surface'])) console.log( 'runway ' + JSON.stringify(rwys) + ' is missing a surface condition at ' + code);     
      var [rwyA,rwyB] = rwys.name.split('-');
      // test each runway has an entry
      testRunway(rwyA, rwys, code);
      testRunway(rwyB, rwys, code);
    })
  })
  console.log('Airport data validation complete')
}

function onLoadTemplate(name) {
  // console.log( 'loadTemplate ' + name)
  template.value = name;
}

</script>

<template>
  <div class="menuContainer"><Menu class="menu" @load-template="onLoadTemplate"></Menu></div>
  <div class="twoPages" v-if="template=='KBVS'">
    <div class="onePage">
      <div><Runway :airport="airportsData['krnt']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['s43']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['kawo']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['kbvs']" :rwyIndex="0"/></div>
      <div><Atis/></div>
      <div><Notes/></div>
    </div>
    <div class="onePage">
      <div><Runway :airport="airportsData['kbvs']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['kawo']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['s43']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['krnt']" :rwyIndex="0"/></div>
      <div><Atis/></div>
      <div><Notes @click="validateAirportData"/></div>
    </div>
  </div>
  <div class="twoPages" v-if="template=='KBFI'">
    <div class="onePage">
      <div><Runway :airport="airportsData['krnt']" :rwyIndex="0"/></div>
      <div><Runway :airport="airportsData['kbfi']" :rwyIndex="0"/></div>
      <div><Atis/></div>
      <div><Atis/></div>
      <div><Notes/></div>
      <div><Notes/></div>
    </div>
    <div class="onePage">
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes/></div>
      <div><Notes @click="validateAirportData"/></div>
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
