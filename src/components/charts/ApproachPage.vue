<template>
    <div class="contentPage approachPage">
        <Header :title="title" :page="true" :displayMode="false"
            @replace="emits('replace')" @click="toggleEditMode"></Header>
        <div v-if="editMode" class="editMode">
            <AirportInput label="Airport Code" :page="true" v-model="airport"/>
            <div v-if="selectedPdf && airport.isValid()" class="currentSelection">
                <div>Selected Approach</div>
                <a :href="UserUrl.dtpp + selectedPdf" target="_blank">{{ airport['iap'][selectedIndex]['name'] }}</a>
            </div>
            <div v-if="airport.isValid()" class="list">
                <FAButton v-for="(iap,index) in airport['iap']" :label="iap['name']" icon="plane-arrival"
                    @click="onSelection(index)"/>
            </div>
        </div>
        <div v-else class="viewMode">
            <ApproachPlate :pdf="selectedPdf" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getAirport } from '../../assets/data';
import { UserUrl } from '../../lib/UserUrl';
import { Airport } from '../../models/Airport';
import AirportInput from '../shared/AirportInput.vue';
import ApproachPlate from './Diagram.vue';
import Header from '../shared/Header.vue';
import FAButton from '../shared/FAButton.vue';

const emits = defineEmits(['replace','update'])
const editMode = ref(true)
const noAirport = new Airport()
const airport = ref(noAirport)
const selectedPdf = ref('')
const selectedIndex = ref(0)
const title = ref('Instrument Approach')


// Props Management
const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps:any) {
    // console.log('[ApporachPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data && newProps.data.airport) {
        const pdfIndex = newProps.data.pdf ?? 0
        getAirport(newProps.data.airport, true).then( a => {
            // console.log('[ApproachPage.loadProps] got airport', a)
            airport.value = Airport.copy(a);
            selectedIndex.value = pdfIndex
            showApproach(pdfIndex)
        })
        // fetch airport with that code
    } else {
        editMode.value = true;
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management


// when button is pressed, show the selection and memorize new data
async function onSelection(index:number) {
    if( await showApproach(index) && airport.value) {
        // we are memorizing the index so the selection remains relevant across data cycles
        selectedIndex.value = index
        emits('update', {airport:airport.value['code'],pdf:index})
    }
}

// Loads the approach plate into the UI and leaves edit mode
async function showApproach(index:number) {
    // console.log('[ApproachPage.showApproach]', index)
    if(!airport.value) return false;
    try {
        title.value = airport.value['code'] + ' Instrument Approach';
        const pdfFile = airport.value['iap'][index]['pdf'];

        selectedPdf.value = pdfFile;
        editMode.value = false

        return true;

    } catch(e) {
        console.log('[ApproachPage.showApproach]' + e, airport.value)
        return false;        
    }
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
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap: 10px;
    height: var(--page-content);
}
.list {
    display: flex;
    flex-flow: column;
    gap:10px;
    height: 100%;
    overflow: auto;
}
.viewMode {
    width: calc(var(--page-width)-1);
    height: calc(var(--page-content)-1);
}
</style>