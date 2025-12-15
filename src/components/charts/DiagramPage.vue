<template>
    <div class="contentPage approachPage">
        <Header :title="title" :page="true" :displayMode="false"
            @replace="emits('replace')" @click="toggleEditMode"></Header>
        <div v-if="editMode">
            <div class="editMode">
                <!-- <div v-if="knownAirports.length" class="known">
                    <div class="section">Recent Airports</div>
                    <FAButton v-for="a in knownAirports" :label="a['name']" icon="road-circle-check"
                        @click="onSelection(a)"/>
                </div> -->
                <div class="known">
                    <div class="section pickNewAirport">Pick New Airport</div>
                    <AirportInput label="Airport Code" :page="true" v-model="airport"/>
                    <div v-if="airport.isValid()">
                        <FAButton v-if="airport.diagram" label="Show Diagram" icon="road-circle-check" class="showDiagram"
                            @click="onSelection(airport)"/>
                        <div v-else class="notfound">(No Associated Airport Diagram for {{ airport.code }})</div>
                    </div>
                </div>
                <div class="known" v-if="selectedPdf">
                    <div class="section pickNewAirport">Current Selection</div>
                    <div class="openpdf">
                        <a :href="UserUrl.dtpp + selectedPdf" target="_blank">Open PDF in new tab</a>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="viewMode">
            <Diagram :pdf="selectedPdf" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import AirportInput from '../shared/AirportInput.vue';
import Diagram from './Diagram.vue';
import FAButton from '../shared/FAButton.vue';
import Header from '../shared/Header.vue';
import { getAirport, sessionAirports } from '../../assets/data';
import { UserUrl } from '../../lib/UserUrl';
import { Airport } from '../../models/Airport';

const noAirport = new Airport()
const airport = ref(noAirport)
const editMode = ref(false)
const emits = defineEmits(['replace','update'])
const knownAirports = ref(<any>[])
const selectedPdf = ref('')
const title = ref('Airport Diagram')

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
            selectedPdf.value = airport.value.diagram ? airport.value.diagram : ''
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
    selectedPdf.value = newAirport.diagram
    // console.log('[DiagramPage.onSelection]', selectedPdf.value)
    editMode.value = false
    // save data
    emits('update', {airport:newAirport.code})
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
.known {
    display: flex;
    flex-flow: column;
    gap:5px;
}
.notfound {
    opacity: 0.5;
}
.openpdf {
    font-size: 0.8rem;
    padding-top: 10px;
}
.section {
    font-weight: 800;
    font-size: 0.8rem;
    opacity: 0.5;
}
</style>