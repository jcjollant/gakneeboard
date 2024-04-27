<script setup>
import {ref} from 'vue';
import {validate} from '../assets/data.js'
import axios from 'axios'

const emits = defineEmits(['loadPage'])
const displayMenu = ref(false)

const requestOptions = {
    method: "POST",
    headers: { "Authorization":"Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP"},
    mode : "no-cors",
    body: '{ locId: CLS }'
};

function fetchData() {
  axios.post('https://adip.faa.gov/agisServices/public-api/getAirportDetails',
    "{'locId':'CLS'}",
    { 
      headers:{ 
        'Authorization':'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP',
        "Content-Type": "text/plain"      
      },
      body:'{ locId: CLS }'
    })
    .then( response => console.log( response))
    .catch( error => console.log( error))

  // fetch('https://adip.faa.gov/agisServices/public-api/getAirportDetails', {
  //   method: 'POST',
  //   headers: { 
  //     'Authorization':'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP',
  //     "Content-Type": "text/plain"      
  //   },
  //   mode : "no-cors",
  //   body: '{ "locId": "CLS" }'

  // })
  //   .then( response => response.json()
  //     .then(data => console.log(data))
  //   )
  //   .catch( () => console.error("Could not fetch data"))

 }

// Toggle menu visibility which will update component layout
function toggleMenu() {
    displayMenu.value = !displayMenu.value;
}

function onLoadPage( name) {
  emits('loadPage')
  toggleMenu()
}

function validateData() {
  validate()
  toggleMenu()
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
            <button @click="onLoadPage('Demo')">Demo Page</button>
            <!-- <button @click="onLoadPage('KBFI')">KBFI</button> -->
            <!-- <button @click="validateData">Validate Data</button>
            <button @click="fetchData">Fetch</button> -->
            <!-- <button @click="onLoadPage('')">Reset</button> -->
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