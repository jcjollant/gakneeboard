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
            <embed class="pdf" :src="pdfUrl" 
                width="100%"
                height="100%"
                type="application/pdf" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Header from '../shared/Header.vue';
import AirportInput from '../shared/AirportInput.vue';
import { UserUrl } from '../../lib/UserUrl';
import FAButton from '../shared/FAButton.vue';
import { getAirport } from '../../assets/data';
import { emitToastWarning } from '../../assets/toast';

const emits = defineEmits(['replace','toast','update'])
const editMode = ref(true)
const airport = ref(null)
const pdfUrl = ref('')
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
            // console.log('[ApproachPage.loadProps] got airport', JSON.stringify(a))
            airport.value = a;
            showApproach(pdfIndex)
        })
        // fetch airport with that code
    } else {
        editMode.value = true;
    }
}

onMounted(() => {
    testZoomSettings()
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management


// when button is pressed, show the selection and memorize new data
function onSelection(index:number) {
    if( showApproach(index) && airport.value) {
        // we are memorizing the index so the selection remains relevant across data cycles
        emits('update', {airport:airport.value['code'],pdf:index})
        testZoomSettings()
    }
}

// Loads the approach plate into the UI and leaves edit mode
function showApproach(index:number):Boolean {
    if(!airport.value) return false;
    try {
        title.value = airport.value['code'] + ' Instrument Approach'
        const pdfFile:string = airport.value['iap'][index]['pdf'];
        pdfUrl.value = UserUrl.dtpp + pdfFile + '#toolbar=0&navpanes=0&scrollbar=0';
        editMode.value = false;
        return true;

    } catch(e) {
        console.log('[ApproachPage.showApproach]' + e)
        return false;        
    }
}

function testZoomSettings() {
    const zoom = (( window.outerWidth ) / window.innerWidth);
    if( zoom < 0.95 || zoom > 1.05) emitToastWarning( emits, 'Browser Zoom', 'Use 100% Zoom level for optimal PDF rendering')
}

function toggleEditMode() {
    // do not go back to main mode until we have something to show
    if( editMode.value && !pdfUrl.value) return;

    // toggle
    editMode.value = !editMode.value
}

// watch( airport, async() => {
//     console.log("[ApproachPage.watch] airport", JSON.stringify(airport.value));
// })

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
    height: var(--page-content)
}
</style>