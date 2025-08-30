
<template>
  <div v-if="format==TemplateFormat.FullPage" class="contentPage landscape">
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
    <div v-for="(line,index) in 16" class="grid line" :class="{'grey' : !(index % 2)}">
      <div v-for="cell in cells" :class="cell">&nbsp;</div>
    </div>
    <div class="grid">
      <div class="to waypointText blf">To</div>
      <div class="total bl">Totals</div>
      <div v-for="row in [0,1,2,3,4,5]" class="bl">&nbsp;</div>
    </div>
  </div>
  <div v-else class="contentPage">
    <Header title="Paper Navlog" :display-mode="false" @replace="emits('replace')" @click="onHeaderClick" />
    <div v-if="editMode" class="pad5">
      <InputGroup>
          <InputGroupAddon class="checklistNameAddon">Waypoints</InputGroupAddon>
          <InputText v-model="numlinesText" />
      </InputGroup>
      <ActionBar @cancel="onCancel" @apply="onApply" />
    </div>
    <div v-else>
      <div class="smallGrid">
        <div class="headingTop">Waypoint</div>
        <div class="heading compass bl" title="Compass Heading">Compass Heading</div>
        <div class="headingTop bl" title="Leg Distance">Dist.</div>
        <div class="headingTop bl" title="Ground Speed">GS</div>
        <div class="headingTop bl" title="Estimated Time Enroute">ETE</div>
        <div class="headingTop bl" title="Estimated Time of Arrival">ETA</div>
        <div class="headingTopSpan bl">Fuel</div>
        <div class="from waypointText">From</div>
        <div class="headingBottom distRemaining bl" title="Remaining Distance">Rem</div>
        <div class="headingBottom actualGS bl" title="Actual Ground Speed">Act.</div>
        <div class="headingBottom bl" title="Actual Time Enroute">Act.</div>
        <div class="headingBottom bl" title="Actual Time of Arrival">Act.</div>
        <div class="headingBottom fuelLeg bl">Leg</div>
        <div class="headingBottom fuelRem bl">Rem.</div>
      </div>
      <div v-for="(line,index) in numlines + 1 " class="smallGrid line" :class="{'grey' : !(index % 2)}">
        <div v-for="cell in cells" :class="cell">&nbsp;</div>
      </div>
      <div class="smallGrid bb">
        <div class="to waypointText">To</div>
        <div class="total bl">Totals</div>
        <div v-for="row in [0,1,2,3,4,5]" class="bl">&nbsp;</div>
      </div>
      <div class="waypointText">Notes</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { TemplateFormat } from '../../model/TemplateFormat'
import { useToaster } from '../../assets/Toaster';
import { useToast } from 'primevue/usetoast';

import ActionBar from '../shared/ActionBar.vue'
import Header from '../shared/Header.vue'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'


const editMode = ref(false)
const emits = defineEmits(['update','replace'])
const props = defineProps({
    format: { type: String, default: TemplateFormat.FullPage},
    data: { type: Object, default: null }
})

// create an array of 10 elements filled with 0
const cells = ref(<any>[])
const minWaypoints = 2
const maxWaypoints = 15
const numlines = ref(maxWaypoints)
const numlinesText = ref('')
const toaster = useToaster( useToast())

onMounted(() => {
  loadProps(props)
})

watch(props, (newVal) => {
  loadProps(newVal)
})

function loadProps(props:any) {
  if(props.data) {
    numlines.value = props.data.waypoints
  }
  // console.debug('[PaperNavlogPage.onMounted')
  if(props.format == TemplateFormat.FullPage) {
    cells.value = Array(7).fill('double  br')
            .concat(['single br','single','waypointBottom blf','double bl'])
            .concat(Array(4).fill('single bl'))  // Distance GS ETE ETA
            .concat(['double bl','double bl','mvCell br','single','waypoint blf'])
            .concat(Array(4).fill('single bl'))
  } else { // Small Format
    cells.value = ['waypointBottom','double bl'] // waypoint and Compass Heading
            .concat(Array(4).fill('single bl')) // Distance GS ETE ETA
            .concat(['double bl','double bl','waypoint'])
            .concat(Array(4).fill('single bl'))
  }
}

class NavlogConfig {
  waypoints:number;
  constructor(waypoints:number) {
    this.waypoints = waypoints
  }
}

function onApply() {
  try {
    const parsed = parseInt(numlinesText.value)
    // force a value between 3 and 16
    if(parsed < minWaypoints || parsed > maxWaypoints) {
      throw new Error('Invalid value')
    }
    numlines.value = parseInt(numlinesText.value)
    editMode.value = false
    const config = new NavlogConfig( numlines.value)
    emits('update', config)
  } catch( err) {
    toaster.error('Coming out broken', `Waypoints value out of range (${minWaypoints} ... ${maxWaypoints})`)
  }
}

function onCancel() {
  editMode.value = false
}

function onHeaderClick() {
  if(editMode.value) {
  } else {
    numlinesText.value = numlines.value.toString()
  }
  editMode.value = !editMode.value
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr) 2fr repeat(7, 1fr);
  font-size: 0.8rem;
}
.smallGrid {
  display: grid;
  grid-template-columns: 2fr repeat(7, 1fr);
  font-size: 0.8rem;
}
.bb {
  border-bottom: 1px solid darkgrey;
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
.line {
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
.grid .fuelLeg {
  grid-column: 16;
}
.grid .leg {
  grid-column: 9;
}
.grid .fuelRem {
  grid-column: 17;
}
.compass {
  font-size: 0.7rem;
}
.grid .distRemaining {
  grid-column: 12;
}

.double {
  grid-row: span 2;
  border-bottom: 1px solid darkgrey;
}
.single {
  border-bottom: 1px solid darkgrey;
}

.grid .waypoint {
  grid-column: 10;
}
.waypoint {
  background-color: white;
}
.grid .waypointBottom {
  grid-column: 10;
}
.smallGrid .waypointBottom {
  grid-column: 1;
}
.waypointBottom {
  border-bottom: 1px solid black;
  background-color: white;
}
.mvCell {
  grid-column: 8;
  border-bottom: 1px solid darkgrey;
}

.grid .waypointText {
  grid-column: 10;
  background-color: white;
}
.waypointText {
  font-size: 1rem;
  display: flex;
  justify-content: flex-start;
  padding-left: 5px;
  color: lightgrey;
  font-weight: bold;
}
.to {
  align-items: end;
  padding-bottom: 5px;
}
.grid .total {
  grid-column: 11;
}
.total {
  font-weight: bold;
  line-height: 38px;
}
</style>