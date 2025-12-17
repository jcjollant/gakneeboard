<template>
    <div class="airportCode" :class="{page:page, 'expanded-mode': expanded, 'large-mode': large}">
        <InputGroup>
            <InputGroupAddon :class="{page:page}">{{label}}</InputGroupAddon>
            <InputText v-model="code" @input="onCodeUpdate"/>
        </InputGroup>
        <div v-if="name" class="nameGroup">
            <span class="airportName" :class="{valid: valid, page:page}">{{ name }}</span>
            <span v-if="!expanded" class="recentAirport"  @click="name=''" title="Show Recent Airports">...</span>
        </div>
        <div v-else-if="!expanded" class="recentAirportList">
            <div v-for="a in airports" class="recentAirport" @click="onRecentAirport(a)">{{ a }}</div>
        </div>
        <div v-if="expanded" class="recentAirportList expanded">
            <span>Recent:</span>
            <div v-for="a in airports" class="recentAirport" @click="onRecentAirport(a)">{{ a }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Airport } from '../../models/Airport.ts'
import { getAirport } from '../../services/AirportService'
import { LocalStoreService } from '../../services/LocalStoreService'
import { sessionAirports } from '../../assets/data'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../../assets/Toaster'

import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon';

const emits = defineEmits(['valid', 'invalid'])

const props = defineProps({
    code: { type: String, default: ''},
    label: { type: String, default: 'Code'},
    page: {type: Boolean, default: false},
    expanded: {type: Boolean, default: false},
    large: {type: Boolean, default: false},
})
const noAirport:string[] = []
const invalidAirport:Airport = new Airport()
const airports = ref(noAirport)
const code = ref()
const model = defineModel<Airport|undefined>()
const name = ref('')
const valid = ref(false)
let timeoutId:ReturnType<typeof setTimeout>|undefined = undefined
const toaster = useToaster( useToast())
let unsubscribe: (() => void) | undefined = undefined

async function loadProps(props:any) {
    // console.log('[AirportInput.loadProps]', props)
    let airport:Airport|undefined = undefined
    if(model.value) {
        const airport = model.value as Airport;
    } else {
        code.value = props.code
        try {
            fetchAirport()
        } catch (e) {
            // Airport not in local store, will be fetched by AirportInput
            console.log(`[AirportInput.loadProps] Airport ${props.code} not found`, e)
        }
    }
}

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
    sessionAirports.addListener(refreshAirportList)
    refreshAirportList()
    unsubscribe = LocalStoreService.subscribe(refreshAirportList)
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

function fetchAirport() {
    // console.log('[AirportInput.fetchAirport]', code.value, code.value.length)
    if(!code.value || code.value.length < 3) return

    getAirport( code.value)
        .then( a => {
            // console.log('[AirportInput.fetchAirport] received', a)
            const airport = Airport.copy(a)
            // console.log('[AirportInput.fetchAirport] copied', airport)
            if( airport.isValid()) {
                // console.debug('[AirportInput.fetchAirport] valid', airport)
                name.value = airport.name
                code.value = airport.code
                valid.value = true
                model.value = airport
                emits('valid', airport)
            } else { // airport is unknown
                toaster.warning( 'Invalid Airport', code.value + ' may not be valid');
                valid.value = false
                name.value = "Unknown"
                model.value = invalidAirport
                emits('invalid', code.value)
            }
        })
}

// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    // console.log('[AirportEdit.onCodeUpdate]',Date.now())
    name.value = '...'
    valid.value = false
    
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = undefined
    }

    // only load the new code after a short delay to avoid sending useless query
    if( code.value && code.value.length > 2) {
        timeoutId = setTimeout( () => {
            fetchAirport()
        }, 500)
    }
}

function onRecentAirport(airportCode:string) {
    try {
        const airport:Airport = LocalStoreService.airportGet(airportCode)
        // console.log('[AirportInput.onRecentAirport]', airportCode, airport)
        code.value = airport.code
        name.value = airport.name
        valid.value = true
        model.value = airport
        emits('valid', airport)
    } catch(e) {
        console.log('[AirportInput] onRecentAirport',e)
    }
}

function refreshAirportList() {
    airports.value =  LocalStoreService.airportRecentsGet(5).sort();
}

</script>

<style scoped>
.airportCode {
    display: grid;
    grid-template-columns: 100px auto;
    font-size: 0.8rem;
    line-height: 1.5rem;
    text-align: left;
    gap:5px;
}
.airportCode.page {
    grid-template-columns: 150px auto;
}
.airportName {
    overflow: hidden;
    line-height: 22px;
    height: 22px;
    font-size: 0.7rem;
}
.airportName.page {
    font-size: 0.9rem;
}
.recentAirport {
    border-radius: 3px;
    color: white;
    background-color: var(--bg-secondary);
    cursor: pointer;
    padding: 0 5px;
}
.recentAirport:hover {
    background-color: var(--bg-hover);
}
.recentAirportList {
    display: flex;
    font-size: 0.7rem;
    line-height: 22px;
    height: 22px;
    overflow: hidden;
    gap: 5px;
    align-items: center;
    flex-wrap: wrap;
}
.recentAirportList.expanded {
    padding-top: 5px;
}
.valid {
    font-weight: bold;
    /* color:darkgreen */
}

.expanded {
    grid-column: 1 / span 2;
    height: fit-content;
}

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
    
}
:deep(.p-inputgroup-addon) {
    width: 3rem;
}
:deep(.p-inputgroup-addon).page {
    width: 6rem;
}
:deep(.p-inputtext) {
    padding: 5px;
}
.nameGroup {
    display: flex;
    justify-content: space-between;
    height: 22px;
}

/* Expanded Mode Styles */
.airportCode.large-mode {
    grid-template-columns: 150px auto;
}

.airportCode.large-mode .nameGroup {
    height: 2.5rem;
    align-items: center;
}

.airportCode.large-mode .airportName {
    font-size: 1.2rem;
    line-height: 1.2;
    height: auto;
}

.airportCode.large-mode :deep(.p-component),
.airportCode.large-mode :deep(.p-inputgroup-addon) {
    font-size: 1.2rem;
    height: 2.5rem;
    padding-left: 15px;
    padding-right: 15px;
}
.airportCode.large-mode :deep(.p-inputgroup-addon) {
    width: auto;
    min-width: 3rem; 
}
</style>