<script setup>
import { ref, onMounted, watch } from 'vue'
import { Airport, Runway } from '../../assets/Airport'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import FieldSet from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import ToggleButton from 'primevue/togglebutton'
import { saveCustomAirport, getCtafFreq, getGroundFrequency, getWeatherFrequency } from '../../assets/data'

const emits = defineEmits(["close","updated"]);

const user = ref("JC")
const code = ref("")
const name = ref("")
const elevation = ref(0)
const ctaf = ref(null)
const tower = ref(null)
const ground = ref(null)
const weather = ref(null)
const rwyLength = ref(null)
const rwyWidth = ref(null)
const rwyEnd0 = ref("")
const rwyEnd1 = ref("")
const rwy0RightPattern = ref(false)
const rwy1RightPattern = ref(false)
const runways = ref([])
const toast = useToast()

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */
const props = defineProps({
    airport: { type: Object, default: null},
})

function loadProps(props) {
      // console.log('[CustomAirport.loadProps] ' + JSON.stringify(props))
      if( props.airport) {
            code.value = props.airport.code;
            name.value = props.airport.name;
            elevation.value = props.airport.elev;
            ctaf.value = getCtafFreq( props.airport.freq)
            weather.value = getWeatherFrequency( props.airport.freq)
            ground.value = getGroundFrequency( props.airport.freq)
            runways.value = props.airport.rwys
      }
}

onMounted(() => {
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})
/**
 * End of props management
 */



function errorToast( title, details) {
      toast.add({ 
            severity: 'error', 
            summary: title, 
            detail: details, 
            life: 3000
      });  
}

function onAddRunway() {
      // prepend with 0 on single value
      if(rwyEnd0.value.length == 1) rwyEnd0.value = '0' + rwyEnd0.value
      if(rwyEnd1.value.length == 1) rwyEnd1.value = '0' + rwyEnd1.value

      const rwyName = rwyEnd0.value + '-' + rwyEnd1.value
      if( Runway.isValidName(rwyName)) {
            const runway = new Runway(rwyName,rwyLength.value,rwyWidth.value)
            runway.setTrafficPattern( rwyEnd0.value, rwy0RightPattern)
            runway.setTrafficPattern( rwyEnd1.value, rwy1RightPattern)
            runways.value.push(runway)
      } else {
            errorToast( 'Cannot Add Runway', 'Invalid runway name ' + rwyName);  
      }
}

async function onSave() {
      // normalize code to upper case
      code.value = code.value.toUpperCase()
      const errorTitle = "Cannot Save Airport"

      if( !Airport.isValidCode( code.value)) {
            errorToast(errorTitle, "Invalid airport code (" + code.value + ")")
            return
      }

      // make
      if( runways.value.length == 0) {
            errorToast(errorTitle, "Please add at least one runway to the airport")
            return
      }

      const airport = new Airport( code.value, name.value, elevation.value)
      airport.addFrequency( 'CTAF', ctaf.value)
      airport.addFrequency( 'TWR', tower.value)
      airport.addFrequency( 'Weather', weather.value)
      airport.addFrequency( 'GND', ground.value)
      airport.addRunways(runways.value)

      console.log( "[CustomAirport] onSave aiport " + JSON.stringify(airport))
      await saveCustomAirport( airport)
      emits('updated',code.value)
}

</script>

<template>
      <Dialog v-if="user" modal header="Custom Airport">
            <Toast />
            <FieldSet legend="Airport">
                  <div class="row">
                        <InputGroup class="airportCode">
                              <InputGroupAddon>Code</InputGroupAddon>
                              <!-- <InputMask v-model="code" mask="?****"></InputMask> -->
                              <InputText v-model="code" />
                        </InputGroup>
                        <InputGroup>
                              <InputGroupAddon>Name</InputGroupAddon>
                              <InputText v-model="name"></InputText>
                        </InputGroup>
                        <InputGroup class="airportElevation">
                              <InputGroupAddon>Elev.</InputGroupAddon>
                              <InputNumber v-model="elevation"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                  </div>
            </FieldSet>
            <FieldSet legend="Frequencies" class="mb-2">
                  <div class="row">
                        <InputGroup class="frequency">
                              <InputGroupAddon>CTAF</InputGroupAddon>
                              <InputNumber v-model="ctaf" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <!-- <InputGroup class="frequency">
                              <InputGroupAddon>TWR</InputGroupAddon>
                              <InputNumber v-model="tower" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                        </InputGroup> -->
                        <InputGroup class="frequency">
                              <InputGroupAddon>Wx</InputGroupAddon>
                              <InputNumber v-model="weather" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <InputGroup class="frequency">
                              <InputGroupAddon>GND</InputGroupAddon>
                              <InputNumber v-model="ground" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                  </div>
            </FieldSet>
            <FieldSet legend="Runways">
                  <div class="row mb-2">
                        <!-- <FloatLabel>
                              <InputMask in="runwayName" v-model="rwyName" mask="99-99" placeholder="XX-YY"
                               @update:modelValue="onRwyName()"
                              />
                              <label for="runwayName">Name</label>
                        </FloatLabel> -->
                        <InputGroup class="rwyName">
                              <InputGroupAddon>Name</InputGroupAddon>
                              <InputText v-model="rwyEnd0"/>
                              <InputGroupAddon>-</InputGroupAddon>
                              <InputText v-model="rwyEnd1"/>
                        </InputGroup>
                        <div class="rwyEnd">
                              <!-- <div class="rwy">{{ rwy0name }}</div> -->
                              <ToggleButton v-model="rwy0RightPattern" 
                                    :title="(rwy0RightPattern?'Right':'Left')+' Traffic Pattern Runway '+rwyEnd0"
                                    :onLabel="'RP'+rwyEnd0" onIcon="pi pi-arrow-right" 
                                    :offLabel="rwyEnd0" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </div>
                        <div class="rwyEnd">
                              <!-- <div class="rwy">{{ rwy1name }}</div> -->
                              <!-- <label class="label">left pattern</label> -->
                              <ToggleButton v-model="rwy1RightPattern" 
                                    :title="(rwy1RightPattern?'Right':'Left')+' Traffic Pattern Runway '+rwyEnd1"
                                    :onLabel="'RP'+rwyEnd1" onIcon="pi pi-arrow-right" 
                                    :offLabel="rwyEnd1" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </div>
                        <InputGroup class="airportElevation">
                              <InputGroupAddon>Length</InputGroupAddon>
                              <InputNumber v-model="rwyLength"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                        <InputGroup class="airportElevation">
                              <InputGroupAddon>Width</InputGroupAddon>
                              <InputNumber v-model="rwyWidth"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                        <Button label="Add Runway" severity="secondary" @click="onAddRunway"></Button>
                  </div>
                  <div class="row mb-2">
                        <div class="rwy" v-for="runway in runways">{{runway.name}}</div>     
                  </div>
            </FieldSet>
            <div class="actionDialog gap-2">
                  <Button label="Do Not Save" @click="emits('close')" link></Button>
                  <Button label="Save Custom Airport" @click="onSave()"></Button>
            </div>
      </Dialog>
      <Dialog v-else modal header="Custom Airport">
            <div class="mb-5">
                  <span>You must be signed to create custom airports</span>
            </div>
            <div class="actionDialog gap-2"><Button label="Close" @click="emits('close')"></Button></div>
      </Dialog>
</template>

<style scoped>
.airportCode {
      width: 20rem;
}

.airportElevation {
      width: 15rem;
}
.frequency {
      width: 15rem;
}
.label {
      line-height: 1.5rem;
}
.row {
      display: flex;
      flex-flow: row;
      gap: 1rem;
}

.rwy {
      border-radius: 6px;
      /* border: 2px solid white; */
      background-color: red;
      color: white;
      padding: 0.5rem;
      font-weight: 600;
      /* text-align: center; */
      line-height: 1.5rem;
}
.rwyName {
      width: 12rem;
}
.rwyRow {
      display: flex;
      flex-flow: row;
      justify-content: space-between;
      line-height: 1rem;
}

.rwyEnd {
      display: flex;
      gap: 0.5rem;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}
</style>