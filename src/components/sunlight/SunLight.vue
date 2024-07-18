<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAirport, getSunlight } from '../../assets/data'
import CornerStatic from '../shared/CornerStatic.vue'
import Header from '../shared/Header.vue'
import Circle from './Circle.vue'
import AirportInput from '../shared/AirportInput.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Calendar from 'primevue/calendar'

const mode=ref('')
const airportFromCode = ref('')
const airportFromName = ref('')
const airportToCode = ref('')
const airportToName = ref('')
const circleKey = ref()
const civilTwilightAm = ref('-')
const civilTwilightPm = ref('-')
const date = ref(null)
const dateFormat = {weekday: 'short', month: 'short', day: 'numeric'}
const goldenHour = ref('-')
const loading = ref(false)
const solarNoon = ref('-')
const sunriseTime = ref('-')
const sunsetTime = ref('-')
const validFromAirport = ref(false)

let state = {}

const emits = defineEmits(['replace','update'])

//---------------------------
// Props Section
const props = defineProps({
    params:{type:Object, default: null},
})

onMounted(() => {
    loadProps(props)
})

watch( props, async() => {
    mode.value = ''
    loadProps(props)
})

function loadProps(newProps) {
    state = newProps.params
    loadAirportFrom( state.from)
    loadAirportTo(state.to ? state.to : state.from)
    date.value = state.date
    // Force edit mode if we don't have a code yet
    if(!airportFromCode.value) mode.value = 'edit'
    // default to today if we don't have a date
    if(!date.value) date.value = new Date()

    getData(airportFromCode.value, airportToCode.value, date.value, false)
}

// End of Props Section
//---------------------------


// turns a time looking like "5:09:28 AM" into "5:09a" 
function formatTime(data, field) {
    if(!data || !field in data) return('?')
    const time = data[field]
    const timeSplit = time.split(' ')
    if(timeSplit.length < 2) return '?'

    const onlyTimeSplit = timeSplit[0].split(':')
    if(onlyTimeSplit.length < 2) return '?'
    let shortTime = onlyTimeSplit[0] + ':' + onlyTimeSplit[1]

    let suffix = '?'
    if(timeSplit[1] == 'AM') suffix = 'a'
    else if(timeSplit[1] == 'PM') suffix = 'p'
    return shortTime + suffix;
}

function getData( from, to, date, update=true) {
    loading.value = true
    getSunlight( from, to, date).then( sunlightData => {
        // console.log('[Sunlight.onApply] data received', JSON.stringify(sunlightData))
        loading.value = false
        if( sunlightData) {
            sunriseTime.value = formatTime(sunlightData, 'sunrise')
            sunsetTime.value = formatTime(sunlightData, 'sunset')
            solarNoon.value = formatTime(sunlightData, 'solarNoon')
            goldenHour.value = formatTime(sunlightData, 'goldenHour')
            if('civilTwilight' in sunlightData) {
                civilTwilightAm.value = formatTime(sunlightData.civilTwilight, 'am')
                civilTwilightPm.value = formatTime(sunlightData.civilTwilight, 'pm')
            } else {
                civilTwilightAm.value = '?'
                civilTwilightPm.value = '?'
            }
            // save new settings
            state.from = airportFromCode.value
            state.to = airportToCode.value
            if(update) emits('update',state)
        } else {
            sunriseTime.value = '-'
            sunsetTime.value = '-'
            solarNoon.value = '-'
            goldenHour.value = '-'
            civilTwilightAm.value = '-'
            civilTwilightPm.value = '-'
        }
    })
}

function loadAirportFrom( code) {
    airportFromCode.value = code
    loadAirport( code, airportFromName, airportFromCode)
}

function loadAirportTo( code) {
    airportToCode.value = code
    loadAirport( code, airportToName, airportToCode)
}

function loadAirport( code, nameField, codeField) {
    getAirport( code)
        .then( newAirport => {
            if( newAirport && newAirport.version != -1) {
                nameField.value = newAirport.name
                codeField.value = newAirport.code
                if( codeField.value == airportFromCode.value) validFromAirport.value = true;
            } else { // airport is unknown
                nameField.value = "Unknown"
                if( codeField == airportFromCode) validFromAirport.value = false;
            }
        })
}

function onApply() {
    // you need at least a valid from airport and a valid date
    if( validFromAirport.value && date.value) {
        if( airportToCode.value == '' || !airportToCode.value) airportToCode.value = airportFromCode.value
        // fecth data for these airports
        // console.log('[SunLight.onApply]', airportFromCode.value, airportToCode.value, date.value)
        getData(airportFromCode.value, airportToCode.value, date.value)
        onHeaderClick()
    } else {
        console.log('From Airport is invalid or date is not set')
    }
}

// Toggle between edit mode and current mode
function onHeaderClick() {
    const edit = mode.value == 'edit'
    mode.value = (edit ? '' : 'edit')
    if(edit) circleKey.value = Date.now()
}    

</script>

<template>
    <div class="widget">
        <Header title="Sun Light" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div class="content" v-if="mode==''">
            <Circle :time="circleKey" />
            <CornerStatic class="corner top left" label="From" :value="airportFromCode"/>
            <CornerStatic class="corner top right" label="To" :value="airportToCode"/>
            <CornerStatic class="corner bottom left" label="Solar Noon" :value="solarNoon" position="bottom"/>
            <CornerStatic class="corner bottom right" label="Golden Hour" :value="goldenHour" position="bottom"/>
            <div v-if="loading" class="loading">Fetching...</div>
            <div v-else class="text">
                <div class="sunrise pt1"><span class="pr2">Sunrise</span><span>Sunset</span></div>
                <div><span class="pr4">{{sunriseTime}}</span><span>{{sunsetTime}}</span></div>
                <div class="pt1">Civil Twilight</div>
                <div><span class="pr2">{{civilTwilightAm}}</span><span>{{civilTwilightPm}}</span></div>
            </div>
            <div class="date" :title="date ? date.toDateString() : '?'">{{ date ? date.toLocaleString('en-US', dateFormat) : '?' }}</div>
        </div>
        <div v-else class="content">
            <div class="settings">
                <AirportInput :code="airportFromCode" :name="airportFromName" label="From"
                    @updated="loadAirportFrom" />
                <AirportInput :code="airportToCode" :name="airportToName" label="To"
                    @updated="loadAirportTo"   />

                <InputGroup>
                    <InputGroupAddon class="airportCodeLabel">Date</InputGroupAddon>
                    <Calendar v-model="date" showIcon />
                </InputGroup>
            </div>
            <div class="actionBar">
                <Button label="Cancel" link @click="onHeaderClick"></Button>
                <Button label="Apply" @click="onApply"></Button>
            </div>
        </div>
    </div>    
</template>
<style scoped>
.corner {
    position: absolute; /* Absolute positioning within container */
    padding: 5px; /* Adjust padding for better visibility */
}
.top {
    top: 0;
}
.left {
    left: 0;
    text-align: left;
}
.right {
    right: 0;
    text-align: right;
}
.bottom {
    bottom:0;
}
.loading {
    position:absolute;
    top:0;
    line-height: 160px;
    width:100%;
}
.text {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    position: absolute;
    top: 0;
    font-size: 0.9rem;
    justify-content: center;
}
    .pt1 {
    padding-top: 1rem;
    }
    .pr2 {
    padding-right: 2rem;
    }
    .pr4 {
    padding-right: 4rem;
    }
    .settings {
    display: flex;
    flex-flow: column;
    /* grid-template-rows: 30px 30px 100px; */
    gap: 5px;
    padding: 5px;
    font-size: 0.7rem;
    }
.airportCodeLabel {
    width: 3rem;
}
:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
}
.date {
    font-size: 10px;
    position: absolute;
    bottom: 6px;
    width: 100%;
    text-align: center;
}

</style>