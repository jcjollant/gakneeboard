<template>
    <div class="contentPage approachPage">
        <Header :title="title" :page="true" leftButton="settings"
            @replace="emits('replace')" @settings="toggleEditMode"></Header>
        <div v-if="editMode">
            <div class="editMode">
                <!-- <div v-if="knownAirports.length" class="known">
                    <div class="section">Recent Airports</div>
                    <FAButton v-for="a in knownAirports" :label="a['name']" icon="road-circle-check"
                        @click="onSelection(a)"/>
                </div> -->
                <div class="known">
                    <div class="section pickNewAirport">Pick New Airport</div>
                    <AirportInput v-model="airport" :page="true" :large="true" :expanded="true"/>
                    <div v-if="airport.isValid()" class="chartsList">
                        <FAButton v-if="airport.diagram" label="Show Diagram" icon="road-circle-check" class="showDiagram"
                            @click="onSelection(airport)"/>
                        <div v-else class="notfound">(No Associated Airport Diagram for {{ airport.code }})</div>

                        <FAButton v-if="airport.supp" label="Supplement" icon="book-open" class="showSupplement"
                            @click="onSupplement(airport)"/>
                        <FAButton v-if="airport.notice" label="Notice" icon="exclamation-circle" class="showNotice"
                            @click="onNotice(airport)"/>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="viewMode">
            <Diagram :pdf="selectedPdf" :type="selectedType" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import AirportInput from '../shared/AirportInput.vue';
import Diagram from './Diagram.vue';
import FAButton from '../shared/FAButton.vue';
import Header from '../shared/Header.vue';
import { getAirport } from '../../services/AirportDataService';
import { sessionAirports } from '../../assets/data';
import { UserUrl } from '../../lib/UserUrl';
import { Airport } from '../../models/Airport';
import { ChartType } from '../../services/DiagramService';

const noAirport = new Airport()
const airport = ref(noAirport)
const editMode = ref(false)
const emits = defineEmits(['replace','update'])
const knownAirports = ref(<any>[])
const selectedPdf = ref('')
const selectedType = ref(ChartType.Diagram)
const title = ref('Airport Diagram & Chart Supplement')

// Props Management
const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps:any) {
    // console.log('[DiagramPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data && newProps.data.airport) {
        getAirport(newProps.data.airport, true).then( a => {
            // console.log('[DiagramPage.loadProps]', JSON.stringify(a))
            airport.value = Airport.copy(a);
            const type = newProps.data.type ? newProps.data.type : ChartType.Diagram
            selectedType.value = type
            switch(type) {
                case ChartType.Supplement:
                    title.value = 'Chart Supplement'
                    selectedPdf.value = airport.value.supp ? airport.value.supp : ''
                    break;
                case ChartType.Notice:
                    title.value = 'Notice'
                    selectedPdf.value = airport.value.notice ? airport.value.notice : ''
                    break;
                default:
                    title.value = 'Airport Diagram'
                    selectedPdf.value = airport.value.diagram ? airport.value.diagram : ''
                    break;
            }
        })
        // fetch airport with that code
    } else {
        editMode.value = true;
    }
}

onMounted(() => {
    sessionAirports.addListener(refreshAirportList)
    loadProps(props)
})

// watch(airport, () => {
//     console.log('[DiagramPage.watch] airport', airport.value)
// })

watch(props, () => {
    loadProps(props)
})
// End of props management


function onSelection(newAirport:Airport) {
    // console.log('[DiagramPage.onSelection]', newAirport)
    if(!newAirport || !newAirport.code || !newAirport.diagram) return;
    onUpdate(newAirport, newAirport.diagram, ChartType.Diagram)
}

function onSupplement(newAirport:Airport) {
    if(!newAirport || !newAirport.code || !newAirport.supp) return;
    onUpdate(newAirport, newAirport.supp, ChartType.Supplement)
}

function onNotice(newAirport:Airport) {
    if(!newAirport || !newAirport.code || !newAirport.notice) return;
    onUpdate(newAirport, newAirport.notice, ChartType.Notice)
}

function onUpdate(newAirport:Airport, pdfValue:string, typeValue:ChartType) {
    selectedPdf.value = pdfValue
    selectedType.value = typeValue
    editMode.value = false
    emits('update', {airport:newAirport.code, type:selectedType.value})
}

function refreshAirportList(airports:any[]) {
    // only keep airports with a diagram
    knownAirports.value = airports.filter(a => 'diag' in a);
}

function toggleEditMode() {
    if( editMode.value) { // we are leaving the editor
        // do not go back to main mode until we have something to show
        if(!selectedPdf.value) return;
    } 

    // toggle
    editMode.value = !editMode.value
}

</script>

<style scoped>
.currentSelection {
    padding: 5px;
    display: grid;
    align-items: center;
    grid-template-columns: 150px auto;
    font-size: small;
    text-align: left;
}
.editMode {
    padding: 5px;
    display: flex;
    flex-flow: column;
    gap:30px;
}
.notfound {
    opacity: 0.5;
}
.section {
    font-weight: 800;
    font-size: 0.8rem;
    opacity: 0.5;
}
.chartsList {
    display: flex;
    flex-flow: column;
    gap:5px;
}
</style>