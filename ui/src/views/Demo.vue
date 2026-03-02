<template>
  <div class="demo">
    <RouteDialog v-model:visible="showFlightDialog" :modelValue="flightRoute" :video="UserUrl.routeVideo"
      message="Let's make this kneeboard useful by selecting airports you care about"
      @cancel="onRouteCancel" @confirm="onRouteConfirm" />
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
import { LocalStoreService } from '../services/LocalStoreService'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../assets/Toaster'
import { Airport } from '../models/Airport'
import { DisplayModeIfr, DisplayModeSunlight } from '../models/DisplayMode'
import { Frequency, FrequencyType } from '../models/Frequency'
import { Formatter } from '../lib/Formatter'
import { getAirport } from '../services/AirportDataService'
import { Route as FlightRoute } from '@gak/shared'

import RouteDialog from '../components/templates/RouteDialog.vue'
import { UserUrl } from '../lib/UserUrl'
import { currentUser } from '../assets/data'

const locationRoute = useRoute()
const router = useRouter()
const demoName = locationRoute.params.name as string
const showFlightDialog = ref(false)
const toast = useToast()
const toaster = useToaster(toast)

const flightRoute = ref<FlightRoute>({ dep: 'KBFI', dst: 'KPAE', alt: 'KRNT' })

let isConfirming = false
onMounted(() => {

  if (demoName === SheetName.vfrFlight || demoName == SheetName.ifrFlight) {
    // try to build a route from last route
    const lastRoute = LocalStoreService.getRoute()
    if (lastRoute) {
      flightRoute.value = lastRoute
    } else if (currentUser.homeAirport) {
      flightRoute.value.dep = currentUser.homeAirport
    }
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
  LocalStoreService.saveTemplate(templateData)
  router.replace('/template/local')
}

function setAirportTile(templateData: any, code:string, airport: Airport, pageNumber: number, tileNumber: number) {
  if (templateData.data[pageNumber]?.data?.[tileNumber]) {
    templateData.data[pageNumber].data[tileNumber].data = {code: code, rwy: airport.rwys[0].name}
  }
}

function setRadioTile(templateData: any, frequencies: Frequency[], pageNumber: number, tileNumber: number) {
  if (templateData.data[pageNumber]?.data?.[tileNumber] && frequencies.length > 0) {
    templateData.data[pageNumber].data[tileNumber].data = {list: frequencies}
  }
}

function setTileData(templateData: any, pageNumber: number, tileNumber: number, tileData: any) {
  if (templateData.data[pageNumber]?.data?.[tileNumber]) {
    templateData.data[pageNumber].data[tileNumber].data = tileData
  }
}

function setPageData(templateData: any, pageNumber: number, pageData: any) {
  if (templateData.data[pageNumber]) {
    templateData.data[pageNumber].data = pageData
  }
}

function onRouteCancel() {
  if (isConfirming) return
  router.push('/')
}

async function onRouteConfirm(newRoute: FlightRoute) {
  isConfirming = true
  LocalStoreService.saveRoute(newRoute)
  // close dialog
  showFlightDialog.value = false
  const templateData = DemoData.fromName(demoName)
  if (!templateData) {
    toaster.error('Load Demo', 'Unknown Demo Template')
    return
  }

  const airports: {departure: Airport | null, destination: Airport | null, alternate: Airport | null} = {
    departure: null,
    destination: null,
    alternate: null
  }

  try {
    if (newRoute.dep) airports.departure = await getAirport(newRoute.dep)
    if (newRoute.dst) airports.destination = await getAirport(newRoute.dst)
    if (newRoute.alt) airports.alternate = await getAirport(newRoute.alt)
  } catch (e) {
    console.error('Failed to resolve airports:', e)
  }
  
  // Build a list of airports to display frequencies
  const frequencies: Frequency[] = []
  const airportList = [airports.departure, airports.destination, airports.alternate].filter(a => a !== null && a.isValid()) as Airport[]
  
  airportList.forEach(airport => {
    // console.debug('[Demo.onFlightConfirm]', airport)
    airport?.freq?.forEach(freq => {
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
      if (airports.departure) {
        // Force departure airport in top left tile (Page 0 tile 0)
        setAirportTile(templateData, '#dep', airports.departure, 0, 0)
        // Force sunlight to departure airport (Page 1 tile 3)
        setTileData(templateData, 1, 3, {from: airports.departure.code, to: airports.departure.code, mode: DisplayModeSunlight.Flight})
      }
      if (airports.destination) {
        // Force destination airport (Page 0 tile 4)
        setAirportTile(templateData, '#dst', airports.destination, 0, 4)
      }
      if (airports.alternate) {
        // Force alternate airport (Page 1 tile 1)
        setAirportTile(templateData, '#alt', airports.alternate, 1, 1)
      }
      
      // Set frequencies (Page 0 tile 2)
      setRadioTile(templateData, frequencies, 0, 2)

    } else if( demoName == SheetName.ifrFlight) {
      // replace destination airport
      if(airports.departure) {
        setTileData( templateData, 0, 0, {  mode: DisplayModeIfr.Departure,  airport: airports.departure.code} )
      }

      if( airports.destination) {
        setPageData( templateData, 2, { airport: airports.destination.code, "pdf": 0 })
      }

      // replace alternate airport
      if(airports.alternate) {
        setAirportTile(templateData, '#alt', airports.alternate, 1, 2)
      }
      // refresh frequencies
      setRadioTile(templateData, frequencies, 0, 1)
    }
    // Assign route to template
    templateData.route = newRoute
  } catch (e) {
    toaster.error('Load Demo', 'Error loading demo data')
    console.error( '[Demo.onFlightConfirm]' + e)
    return
  }
  
  LocalStoreService.saveTemplate(templateData)
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