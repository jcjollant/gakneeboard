<template>
  <div class="demo">
    <FlightInfoDialog v-model:visible="showFlightDialog" @cancel="onCancel" @confirm="onFlightConfirm" />
    <div class="spinner"></div>
    <h1>Loading Demo...</h1>
    <p>{{ demoName }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SheetName } from '../assets/sheetData'
import { DemoData } from '../assets/DemoData'
import { LocalStore } from '../lib/LocalStore'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../assets/Toaster'
import FlightInfoDialog from '../components/shared/FlightInfoDialog.vue'
import { Airport } from '../model/Airport'
import { DisplayModeSunlight } from '../model/DisplayMode'
import { Frequency, FrequencyType } from '../model/Frequency'
import { Formatter } from '../lib/Formatter'

const route = useRoute()
const router = useRouter()
const demoName = route.params.name as string
const showFlightDialog = ref(false)
const toast = useToast()
const toaster = useToaster(toast)

onMounted(() => {
  if (demoName === SheetName.vfrFlight || demoName == SheetName.ifrFlight) {
    showFlightDialog.value = true
  } else {
    loadDemo()
  }
})

function loadDemo() {
  const templateData = DemoData.fromName(demoName)
  if (!templateData) {
    toaster.error('Load Demo', 'Unknown Demo Template')
    return
  }
  LocalStore.saveTemplate(templateData)
  router.replace('/template/local')
}

function setAirportTile(templateData: any, airport: Airport, pageNumber: number, tileNumber: number) {
  if (templateData.data[pageNumber]?.data?.[tileNumber]) {
    templateData.data[pageNumber].data[tileNumber].data = {code: airport.code, rwy: airport.rwys[0].name}
  }
}

function setRadioTile(templateData: any, frequencies: Frequency[], pageNumber: number, tileNumber: number) {
  if (templateData.data[pageNumber]?.data?.[tileNumber] && frequencies.length > 0) {
    templateData.data[pageNumber].data[tileNumber].data = {list: frequencies}
  }
}

function onCancel() {
  router.push('/')
}

function onFlightConfirm(airports: {from: Airport | null, to: Airport | null, alternate: Airport | null}) {
  showFlightDialog.value = false
  const templateData = DemoData.fromName(demoName)
  if (!templateData) {
    toaster.error('Load Demo', 'Unknown Demo Template')
    return
  }
  
  const frequencies: Frequency[] = []
  const airportList = [airports.from, airports.to, airports.alternate].filter(a => a !== null) as Airport[]
  
  airportList.forEach(airport => {
    airport.freq.forEach(freq => {
      const freqType = Frequency.typeFromString(freq.name)
      if (freqType === FrequencyType.weather || freqType === FrequencyType.tower || 
          freqType === FrequencyType.ctaf || freqType === FrequencyType.ground) {
        frequencies.push(new Frequency(Formatter.frequency(freq), `${airport.code} ${freq.name}`, freqType))
      }
    })
  })
  frequencies.sort((a,b) => a.type.localeCompare(b.type))
  
  try {
    if( demoName == SheetName.vfrFlight) {
      if (airports.from) {
        setAirportTile(templateData, airports.from, 0, 0)
        templateData.data[1].data[3].data = {from: airports.from.code, to: airports.from.code, mode: DisplayModeSunlight.Flight}
      }
      if (airports.to) {
        setAirportTile(templateData, airports.to, 0, 4)
      }
      if (airports.alternate) {
        setAirportTile(templateData, airports.alternate, 1, 1)
      }
      setRadioTile(templateData, frequencies, 0, 2)
    } else if( demoName == SheetName.ifrFlight) {
      // replace alternate airport
      if(airports.alternate) {
        setAirportTile(templateData, airports.alternate, 1, 2)
      }
      // refresh frequencies
      setRadioTile(templateData, frequencies, 0, 1)
    }
  } catch (e) {
    toaster.error('Load Demo', 'Error loading demo data')
    console.error( '[Demo.onFlightConfirm]' + e)
    return
  }
  
  LocalStore.saveTemplate(templateData)
  router.replace('/template/local')
}
</script>

<style scoped>
.demo {
  padding: 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>