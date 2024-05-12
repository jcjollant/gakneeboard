<script setup>
import { ref, onMounted } from 'vue'
import InputSwitch from 'primevue/inputswitch'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner';
import * as data from '../../assets/data.js'
import { watch } from 'vue';

const emits = defineEmits(['close','selection'])

const props = defineProps({
    airport: { type: Object, default: null},
    rwyName: { type: String, default: null},
    rwyOrientation: { type: String, default: null},
})

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
let settings = null
const loading = ref(false)
const rwyList = ref([])
const airportCode = ref('')
const cancellable = ref(false)
const applyable = ref(false)
const rwyOrientiation = ref(false)
const selectedRwy = ref(null)

function loadProps(props) {
    // console.log('AirportEdit loading props ' + JSON.stringify(props))
    if( props.airport) {
        airport = props.airport
        rwyList.value = airport.rwy;
        airportCode.value = airport.code;
        // if we have an airport to start with, we can revert.
        cancellable.value = true;
        applyable.value = true;
        
        // select the first runway by default
        if( props.rwyName) {
            selectedRwy.value = props.rwyName
        } else {
            console.log( "using first runway")
            selectedRwy.value = airport.rwy[0].name
        }

        rwyOrientiation.value = (props.rwyOrientation && props.rwyOrientation == 'magnetic')
    }
}

// settings are applied
function onApply() {
    // update settings with orientation
    emits('selection', airport, selectedRwy.value, rwyOrientiation.value ? 'magnetic' : 'vertical')
}

// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    loading.value = true
    data.getAirport( airportCode.value)
        .then( newAirport => {
            if( newAirport) {
                // console.log("onCodeUpdate airport " + JSON.stringify(airport))
                airport = newAirport
                loading.value = false;
                rwyList.value = airport.rwy
                selectedRwy.value = null
                // we cannot apply until we pick a runway
                applyable.value = false
            } else { // airport is unknown
                rwyList.value = [];
                loading.value = false
            }
        })
}

// A runway has been selected from the list
function selectRunway(rwy) {
    // console.log( "AirportEdit selectRunway " + rwy)
    applyable.value = true
    selectedRwy.value = rwy
}



</script>

<template>
    <div class="content">
        <div class="settings">
            <div class="item">Code</div>
            <input class="airportCodeInput" v-model="airportCode" @input="onCodeUpdate" />
            <div class="item">Runway</div>
            <ProgressSpinner v-if="loading"></ProgressSpinner>
            <div v-else class="rwySelector">
                <Button :label="rwy.name" class="sign" :class="{runway: rwy.name == selectedRwy}" v-for="rwy in rwyList" 
                    @click="selectRunway(rwy.name)"></Button>
                <Button label="ALL" class="sign" v-if="rwyList.length > 0"  :class="{runway: selectedRwy == 'all'}"
                        @click="selectRunway('all')"></Button>
                <!-- <Button label="Cancel" class="sign taxi" v-if="rwyList.length && cancellable" @click="emits('close')"></Button> -->
            </div>
            <div class="item">Orientation</div>
            <div class="rwyOrientation">
                <label class="rwyOrientationChoice">Vertical</label>
                <InputSwitch class="switch" v-model="rwyOrientiation"/>
                <label class="rwyOrientationChoice">Magnetic</label>
            </div>
            <div class="actionBar">
                <Button v-if="cancellable" icon="pi pi-times" label="Cancel" @click="emits('close')"></Button>
                <Button icon="pi pi-check" label="Apply" @click="onApply" :disabled="!applyable" ></Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .item {
        font-size: 0.6rem;
        line-height: 1.5rem;
        text-align: right;
    }
    .settings {
        display: grid;
        grid-template-columns: 3rem auto;
        font-size: 14px;
        gap: 1rem 0.5rem;
        padding: 0.5rem;
        line-height: 1.5rem;
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
        border: 1px solid black;
        padding: 2px 4px;
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
        justify-content: center;
        gap: 0.5rem;
    }
    .rwyOrientationChoice {
        font-size: 0.8rem;
    }
    .switch {
        height: 1.5rem;
    }
</style>