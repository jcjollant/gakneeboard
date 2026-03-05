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

  
  try {
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