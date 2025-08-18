
<template>
  <div class="contentPage landscape">
    <div class="grid">
      <div class="heading br" title="True Course">True Course</div>
      <div class="heading br" title="Altitude">Altitude</div>
      <div class="headingTopSpan br">Wind</div>
      <div class="heading br" title="Temperature">Temp.</div>
      <div class="heading br" title="True Airspeed">TAS</div>
      <div class="heading br" title="Wind Correction Angle">WCA</div>
      <div class="headingTop br" title="True Heading">TH</div>
      <div class="headingTop" title="Magnetic Heading">MH</div>
      <div class="headingTop blf">Waypoint</div>
      <div class="heading compass bl" title="Compass Heading">Compass Heading</div>
      <div class="headingTop bl" title="Leg Distance">Dist.</div>
      <div class="headingTop bl" title="Ground Speed">GS</div>
      <div class="headingTop bl" title="Estimated Time Enroute">ETE</div>
      <div class="headingTop bl" title="Estimated Time of Arrival">ETA</div>
      <div class="headingTopSpan bl">Fuel</div>
      <div class="headingBottom windDirection br" title="Wind Direction">Direc.</div>
      <div class="headingBottom br" title="Wind Speed">Speed</div>
      <div class="headingBottom br" title="Magnetic Variation">MV</div>
      <div class="headingBottom" title="Magnetic Deviation">MD</div>
      <div class="from waypointText blf">From</div>
      <div class="headingBottom distRemaining bl" title="Remaining Distance">Rem</div>
      <div class="headingBottom actualGS bl" title="Actual Ground Speed">Act.</div>
      <div class="headingBottom bl" title="Actual Time Enroute">Act.</div>
      <div class="headingBottom bl" title="Actual Time of Arrival">Act.</div>
      <div class="headingBottom fuelLeg bl">Leg</div>
      <div class="headingBottom fuelRem bl">Rem.</div>
    </div>
    <div v-for="(line,index) in lines" class="grid line" :class="{'grey' : !(index % 2)}">
      <div v-for="cell in cells" :class="cell">&nbsp;</div>
    </div>
    <div class="grid">
      <div class="to waypointText blf">To</div>
      <div class="total bl">Totals</div>
      <div v-for="row in [0,1,2,3,4,5]" class="bl">&nbsp;</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// create an array of 10 elements filled with 0
const lines = Array(16).fill(0)
//const rows = Array(16).fill(0)
// concatenate arrays
const cells =  Array(7).fill('double  br')
            .concat(['single br','single','waypointBottom blf','double bl'])
            .concat(Array(4).fill('single bl'))
            .concat(['double bl','double bl','mvCell br','single','waypoint blf'])
            .concat(Array(4).fill('single bl'))

// onMounted(() => {
//   // console.debug('[PaperNavlogPage.onMounted')
// })
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr) 2fr repeat(7, 1fr);
  font-size: 0.8rem;
}
.bl {
  border-left: 1px solid darkgrey;
}
.blf {
  border-left: 5px dashed darkgrey
}
.br {
  border-right: 1px solid darkgrey;
}
.grid.line {
  line-height: 20px;
}
.grey {
  background-color: lightgrey;
}
.heading {
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  grid-row: 1 / span 2;
}

.headingTopSpan {
  grid-row: 1;
  grid-column: span 2;
  border-top: 1px solid black;
}
.headingTop {
  grid-row: 1;
  border-top: 1px solid black;
  border-bottom: 1px solid darkgrey;
}
.headingBottom {
  grid-row: 2;
  border-bottom: 1px solid black;
}

.windDirection {
  grid-column: 3;
}
.from {
  grid-row: 2;
}
.fuelLeg {
  grid-column: 16;
}
.fuelRem {
  grid-column: 17;
}
.compass {
  font-size: 0.7rem;
}
.distRemaining {
  grid-column: 12;
}

.double {
  grid-row: span 2;
  border-bottom: 1px solid darkgrey;
}
.single {
  border-bottom: 1px solid darkgrey;
}

.waypoint {
  grid-column: 10;
  background-color: white;
  /* border-bottom: 1px solid white; */
}
.waypointBottom {
  grid-column: 10;
  border-bottom: 1px solid black;
  background-color: white;
}
.mvCell {
  grid-column: 8;
  border-bottom: 1px solid darkgrey;
}

.waypointText {
  font-size: 1rem;
  display: flex;
  justify-content: flex-start;
  padding-left: 5px;
  color: lightgrey;
  grid-column: 10;
  font-weight: bold;
}
.to {
  align-items: end;
  padding-bottom: 5px;
  /* border-bottom: 1px solid darkgrey; */
}
.total {
  grid-column: 11;
  font-weight: bold;
  line-height: 38px;
}
</style>