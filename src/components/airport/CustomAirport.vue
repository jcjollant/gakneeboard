<script setup>
import { ref, onMounted, watch } from 'vue'
import { Airport, Runway } from '@/assets/Airport'
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
import { saveCustomAirport, getFreqCtaf, getFreqWeather, getFreqGround } from '@/assets/data'

const emits = defineEmits(["close","updated"]);

const user = ref(null)
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
let originalProps = null // used to remember original props

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */
const props = defineProps({
    airport: { type: Object, default: null},
    user: { type: Object, default: null},
})

function loadProps(props) {
      // console.log('[CustomAirport.loadProps] ' + JSON.stringify(props))
      if( props.airport) {
            code.value = props.airport.code;
            name.value = props.airport.name;
            elevation.value = props.airport.elev;
            ctaf.value = getFreqCtaf( props.airport.freq)?.mhz
            weather.value = getFreqWeather( props.airport.freq)?.mhz
            ground.value = getFreqGround( props.airport.freq)?.mhz
            runways.value = props.airport.rwys
            originalProps = props
      }
      user.value = props.user;
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



function onAddRunway() {
      // prepend with 0 on single digit runway name
      if(rwyEnd0.value.length == 1) rwyEnd0.value = '0' + rwyEnd0.value
      if(rwyEnd1.value.length == 1) rwyEnd1.value = '0' + rwyEnd1.value

      const rwyName = rwyEnd0.value + '-' + rwyEnd1.value
      if( Runway.isValidName(rwyName)) {
            const runway = new Runway(rwyName,rwyLength.value,rwyWidth.value)
            // console.log( "[CustomAirport.onAddRunway] Traffic patterns", rwyEnd0.value, rwy0RightPattern.value, rwyEnd1.value, rwy1RightPattern.value)
            runway.setTrafficPattern( rwyEnd0.value, rwy0RightPattern.value ? Runway.rightPattern : Runway.leftPattern)
            runway.setTrafficPattern( rwyEnd1.value, rwy1RightPattern.value ? Runway.rightPattern : Runway.leftPattern)
            runways.value.push(runway)

            rwyEnd0.value = ''
            rwy0RightPattern.value = false
            rwyEnd1.value = ''
            rwy1RightPattern.value = false
            rwyLength.value = 0
            rwyWidth.value = 0
      } else {
            addToast( 'error', 'Cannot Add Runway', 'Invalid runway name ' + rwyName);  
      }
}

function onDoNotSave() {
      // we reload original properties to forget recent changes
      loadProps(originalProps)
      emits('close')
}

function onRemoveRunway(name) {
      runways.value = runways.value.filter( rwy => rwy.name != name);
}

async function onSave() {
      // normalize code to upper case
      code.value = code.value.toUpperCase()
      const errorTitle = "Cannot Save Airport"

      if( !Airport.isValidCode( code.value)) {
            addToast( 'error', errorTitle, "Invalid airport code (" + code.value + ")")
            return
      }

      // Check we are not creating an airport without runways
      if( runways.value.length == 0) {
            addToast( 'error', errorTitle, "Please add at least one runway to the airport")
            return
      }

      const airport = new Airport( code.value, name.value, elevation.value)
      airport.addFrequency( 'CTAF', ctaf.value)
      airport.addFrequency( 'TWR', tower.value)
      airport.addFrequency( 'Weather', weather.value)
      airport.addFrequency( 'GND', ground.value)
      airport.addRunways(runways.value)

      // console.log( "[CustomAirport] onSave aiport " + JSON.stringify(airport))
      addToast('info', 'Saving Custom Airport', airport.code + ' is being saved')
      await saveCustomAirport( airport)
      addToast('success', 'Saved!', 'Custom Airport ' + airport.code + ' has been saved')
      emits('updated',code.value, airport)
}

function addToast( severity, title, details) {
      toast.add({ 
            severity: severity, 
            summary: title, 
            detail: details, 
            life: 3000
      });  
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
                        <InputGroup class="rem15">
                              <InputGroupAddon>Elev.</InputGroupAddon>
                              <InputNumber v-model="elevation"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                  </div>
            </FieldSet>
            <FieldSet legend="Frequencies" class="mb-2">
                  <div class="row">
                        <InputGroup class="rem15">
                              <InputGroupAddon>CTAF</InputGroupAddon>
                              <InputNumber v-model="ctaf" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <!-- <InputGroup class="rem15">
                              <InputGroupAddon>TWR</InputGroupAddon>
                              <InputNumber v-model="tower" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                        </InputGroup> -->
                        <InputGroup class="rem15">
                              <InputGroupAddon>Wx</InputGroupAddon>
                              <InputNumber v-model="weather" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <InputGroup class="rem15">
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
                        <InputGroup class="rwyEnd">
                              <InputGroupAddon>End1</InputGroupAddon>
                              <InputText v-model="rwyEnd0"/>
                              <ToggleButton v-model="rwy0RightPattern" 
                                    :title="(rwy0RightPattern?'Right':'Left')+' Traffic Pattern Runway '+rwyEnd0"
                                    onLabel="RP" onIcon="pi pi-arrow-right" 
                                    offLabel="LP" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </InputGroup>
                        <InputGroup class="rwyEnd">
                              <InputGroupAddon>End2</InputGroupAddon>
                              <InputText v-model="rwyEnd1"/>
                              <ToggleButton v-model="rwy1RightPattern" 
                                    :title="(rwy1RightPattern?'Right':'Left')+' Traffic Pattern Runway '+rwyEnd1"
                                    onLabel="RP" onIcon="pi pi-arrow-right" 
                                    offLabel="LP" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </InputGroup>
                        <InputGroup class="rem15">
                              <InputGroupAddon>Length</InputGroupAddon>
                              <InputNumber v-model="rwyLength"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                        <InputGroup class="rem15">
                              <InputGroupAddon>Width</InputGroupAddon>
                              <InputNumber v-model="rwyWidth"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                        <Button label="Save" severity="secondary" @click="onAddRunway"></Button>
                  </div>
                  <div class="row mb-2">
                        <div class="label">List :</div>
                        <Button class="rwy" v-for="runway in runways" 
                              :title="'Remove Runway ' + runway.name" 
                              :label="runway.name"
                              severity="danger" 
                              icon="pi pi-times"
                              @click="onRemoveRunway(runway.name)"></Button>
                  </div>
            </FieldSet>
            <div class="actionDialog gap-2">
                  <Button label="Do Not Save" @click="onDoNotSave()" link></Button>
                  <Button label="Save Custom Airport" @click="onSave()"></Button>
            </div>
      </Dialog>
      <Dialog v-else modal header="Custom Airport">
            <div class="mb-5">
                  <span>You must be signed in to create custom airports<br>This can be done via the menu</span>
            </div>
            <div class="actionDialog gap-2"><Button label="Roger" @click="emits('close')"></Button></div>
      </Dialog>
</template>

<style scoped>
.airportCode {
      width: 20rem;
}

.rem15 {
      width: 15rem;
}
.label {
      line-height: 2rem;
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
      cursor: pointer;
}
.rwyEnd {
      width: 10.5rem;
}
.rwyRow {
      display: flex;
      flex-flow: row;
      justify-content: space-between;
      line-height: 1rem;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}
</style>