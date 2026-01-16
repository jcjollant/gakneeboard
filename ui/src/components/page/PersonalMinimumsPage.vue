<template>
  <div class="contentPage">
    <Header :title="'Personal Minimums'" :replace="true" :clickable="true" :displayMode="false" leftButton="" @replace="$emit('replace')"></Header>
    <div class="ritz grid-container" dir="ltr">
      <table class="waffle" cellspacing="0" cellpadding="0">
        <tbody>
          <tr class="row-height">
            <td class="s1"></td>
            <td class="s2" dir="ltr">Ideal VFR</td>
            <td class="s3" dir="ltr">Pressure VFR</td>
            <td class="s4" dir="ltr">IFR</td>
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">T/O Ceiling</td>
            <EditableCell v-model="formData.toCeiling.idealVfr" cell-class="s5" cell-id="toCeiling.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.toCeiling.pressureVfr" cell-class="s5" cell-id="toCeiling.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.toCeiling.ifr" cell-class="s5" cell-id="toCeiling.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">T/O Visibility</td>
            <EditableCell v-model="formData.toVisibility.idealVfr" cell-class="s5" cell-id="toVisibility.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.toVisibility.pressureVfr" cell-class="s5" cell-id="toVisibility.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.toVisibility.ifr" cell-class="s5" cell-id="toVisibility.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Fuel Reserve</td>
            <EditableCell v-model="formData.fuelReserve.idealVfr" cell-class="s5" cell-id="fuelReserve.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.fuelReserve.pressureVfr" cell-class="s5" cell-id="fuelReserve.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.fuelReserve.ifr" cell-class="s5" cell-id="fuelReserve.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s1" dir="ltr"></td>
            <td class="s6" dir="ltr" colspan="3">Runway</td>
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Lo DA Length</td>
            <EditableCell v-model="formData.lowDaMinLen.idealVfr" cell-class="s5" cell-id="lowDaMinLen.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.lowDaMinLen.pressureVfr" cell-class="s5" cell-id="lowDaMinLen.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.lowDaMinLen.ifr" cell-class="s5" cell-id="lowDaMinLen.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Hi DA Length</td>
            <EditableCell v-model="formData.highDaMinLen.idealVfr" cell-class="s5" cell-id="highDaMinLen.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.highDaMinLen.pressureVfr" cell-class="s5" cell-id="highDaMinLen.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.highDaMinLen.ifr" cell-class="s5" cell-id="highDaMinLen.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Surface</td>
            <EditableCell v-model="formData.surface.idealVfr" cell-class="s5" cell-id="surface.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.surface.pressureVfr" cell-class="s5" cell-id="surface.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.surface.ifr" cell-class="s5" cell-id="surface.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s1" dir="ltr"></td>
            <td class="s6" dir="ltr" colspan="3">Wind</td>
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Rwy XWind</td>
            <EditableCell v-model="formData.rwyXWind.idealVfr" cell-class="s5" cell-id="rwyXWind.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.rwyXWind.pressureVfr" cell-class="s5" cell-id="rwyXWind.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.rwyXWind.ifr" cell-class="s5" cell-id="rwyXWind.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Rwy Gusts</td>
            <EditableCell v-model="formData.rwyGusts.idealVfr" cell-class="s5" cell-id="rwyGusts.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.rwyGusts.pressureVfr" cell-class="s5" cell-id="rwyGusts.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.rwyGusts.ifr" cell-class="s5" cell-id="rwyGusts.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s7" dir="ltr">Turbulences</td>
            <EditableCell v-model="formData.turbulences.idealVfr" cell-class="s5" cell-id="turbulences.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.turbulences.pressureVfr" cell-class="s5" cell-id="turbulences.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.turbulences.ifr" cell-class="s5" cell-id="turbulences.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s8" dir="ltr">Mtn Aloft</td>
            <EditableCell v-model="formData.acrossTerrain.idealVfr" cell-class="s5" cell-id="acrossTerrain.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.acrossTerrain.pressureVfr" cell-class="s5" cell-id="acrossTerrain.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.acrossTerrain.ifr" cell-class="s5" cell-id="acrossTerrain.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s1" dir="ltr"></td>
            <td class="s6" dir="ltr" colspan="3">Passengers</td>
          </tr>
          <tr class="row-height">
            <td class="s8" dir="ltr">Max Pax</td>
            <EditableCell v-model="formData.maxPax.idealVfr" cell-class="s2" cell-id="maxPax.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.maxPax.pressureVfr" cell-class="s3" cell-id="maxPax.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.maxPax.ifr" cell-class="s4" cell-id="maxPax.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s8" dir="ltr">90d Land</td>
            <EditableCell v-model="formData.landings90d.idealVfr" cell-class="s2" cell-id="landings90d.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.landings90d.pressureVfr" cell-class="s3" cell-id="landings90d.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.landings90d.ifr" cell-class="s4" cell-id="landings90d.ifr" @update:modelValue="updateData" />
          </tr>
          <tr class="row-height">
            <td class="s8" dir="ltr">90d PIC</td>
            <EditableCell v-model="formData.pic90d.idealVfr" cell-class="s2" cell-id="pic90d.idealVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.pic90d.pressureVfr" cell-class="s3" cell-id="pic90d.pressureVfr" @update:modelValue="updateData" />
            <EditableCell v-model="formData.pic90d.ifr" cell-class="s4" cell-id="pic90d.ifr" @update:modelValue="updateData" />
          </tr>
        </tbody>
      </table>
      
      <table class="waffle pressure-table" cellspacing="0" cellpadding="0">
        <tbody>
          <tr class="row-height">
            <td class="s9" dir="ltr" colspan="4">Pressure Items</td>
          </tr>
          <tr class="row-height">
            <td class="s9" dir="ltr">P</td>
            <td class="s9" dir="ltr">A</td>
            <td class="s9" dir="ltr">V</td>
            <td class="s9" dir="ltr">E</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Proficiency</td>
            <td class="s10" dir="ltr">Unfam. Aircraft</td>
            <td class="s10" dir="ltr">Unfam. Airport</td>
            <td class="s10" dir="ltr">Deadline</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Not 100%</td>
            <td class="s10" dir="ltr">New Equipment</td>
            <td class="s10" dir="ltr">Night</td>
            <td class="s10" dir="ltr">VIP Pax</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Medication</td>
            <td class="s10" dir="ltr">Fresh Maintenance</td>
            <td class="s10" dir="ltr">Air|Sigmets STZ</td>
            <td class="s10" dir="ltr">Expectations</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Stress</td>
            <td class="s10" dir="ltr">Squawks</td>
            <td class="s10" dir="ltr">Fronts Activity</td>
            <td class="s10" dir="ltr">Stressed Pax</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Fatigue</td>
            <td class="s10" dir="ltr">INOPs</td>
            <td class="s10" dir="ltr">NOTAMs</td>
            <td class="s10" dir="ltr">Poor Alternates</td>
          </tr>
          <tr class="row-height">
            <td class="s10" dir="ltr">Eating</td>
            <td class="s10" dir="ltr"></td>
            <td class="s10" dir="ltr">Unfam. Route</td>
            <td class="s10" dir="ltr"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Header from '../shared/Header.vue'
import EditableCell from '../shared/EditableCell.vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const emits = defineEmits(['update', 'replace'])

const formData = ref({
  toCeiling: { idealVfr: '', pressureVfr: '', ifr: '' },
  toVisibility: { idealVfr: '', pressureVfr: '', ifr: '' },
  fuelReserve: { idealVfr: '', pressureVfr: '', ifr: '' },
  lowDaMinLen: { idealVfr: '', pressureVfr: '', ifr: '' },
  highDaMinLen: { idealVfr: '', pressureVfr: '', ifr: '' },
  surface: { idealVfr: '', pressureVfr: '', ifr: '' },
  rwyXWind: { idealVfr: '', pressureVfr: '', ifr: '' },
  rwyGusts: { idealVfr: '', pressureVfr: '', ifr: '' },
  turbulences: { idealVfr: '', pressureVfr: '', ifr: '' },
  acrossTerrain: { idealVfr: '', pressureVfr: '', ifr: '' },
  maxPax: { idealVfr: '', pressureVfr: '', ifr: '' },
  landings90d: { idealVfr: '', pressureVfr: '', ifr: '' },
  pic90d: { idealVfr: '', pressureVfr: '', ifr: '' }
})

function updateData() {
  emits('update', formData.value)
}

function loadData() {
  if (props.data) {
    Object.assign(formData.value, props.data)
  }
}

onMounted(() => {
  loadData()
})

watch(() => props.data, () => {
  loadData()
}, { deep: true })
</script>

<style scoped>
.ritz {
  padding: 10px;
}

.ritz .waffle {
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  table-layout: fixed;
}

.ritz .waffle td {
  width: 25%;
  min-width: 120px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #ccc;
  font-family: Verdana, sans-serif;
  background-color: #ffffff;
  white-space: nowrap;
  direction: ltr;
  padding: 2px 3px 2px 3px;
}

.pressure-table {
  margin-top: 20px;
}

.s1 {
  text-align: left;
  font-weight: bold;
  color: #000000;
  font-size: 14pt;
}

.s2 {
  text-align: center;
  font-weight: bold;
  color: #38761d;
  font-size: 12pt;
}

.s3 {
  text-align: center;
  font-weight: bold;
  color: #0000ff;
  font-size: 11pt;
}

.s4 {
  text-align: center;
  font-weight: bold;
  color: #ff00ff;
  font-size: 12pt;
}

.s5 {
  text-align: center;
  color: #000000;
  font-size: 14pt;
}

.s6 {
  background-color: #f3f3f3 !important;
  text-align: center;
  font-weight: bold;
  color: #b7b7b7;
  font-size: 14pt;
}

.s7 {
  text-align: right;
  font-weight: bold;
  color: #000000;
  font-size: 11pt;
}

.s8 {
  text-align: right;
  font-weight: bold;
  color: #000000;
  font-size: 12pt;
}

.s9 {
  text-align: center;
  font-weight: bold;
  color: #000000;
  color: #0000ff;
  font-size: 14pt;
}

.s10 {
  text-align: center;
  color: #000000;
  font-size: 10pt;
}

.ritz .waffle input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: Verdana, sans-serif;
  font-size: 12pt;
  text-align: center;
  padding: 2px;
  outline: none;
}

.ritz .waffle input:focus {
  background-color: #f0f8ff;
  border: 1px solid #4285f4;
}



.row-height {
  height: 20px;
}

@media print {
  .ritz .waffle {
    table-layout: fixed;
    width: 100%;
  }
  
  .ritz .waffle td {
    width: 25%;
    min-width: auto;
    max-width: none;
    overflow: visible;
    white-space: normal;
    word-wrap: break-word;
    vertical-align: bottom;
  }
  
  .ritz .waffle input {
    border: none;
    background: transparent;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    vertical-align: bottom;
    line-height: 24px;
  }
}
</style>