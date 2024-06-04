<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import FieldSet from 'primevue/fieldset'
import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputSwitch from 'primevue/inputswitch'
import ToggleButton from 'primevue/togglebutton'

const emits = defineEmits(["close"]);
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
const rwyName = ref(null)
const rwy0name = ref("XX")
const rwy1name = ref("YY")
const rwy0RightPattern = ref(false)
const rwy1RightPattern = ref(false)
const runways = ref([])

function onAddRunway() {
      runways.value.push('16-34')
}

function onRwyName() {
      console.log( 'CustomAirport onRwyName ' + rwyName.value)
      const names = rwyName.value.split('-')
      rwy0name.value = names[0]
      rwy1name.value = names[1]
}

function onSave() {

}

</script>

<template>
      <Dialog v-if="user" modal header="Custom Airport">
            <FieldSet legend="Airport">
                  <div class="row">
                        <InputGroup>
                              <InputGroupAddon>Code</InputGroupAddon>
                              <InputMask v-model="code" mask="?****"></InputMask>
                        </InputGroup>
                        <InputGroup>
                              <InputGroupAddon>Name</InputGroupAddon>
                              <InputText v-model="name"></InputText>
                        </InputGroup>
                        <InputGroup>
                              <InputGroupAddon>Elev.</InputGroupAddon>
                              <InputNumber v-model="elevation"></InputNumber>
                              <InputGroupAddon>ft</InputGroupAddon>
                        </InputGroup>
                  </div>
            </FieldSet>
            <FieldSet legend="Frequencies" class="mb-2">
                  <div class="row">
                        <InputGroup>
                              <InputGroupAddon>CTAF</InputGroupAddon>
                              <InputNumber v-model="ctaf" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <InputGroup>
                              <InputGroupAddon>TWR</InputGroupAddon>
                              <InputNumber v-model="tower" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <InputGroup>
                              <InputGroupAddon>Wx</InputGroupAddon>
                              <InputNumber v-model="weather" 
                              :minFractionDigits="3" :maxFractionDigits="3"
                              :min="118.0" :max="136.975" :step="0.025"
                              />
                              <!-- <InputGroupAddon>Mhz</InputGroupAddon> -->
                        </InputGroup>
                        <InputGroup>
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
                        <FloatLabel>
                              <InputMask in="runwayName" v-model="rwyName" mask="99-99" placeholder="XX-YY"
                               @update:modelValue="onRwyName()"
                              />
                              <label for="runwayName">Name</label>
                        </FloatLabel>
                        <div class="rwyEnd">
                              <!-- <div class="rwy">{{ rwy0name }}</div> -->
                              <ToggleButton v-model="rwy0RightPattern" 
                                    :title="'Traffic Pattern Runway '+rwy0name"
                                    :onLabel="'RP'+rwy0name" onIcon="pi pi-arrow-right" 
                                    :offLabel="rwy0name" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </div>
                        <div class="rwyEnd">
                              <!-- <div class="rwy">{{ rwy1name }}</div> -->
                              <!-- <label class="label">left pattern</label> -->
                              <ToggleButton v-model="rwy1RightPattern" 
                                    :title="'Traffic Pattern Runway '+rwy1name"
                                    :onLabel="'RP'+rwy1name" onIcon="pi pi-arrow-right" 
                                    :offLabel="rwy1name" offIcon="pi pi-arrow-left" 
                                    class="w-9rem" />
                        </div>
                        <FloatLabel>
                              <InputNumber v-model="rwyLength" />
                              <label>Length</label>
                        </FloatLabel>
                        <FloatLabel>
                              <InputNumber v-model="rwyWidth" />
                              <label>Width</label>
                        </FloatLabel>
                        <Button label="Add Runway" severity="secondary" @click="onAddRunway"></Button>
                  </div>
                  <div class="row mb-2">
                        <div class="rwy" v-for="runway in runways">{{runway}}</div>     
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