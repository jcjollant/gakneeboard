<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAirport } from '../../assets/data'

import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon';

const emits = defineEmits(['valid', 'invalid'])

const props = defineProps({
    code: { type: String, default: ''},
    label: { type: String, default: 'Code'},
})

const code = ref()
const name = ref('')
const valid = ref(false)
let pendingCode = null // used during the short delay between code update and actual request

function loadProps(props) {
    // console.log('[AirportInput.loadProps]')
    code.value = props.code
    valid.value = false
}

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

function fetchAirport() {
    // console.log('[AirportInput.fetchAirport]', code.value)
    getAirport( code.value)
        .then( airport => {
            // console.log('[AirportInput.fetchAirport] received', JSON.stringify(airport))
            if( airport && airport.version != -1) {
                name.value = airport.name
                code.value = airport.code
                valid.value = true
                emits('valid', airport)
            } else { // airport is unknown
                valid.value = false
                name.value = "Unknown"
                emits('invalid', code.value)
            }
        })
}

// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    // console.log('[AirportEdit.onCodeUpdate]',Date.now())
    pendingCode = code.value
    name.value = '...'
    valid.value = false
    // only load the new code after a short delay to avoid sending useless query
    if( pendingCode.length > 2) {
        setTimeout( () => {
            // check if code has not changed
            if( pendingCode == code.value) {
                pendingCode = null
                fetchAirport()
            }
        }, 500)
    }
}


</script>

<template>
    <div class="airportCode">
        <InputGroup>
            <InputGroupAddon>{{label}}</InputGroupAddon>
            <InputText v-model="code" @input="onCodeUpdate"/>
        </InputGroup>
        <span class="airportName" :class="{'valid': valid}">{{ name }}</span>
    </div>
</template>

<style scoped>
.airportCode {
    display: grid;
    grid-template-columns: 100px auto;
    font-size: 0.8rem;
    line-height: 1.5rem;
    text-align: left;
    gap:5px;
}
.airportName {
    overflow: hidden;
    line-height: 1.5rem;
    height: 1.5rem;
    font-size: 0.7rem;
}

.valid {
    font-weight: bold;
    /* color:darkgreen */
}

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
    
}
:deep(.p-inputgroup-addon) {
    width: 3rem;
}
:deep(.p-inputtext) {
    padding: 5px;
}
</style>