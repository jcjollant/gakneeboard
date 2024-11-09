<template>
    <div class="contentPage approachPage">
        <Header :title="title" :page="true"
            @replace="emits('replace')" @click="toggleEditMode"></Header>
        <div v-if="editMode">
            <div class="editMode">
                <AirportInput label="Airport Code" :page="true" v-model="airport"/>
                <div v-if="airport" class="list">
                    <FAButton v-for="(iap,index) in airport['iap']" :label="iap['name']" icon="plane-arrival"
                        @click="onSelection(index)"/>
                </div>
            </div>
        </div>
        <div v-else class="viewMode">
            <ApproachPlate :pdf="selectedPdf" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import AirportInput from '../shared/AirportInput.vue';
import Header from '../shared/Header.vue';
import FAButton from '../shared/FAButton.vue';
import { getAirport } from '../../assets/data';
import ApproachPlate from './ApproachPlate.vue';

const pngOutput = ref(null)
const emits = defineEmits(['replace','toast','update'])
const editMode = ref(true)
const airport = ref(null)
const selectedPdf = ref('')
const title = ref('Instrument Approach')


// Props Management
const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ApporachPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data && newProps.data.airport) {
        const pdfIndex = newProps.data.pdf ?? 0
        getAirport(newProps.data.airport, true).then( a => {
            // console.log('[ApproachPage.loadProps] got airport', JSON.stringify(a))
            airport.value = a;
            showApproach(pdfIndex)
        })
        // fetch airport with that code
    } else {
        editMode.value = true;
    }
}

onMounted(async () => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management


// when button is pressed, show the selection and memorize new data
function onSelection(index) {
    if( showApproach(index) && airport.value) {
        // we are memorizing the index so the selection remains relevant across data cycles
        emits('update', {airport:airport.value['code'],pdf:index})
        // testZoomSettings()
    }
}

// Loads the approach plate into the UI and leaves edit mode
async function showApproach(index) {
    if(!airport.value) return false;
    try {
        title.value = airport.value['code'] + ' Instrument Approach';
        const pdfFile = airport.value['iap'][index]['pdf'];

        selectedPdf.value = pdfFile;
        editMode.value = false

        return true;

    } catch(e) {
        console.log('[ApproachPage.showApproach]' + e)
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
.editMode {
    padding: 5px;
}
.list {
    display: flex;
    flex-flow: column;
    padding: 10px;
    gap:10px;
    padding-top: 50px;
}
.viewMode {
    width: calc(var(--page-width)-1);
    height: calc(var(--page-content)-1);
}
</style>