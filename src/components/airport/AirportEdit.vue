<script setup>
import { ref, onMounted, watch } from 'vue'
import * as data from '../../assets/data.js'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext'
import CustomAirport from './CustomAirport.vue';
import { Airport } from '../../assets/Airport';

const emits = defineEmits(['close','selection'])

/**
 * Props management (defineProps, loadProps, onMounted, watch)
 */
 const props = defineProps({
    airport: { type: Object, default: null},
    rwyName: { type: String, default: null},
    rwyOrientation: { type: String, default: null},
})

function loadProps(props) {
    // console.log('AirportEdit loading props ' + JSON.stringify(props))
    if( props.airport) {
        airport = props.airport
        showAirport()
        // update edit field value to reflect airport code
        airportCode.value = airport.code;
        // if we have an airport to start with, we can revert.
        cancellable.value = true;
        applyable.value = true;
        
        // select the first runway by default
        if( props.rwyName) {
            selectedRwy.value = props.rwyName
        } else {
            // console.log( "using first runway")
            selectedRwy.value = airport.rwys[0].name
        }

        rwyOrientation.value = (props.rwyOrientation ? props.rwyOrientation : 'vertical')
        // console.log( 'AirportEdit loadProps ' + props.rwyOrientation)
    }
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


let airport = null
const loading = ref(false)
const rwyList = ref([])
const airportCode = ref('')
const airportName = ref('')
const cancellable = ref(false)
const applyable = ref(false)
const validAirport = ref(false)
const rwyOrientation = ref('vertical')
const selectedRwy = ref(null)
const showCustomAirport = ref(false)
const customAirport = ref(null)

function loadAirport( code) {
    data.getAirport( code)
    .then( newAirport => {
        loading.value = false;
        if( newAirport) {
            // console.log("[AirportEdit.loadAirport] airport", JSON.stringify(airport))
            console.log("[AirportEdit.loadAirport] newAirport", JSON.stringify(newAirport))
            airport = newAirport
            showAirport()
            // select the first runway by default
            console.log("[AirportEdit.loadAirport] runways", JSON.stringify(airport.rwys))
            if('rwys' in airport && airport.rwys.length > 0) {
                selectedRwy.value = airport.rwys[0]['name']
                applyable.value = true
            } else {
                applyable.value = false
            }
            if( 'custom' in airport && airport.custom) {
                customAirport.value = newAirport
            } else {
                customAirport.value = null
            }

            // we cannot apply until we pick a runway
        } else { // airport is unknown
            rwyList.value = [];
            validAirport.value = false
        }
    })
}

// settings are applied
function onApply() {
    // update settings with orientation
    emits('selection', airport, selectedRwy.value, rwyOrientation.value.toLowerCase())
}
    
// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    loading.value = true
    airportName.value = ' '

    loadAirport( airportCode.value)
}
        
                    
function onCustomUpdated(code) {
    showCustomAirport.value=false
    airportCode.value = code
    
    loadAirport(code)
}

function onCreateCustom() {
    const customAirport = new Airport( airportCode, "", 0)
    customAirport.custom = true
    showCustomAirport.value = true
}

function onEditCustom() {
    showCustomAirport.value = true
}

// A runway has been selected from the list
function selectRunway(rwy) {
    console.log( "[AirportEdit.selectRunway]", rwy)
    applyable.value = true
    selectedRwy.value = rwy
}

function showAirport() {
    rwyList.value = airport.rwys;
    airportName.value = airport.name
    validAirport.value = true;
}
                            
</script>

<template>
    <div class="content">
        <div class="settings">
            <div class="editItem">Code</div>
            <div class="airportInformation">
                <InputText v-model="airportCode" @input="onCodeUpdate" aria-describedby="airport-name"/>
                <small id="airport-name">{{airportName}}</small>
            </div>
            <div class="editItem">Runway</div>
            <ProgressSpinner v-if="loading" class="spinner" ></ProgressSpinner>
            <div v-else class="rwySelector">
                <CustomAirport v-model:visible="showCustomAirport"  :airport="customAirport"
                    @close="showCustomAirport=false" @updated="onCustomUpdated" />
                <Button label="Unknown Airport" class="sign" v-if="!validAirport" 
                    @click="onCreateCustom"></Button>
                <Button :label="rwy.name" class="sign" :severity="rwy.name == selectedRwy ? 'primary' : 'secondary'"
                    v-for="rwy in rwyList" 
                    @click="selectRunway(rwy.name)"></Button>
                <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :severity="selectedRwy == 'all' ? 'primary' : 'secondary'"
                        @click="selectRunway('all')"></Button>
            </div>
            <div class="editItem" v-if="validAirport">Orientation</div>
            <div class="rwyOrientation" v-if="validAirport">
                <Button label="Vertical" 
                    @click="rwyOrientation='vertical'" :severity="rwyOrientation == 'vertical' ? 'primary' : 'secondary'"></Button>
                <Button label="Magnetic" 
                    @click="rwyOrientation='magnetic'" :severity="rwyOrientation == 'magnetic' ? 'primary' : 'secondary'"></Button>
            </div>
            <!-- <div class="editItem">Label</div>
            <div class="rwyOrientation" v-if="validAirport">
                <Button label="LxW" 
                    @click="rwyOrientation='vertical'" :severity="rwyOrientation == 'vertical' ? 'primary' : 'secondary'"></Button>
                <Button label="GND" 
                    @click="rwyOrientation='magnetic'" :severity="rwyOrientation == 'magnetic' ? 'primary' : 'secondary'"></Button>
                <Button label="Blank" 
                    @click="rwyOrientation='magnetic'" :severity="rwyOrientation == 'magnetic' ? 'primary' : 'secondary'"></Button>
            </div> -->
            <div class="actionBar">
                <Button v-if="customAirport" label="Edit" @click="onEditCustom"></Button>
                <Button v-if="cancellable" label="Cancel" link @click="emits('close')"></Button>
                <Button icon="pi pi-check" label="Apply" 
                    @click="onApply" :disabled="!applyable" ></Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .settings {
        display: grid;
        grid-template-columns: 55px 170px;
        gap: 5px;
        padding: 5px;
    }
    #airport-name {
        font-size: 0.6rem;
        line-height: 0.6rem;
    }
    .airportInformation {
        display: flex;
        flex-flow: column;
        gap: 2px;
    }
    .airportCodeInput {
        text-align: left;
        /* width: 90px; */
    }
    .rwySelector {
        /* font-size: 1rem; */
        /* margin:0px 5px;  */
        display:grid;
        grid-template-columns: auto auto auto;
        gap: 2px 5px;
    }

    .sign {
        border-radius: 4px;
        /* border: 1px solid black; */
        padding: 2px 2px;
        font-size: 0.7rem;
    }
    /* todo activate on long list of rwy */
    .dense {
        font-size: 0.7rem;
    }
    .location {
        background: #ffbb00;
        color:black;
    }
    .runway {
        background: red;
        color:white;
    }
    .taxi {
        color: white;
        background: black;
    }
    .rwyOrientation {
        display: flex;
        justify-content: flex-start;
        gap: 5px;
    }

    .rwyOrientation .p-button {
        padding: 0.5rem
    }
    .rwyOrientationChoice {
        font-size: 0.8rem;
    }
    .switch {
        height: 1.5rem;
        line-height: 1.5rem;
        font-size: 0.8rem;
    }
    :deep(.p-component) {
        font-size: 0.8rem;
        height: 1.5rem;
    }
    .spinner {
        height: 1.5rem;
    }
</style>