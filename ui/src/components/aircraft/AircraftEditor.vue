<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="aircraft.id ? 'Edit Aircraft ('+aircraft.tailNumber+')' : 'New Aircraft'" :style="{ width: '80vw', maxWidth: '1000px' }">
    <div class="aircraft-editor">
      <div class="grid p-fluid">
        <!-- Basic Info -->
        <div class="col-3">
          <div class="field">
            <label for="tailNumber">Tail Number</label>
            <InputText id="tailNumber" v-model="aircraft.tailNumber" maxLength="8" placeholder="e.g. N12345" />
          </div>
        </div>
        <div class="col-3">
          <div class="field">
            <label for="make">Make</label>
            <InputText id="make" v-model="aircraft.data.make" maxLength="32" placeholder="e.g. Cessna" />
          </div>
        </div>
        <div class="col-3">
          <div class="field">
            <label for="model">Model</label>
            <InputText id="model" v-model="aircraft.data.model" maxLength="32" placeholder="e.g. 172S" />
          </div>
        </div>
        <div class="col-3">
          <div class="field">
            <label>Aircraft Icon</label>
            <div class="icon-trigger solo" @click="showIconList = !showIconList" :class="{ active: showIconList }" title="Change aircraft icon">
                <template v-if="selectedIcon.type === 'image'">
                    <img :src="selectedIcon.path" :alt="selectedIcon.label" />
                </template>
                <template v-else>
                    <font-awesome-icon :icon="selectedIcon.faIcon" />
                </template>
                <div class="edit-hint"><font-awesome-icon :icon="showIconList ? 'fa-chevron-up' : 'fa-pencil'" /></div>
            </div>
          </div>
        </div>

        <!-- Inline Icon Selector -->
        <div v-if="showIconList" class="col-12">
            <div class="field">
                <label>Select Aircraft Icon</label>
                <IconSelector v-model="aircraft.data.icon" />
            </div>
        </div>

        <div class="col-12">
          <Separator name="Performance Characteristics" :leftAligned="true" />
        </div>

        <div class="col-2">
          <div class="field">
            <label>Climb Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.climbFuel" :minFractionDigits="1" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Cruise Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.cruiseFuel" :minFractionDigits="1" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Descent Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.descentFuel" :minFractionDigits="1" />
          </div>
        </div>

        <div class="col-2">
          <div class="field">
            <label>Climb TAS (kt)</label>
            <InputNumber v-model="aircraft.data.climbTas" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Cruise TAS (kt)</label>
            <InputNumber v-model="aircraft.data.cruiseTas" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Descent TAS (kt)</label>
            <InputNumber v-model="aircraft.data.descentTas" />
          </div>
        </div>
        <div class="col-12">
          <Separator name="V-Speeds (kt)" :leftAligned="true" />
        </div>

        <div class="col-2">
          <div class="field">
            <label>Vs0</label>
            <InputNumber v-model="aircraft.data.speeds.vs0" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Vs1</label>
            <InputNumber v-model="aircraft.data.speeds.vs1" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Vfe</label>
            <InputNumber v-model="aircraft.data.speeds.vfe" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Va</label>
            <InputNumber v-model="aircraft.data.speeds.va" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Vno</label>
            <InputNumber v-model="aircraft.data.speeds.vno" />
          </div>
        </div>
        <div class="col-2">
          <div class="field">
            <label>Vne</label>
            <InputNumber v-model="aircraft.data.speeds.vne" />
          </div>
        </div>

        <div class="col-12">
          <Separator name="Weight and Balance" :leftAligned="true" />
        </div>

        <div class="col-2">
            <div class="field">
                <label>Basic Empty Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.basicEmptyWeight" />
            </div>
        </div>
        <div class="col-2">
            <div class="field">
                <label>Basic Empty Arm (in)</label>
                <InputNumber v-model="aircraft.data.basicEmptyCg" :minFractionDigits="2" />
            </div>
        </div>

        <div class="col-2">
            <div class="field">
                <label>Max Ramp Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxRampWeight" />
            </div>
        </div>
        <div class="col-2">
            <div class="field">
                <label>Max Takeoff Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxTakeoffWeight" />
            </div>
        </div>
        <div class="col-2">
            <div class="field">
                <label>Max Landing Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxLandingWeight" />
            </div>
        </div>
        <div class="col-2">
            <div class="field">
                <label>Max Usable Fuel (gal)</label>
                <InputNumber v-model="aircraft.data.maxUsableFuel" />
            </div>
        </div>

        <div class="col-12">
            <Separator name="CG Stations" :leftAligned="true" />
        </div>

        <!-- Fuel -->
        <div class="col-12">
            <div v-if="fuelStation" class="field">
                <label>Fuel Arm (in)</label>
                <InputNumber v-model="fuelStation.posInch" :minFractionDigits="2" />
            </div>
            <div v-else>
                <Button label="Add Fuel" icon="pi pi-plus" class="p-button-text mt-2" @click="addStation('fuel')" />
            </div>
        </div>
        <!-- Seats -->
        <div class="col-6">
            <DataTable :value="seatStations" responsiveLayout="scroll">
                <Column field="name" header="Seat Stations">
                    <template #body="{ data }">
                        <InputText v-model="data.name" />
                    </template>
                </Column>
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ data }">
                        <InputNumber v-model="data.posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column headerStyle="width: 2rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeStation(data)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Seat" icon="pi pi-plus" class="p-button-text mt-2" @click="addStation('twin')" />
        </div>

        <!-- Cargo -->
        <div class="col-6">
            <DataTable :value="cargoStations" responsiveLayout="scroll">
                <Column field="name" header="Cargo Station">
                    <template #body="{ data }">
                        <InputText v-model="data.name" />
                    </template>
                </Column>
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ data }">
                        <InputNumber v-model="data.posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column headerStyle="width: 2rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeStation(data)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Cargo Area" icon="pi pi-plus" class="p-button-text mt-2" @click="addStation('central')" />
        </div>

        <div class="col-12">
            <Separator name="CG Envelope" :leftAligned="true" />
        </div>

        <div class="col-12">
            <CgEnvelopeEditor 
                :fwdLimits="aircraft.data.fwdCgLimits" 
                :aftLimits="aircraft.data.aftCgLimits" 
                :aircraft="aircraft" 
            />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="footer-actions">
        <Button v-if="aircraft.id" label="Delete" icon="pi pi-trash" class="p-button-danger p-button-text mr-auto" @click="onDelete" />
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('update:visible', false)" />
        <Button label="Save" icon="pi pi-check" @click="onSave" :loading="saving" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Separator from '../shared/Separator.vue'
import IconSelector from './IconSelector.vue'
import CgEnvelopeEditor from './CgEnvelopeEditor.vue'
import { AIRCRAFT_ICONS, AircraftIcon, getIcon } from '../../utils/aircraftIcons'
import { AircraftService } from '../../services/AircraftService'
import { Aircraft } from '@gak/shared'

const props = defineProps<{
  visible: boolean
  initialAircraft?: Aircraft | null
}>()

const emits = defineEmits(['update:visible', 'saved', 'deleted'])



const saving = ref(false)
const showIconList = ref(false)
const aircraft = reactive<Partial<Aircraft> & { data: any }>({
  tailNumber: '',
  data: {
    make: '',
    model: '',
    icon: 'fa-plane',
    climbFuel: 0,
    cruiseFuel: 0,
    descentFuel: 0,
    climbTas: 0,
    cruiseTas: 0,
    descentTas: 0,
    basicEmptyWeight: 0,
    basicEmptyCg: 0,
    maxRampWeight: 0,
    maxTakeoffWeight: 0,
    maxLandingWeight: 0,
    maxUsableFuel: 0,
    stations: [],
    fwdCgLimits: [],
    aftCgLimits: [],
    speeds: {
      vs0: 0,
      vs1: 0,
      vfe: 0,
      va: 0,
      vno: 0,
      vne: 0
    }
  }
})

const selectedIcon = computed(() => getIcon(aircraft.data.icon))
const seatStations = computed(() => aircraft.data.stations.filter((s: any) => s.type === 'twin'))
const cargoStations = computed(() => aircraft.data.stations.filter((s: any) => s.type === 'central'))
const fuelStation = computed(() => aircraft.data.stations.find((s: any) => s.type === 'fuel'))

watch(() => props.visible, (newVal) => {
  if (newVal) {
    showIconList.value = false
    if (props.initialAircraft) {
      const cloned = JSON.parse(JSON.stringify(props.initialAircraft))
      if (cloned.data?.stations) {
        cloned.data.stations.forEach((s: any) => {
          if (!s.type) {
            const lower = (s.name || '').toLowerCase()
            if (lower.includes('fuel')) {
              s.type = 'fuel'
            } else {
              const isSeat = lower.includes('pilot') || lower.includes('passenger') || lower.includes('seat')
              s.type = isSeat ? 'twin' : 'central'
            }
          }
        })
      }
      if (cloned.data && cloned.data.descentTas === undefined) {
        cloned.data.descentTas = cloned.data.cruiseTas || 115
      }
      Object.assign(aircraft, cloned)
    } else {
      resetAircraft()
    }
  }
})

function resetAircraft() {
  aircraft.id = undefined
  aircraft.tailNumber = ''
  aircraft.data = {
    make: '',
    model: '',
    icon: 'fa-plane',
    climbFuel: 15,
    cruiseFuel: 10,
    descentFuel: 8,
    climbTas: 80,
    cruiseTas: 110,
    descentTas: 115,
    basicEmptyWeight: 1600,
    basicEmptyCg: 40,
    maxRampWeight: 2558,
    maxTakeoffWeight: 2550,
    maxLandingWeight: 2550,
    maxUsableFuel: 53,
    stations: [
        { name: 'Pilot/Co-Pilot', posInch: 37, type: 'twin' },
        { name: 'Rear Passengers', posInch: 73, type: 'twin' },
        { name: 'Baggage', posInch: 95, type: 'central' },
        { name: 'Fuel', posInch: 48, type: 'fuel' }
    ],
    fwdCgLimits: [
        { posInch: 35, weightLbs: 1900 },
        { posInch: 41, weightLbs: 2550 }
    ],
    aftCgLimits: [
        { posInch: 47, weightLbs: 1900 },
        { posInch: 47, weightLbs: 2550 }
    ],
    speeds: {
        vs0: 40,
        vs1: 48,
        vfe: 103,
        va: 105,
        vno: 129,
        vne: 163
    }
  }
}

function addStation(type: 'twin' | 'central' | 'fuel') {
  const name = type === 'fuel' ? 'Fuel' : ''
  aircraft.data.stations.push({ name, posInch: 0, type })
}

function removeStation(station: any) {
  const index = aircraft.data.stations.indexOf(station)
  if (index !== -1) {
    aircraft.data.stations.splice(index, 1)
  }
}



async function onSave() {
  if (!aircraft.tailNumber) return;
  saving.value = true
  try {
    const saved = await AircraftService.save(aircraft as any)
    if (saved) {
      emits('saved', saved)
      emits('update:visible', false)
    }
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function onDelete() {
    if (!aircraft.id) return
    if (!confirm('Are you sure you want to delete this aircraft?')) return
    try {
        const success = await AircraftService.delete(aircraft.id)
        if (success) {
            emits('deleted', aircraft.id)
            emits('update:visible', false)
        }
    } catch (err) {
        console.error(err)
    }
}
</script>

<style scoped>
.aircraft-editor .grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.aircraft-editor .col-2,
.aircraft-editor .col-4,
.aircraft-editor .col-5,
.aircraft-editor .col-6,
.aircraft-editor .col-12 {
  grid-column: span 12;
}

@media (min-width: 769px) {
  .aircraft-editor .col-2 {
    grid-column: span 2;
  }
  .aircraft-editor .col-3 {
    grid-column: span 3;
  }
  .aircraft-editor .col-4 {
    grid-column: span 4;
  }
  .aircraft-editor .col-5 {
    grid-column: span 5;
  }
  .aircraft-editor .col-6 {
    grid-column: span 6;
  }
}
.model-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.model-row .p-inputtext {
    flex: 1;
}
.icon-trigger {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  font-size: 1.25rem;
  color: #0369a1;
}
.icon-trigger.solo {
    width: 100%;
}
.icon-trigger:hover, .icon-trigger.active {
  border-color: #0ea5e9;
  background: #f0f9ff;
}
.icon-trigger img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
}
.edit-hint {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #0ea5e9;
    color: white;
    font-size: 0.6rem;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid white;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.25rem;
}
.footer-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
.mr-auto {
    margin-right: auto;
}
</style>
