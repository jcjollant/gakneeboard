<template>
    <div class="fuel-entry">
        <div v-if="loading" class="loading-overlay">
            <font-awesome-icon icon="fa-solid fa-spinner" spin class="spinner-icon" />
            <div class="loading-text">Loading aircraft data…</div>
        </div>

        <!-- Aircraft Selection Dialogs -->
        <AircraftSelectionDialog
            v-model:visible="showAircraftSelection"
            :aircrafts="selectionAircrafts"
            :header="selectionHeader"
            @selected="onAircraftSelected"
            @update:visible="onDialogVisibilityChange"
        />
        <AircraftSelectionDialog
            v-model:visible="showTemplateSelection"
            :aircrafts="selectionAircrafts"
            :header="selectionHeader"
            :templateMode="true"
            @selected="onAircraftSelected"
            @update:visible="onTemplateDialogVisibilityChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Aircraft, TemplateFormat } from '@gak/shared'
import { AircraftService } from '../services/AircraftService'
import { routeToLocalTemplate } from '../assets/data.js'
import { getTemplateBlank } from '../assets/sheetData.js'
import { PageType } from '../assets/PageType'
import { TemplatePage } from '../models/Template'
import AircraftSelectionDialog from '../components/aircraft/AircraftSelectionDialog.vue'
import { AnalyticsService } from '../services/AnalyticsService'

const router = useRouter()

const loading = ref(true)
const showAircraftSelection = ref(false)
const showTemplateSelection = ref(false)
const selectionAircrafts = ref<Aircraft[]>([])
const selectionHeader = ref('')

onMounted(async () => {
    try {
        const userAircrafts = await AircraftService.list()

        if (userAircrafts.length === 1) {
            // Only one aircraft — skip selection entirely
            createWorksheet(userAircrafts[0])
        } else if (userAircrafts.length > 1) {
            // Multiple user aircraft — let user pick
            selectionAircrafts.value = userAircrafts
            selectionHeader.value = 'Select Your Aircraft'
            loading.value = false
            showAircraftSelection.value = true
        } else {
            // No user aircraft — fall back to templates
            const templates = await AircraftService.listTemplates()
            selectionAircrafts.value = templates
            selectionHeader.value = 'Select Aircraft Template'
            loading.value = false
            showTemplateSelection.value = true
        }
    } catch {
        // On any error just go home
        router.push('/')
    }
})

function createWorksheet(aircraft: Aircraft) {
    AnalyticsService.viewFuelWorksheet('direct')
    const templateData = getTemplateBlank()
    templateData.name = aircraft.tailNumber + ' Fuel Worksheet'
    templateData.desc = 'Fuel Worksheet for ' + aircraft.tailNumber
    templateData.format = TemplateFormat.FullPage
    templateData.data = [new TemplatePage(PageType.fuelWorksheet, 'Fuel Worksheet', {
        aircraftTailNumber: aircraft.tailNumber,
        hangarItems: [],
        aircraftItems: [],
        flightRules: 'VFR',
        ifrAlternateMinutes: 0,
        personalBufferMinutes: 45,
        taxiFuelGallons: 0,
        legs: []
    })]
    routeToLocalTemplate(router, templateData)
}

function onAircraftSelected(aircraft: Aircraft) {
    showAircraftSelection.value = false
    showTemplateSelection.value = false
    createWorksheet(aircraft)
}

function onDialogVisibilityChange(visible: boolean) {
    if (!visible && !showAircraftSelection.value) {
        // User dismissed the dialog without selecting
        router.push('/')
    }
}

function onTemplateDialogVisibilityChange(visible: boolean) {
    if (!visible && !showTemplateSelection.value) {
        router.push('/')
    }
}
</script>

<style scoped>
.fuel-entry {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: var(--surface-ground, #f8f9fa);
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--bg, #0369a1);
}

.spinner-icon {
    font-size: 3rem;
}

.loading-text {
    font-size: 1.1rem;
    color: #6c757d;
}
</style>
