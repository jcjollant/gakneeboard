<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="aircraft.id ? 'Edit Aircraft ('+aircraft.tailNumber+')' : 'New Aircraft'" :style="{ width: '80vw', maxWidth: '1000px' }">
    <div class="aircraft-editor">
      <div class="grid p-fluid">
        <!-- Basic Info -->
        <div class="col-12 md:col-4">
          <div class="field">
            <label for="tailNumber">Tail Number</label>
            <InputText id="tailNumber" v-model="aircraft.tailNumber" maxLength="8" placeholder="e.g. N12345" />
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="field">
            <label for="make">Make</label>
            <InputText id="make" v-model="aircraft.make" maxLength="32" placeholder="e.g. Cessna" />
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="field">
            <label for="model">Model</label>
            <InputText id="model" v-model="aircraft.model" maxLength="32" placeholder="e.g. 172S" />
          </div>
        </div>

        <Divider align="left" type="dashed">
            <b>Performance Characteristics</b>
        </Divider>

        <div class="col-12 md:col-4">
          <div class="field">
            <label>Climb Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.climbFuel" :minFractionDigits="1" />
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="field">
            <label>Cruise Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.cruiseFuel" :minFractionDigits="1" />
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="field">
            <label>Descent Fuel (gph)</label>
            <InputNumber v-model="aircraft.data.descentFuel" :minFractionDigits="1" />
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label>Climb TAS (kt)</label>
            <InputNumber v-model="aircraft.data.climbTas" />
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Cruise TAS (kt)</label>
            <InputNumber v-model="aircraft.data.cruiseTas" />
          </div>
        </div>

        <Divider align="left" type="dashed">
            <b>Weight and Balance</b>
        </Divider>

        <div class="col-12 md:col-6">
            <div class="field">
                <label>Basic Empty Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.basicEmptyWeight" />
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="field">
                <label>Basic Empty Arm (in)</label>
                <InputNumber v-model="aircraft.data.basicEmptyCg" :minFractionDigits="2" />
            </div>
        </div>

        <div class="col-12 md:col-4">
            <div class="field">
                <label>Max Ramp Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxRampWeight" />
            </div>
        </div>
        <div class="col-12 md:col-4">
            <div class="field">
                <label>Max Takeoff Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxTakeoffWeight" />
            </div>
        </div>
        <div class="col-12 md:col-4">
            <div class="field">
                <label>Max Landing Weight (lbs)</label>
                <InputNumber v-model="aircraft.data.maxLandingWeight" />
            </div>
        </div>

        <!-- Stations -->
        <div class="col-12">
            <h3>Stations</h3>
            <DataTable :value="aircraft.data.stations" responsiveLayout="scroll">
                <Column field="name" header="Name">
                    <template #body="{ index }">
                        <InputText v-model="aircraft.data.stations[index].name" />
                    </template>
                </Column>
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ index }">
                        <InputNumber v-model="aircraft.data.stations[index].posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column headerStyle="width: 4rem">
                    <template #body="{ index }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeStation(index)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Station" icon="pi pi-plus" class="p-button-text mt-2" @click="addStation" />
        </div>

        <!-- CG Envelopes -->
        <div class="col-12 md:col-6">
            <h3>Forward CG Limits</h3>
            <DataTable :value="aircraft.data.fwdCgLimits" responsiveLayout="scroll">
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ index }">
                        <InputNumber v-model="aircraft.data.fwdCgLimits[index].posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column field="weightLbs" header="Weight (lbs)">
                    <template #body="{ index }">
                        <InputNumber v-model="aircraft.data.fwdCgLimits[index].weightLbs" />
                    </template>
                </Column>
                <Column headerStyle="width: 4rem">
                    <template #body="{ index }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeLimit('fwd', index)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Limit" icon="pi pi-plus" class="p-button-text mt-2" @click="addLimit('fwd')" />
        </div>

        <div class="col-12 md:col-6">
            <h3>Aft CG Limits</h3>
            <DataTable :value="aircraft.data.aftCgLimits" responsiveLayout="scroll">
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ index }">
                        <InputNumber v-model="aircraft.data.aftCgLimits[index].posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column field="weightLbs" header="Weight (lbs)">
                    <template #body="{ index }">
                        <InputNumber v-model="aircraft.data.aftCgLimits[index].weightLbs" />
                    </template>
                </Column>
                <Column headerStyle="width: 4rem">
                    <template #body="{ index }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeLimit('aft', index)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Limit" icon="pi pi-plus" class="p-button-text mt-2" @click="addLimit('aft')" />
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
import { ref, watch, reactive } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Divider from 'primevue/divider'
import { AircraftService } from '../../services/AircraftService'
import { Aircraft } from '@gak/shared'

const props = defineProps<{
  visible: boolean
  initialAircraft?: Aircraft | null
}>()

const emits = defineEmits(['update:visible', 'saved', 'deleted'])

const saving = ref(false)
const aircraft = reactive<Partial<Aircraft> & { data: any }>({
  tailNumber: '',
  make: '',
  model: '',
  data: {
    climbFuel: 0,
    cruiseFuel: 0,
    descentFuel: 0,
    climbTas: 0,
    cruiseTas: 0,
    basicEmptyWeight: 0,
    basicEmptyCg: 0,
    maxRampWeight: 0,
    maxTakeoffWeight: 0,
    maxLandingWeight: 0,
    stations: [],
    fwdCgLimits: [],
    aftCgLimits: []
  }
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.initialAircraft) {
      Object.assign(aircraft, JSON.parse(JSON.stringify(props.initialAircraft)))
    } else {
      resetAircraft()
    }
  }
})

function resetAircraft() {
  aircraft.id = undefined
  aircraft.tailNumber = ''
  aircraft.make = ''
  aircraft.model = ''
  aircraft.data = {
    climbFuel: 15,
    cruiseFuel: 10,
    descentFuel: 8,
    climbTas: 80,
    cruiseTas: 110,
    basicEmptyWeight: 1600,
    basicEmptyCg: 40,
    maxRampWeight: 2558,
    maxTakeoffWeight: 2550,
    maxLandingWeight: 2550,
    stations: [
        { name: 'Pilot/Co-Pilot', posInch: 37 },
        { name: 'Rear Passengers', posInch: 73 },
        { name: 'Baggage', posInch: 95 },
        { name: 'Fuel', posInch: 48 }
    ],
    fwdCgLimits: [
        { posInch: 35, weightLbs: 1900 },
        { posInch: 41, weightLbs: 2550 }
    ],
    aftCgLimits: [
        { posInch: 47, weightLbs: 1900 },
        { posInch: 47, weightLbs: 2550 }
    ]
  }
}

function addStation() {
  aircraft.data.stations.push({ name: '', posInch: 0 })
}

function removeStation(index: number) {
  aircraft.data.stations.splice(index, 1)
}

function addLimit(type: 'fwd' | 'aft') {
  const limits = type === 'fwd' ? aircraft.data.fwdCgLimits : aircraft.data.aftCgLimits
  limits.push({ posInch: 0, weightLbs: 0 })
}

function removeLimit(type: 'fwd' | 'aft', index: number) {
  const limits = type === 'fwd' ? aircraft.data.fwdCgLimits : aircraft.data.aftCgLimits
  limits.splice(index, 1)
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
