<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAirport, getSunlight } from '../../assets/data'
import { UserUrl } from '../../lib/UserUrl'

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import Circle from './Circle.vue'
import CornerStatic from '../shared/CornerStatic.vue'
import Header from '../shared/Header.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'

const mode = ref('')
const airportFromCode = ref('')
const airportToCode = ref('')
const circleKey = ref()
const civilTwilightAm = ref('-')
const civilTwilightPm = ref('-')
const dateFrom = ref(null)
const dateTo = ref(null)
const dateFormatBottom = {weekday: 'short', month: 'short', day: 'numeric'}
const dateFormatCorner = {month: 'short', day: 'numeric'}
const goldenHour = ref('-')
const loading = ref(false)
const solarNoon = ref('-')
const sunriseTime = ref('-')
const sunsetTime = ref('-')
const nightFlight = ref(false)

let state = {}
const ONE_DAY_MS = 86400000

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
    airportFromCode.value = state.from
    airportToCode.value = state.to ? state.to : state.from
    // loadAirportFrom( state.from)
    // loadAirportTo(state.to ? state.to : state.from)
    // Force edit mode if we don't have a code yet
//    if(!airportFromCode.value) mode.value = 'edit'
    // default to today if we don't have a date
    // default to day flight if we don't have a settings
    const now = new Date()
    dateFrom.value = now
    nightFlight.value = state.night
    // console.log('[SunLight.loadProps] from', JSON.stringify(dateFrom.value), "to", JSON.stringify(dateTo.value))

    getData(false)
}

// End of Props Section
//---------------------------


function formatDate(dateValue) {
    if( !dateValue) return '?'
    return dateValue.toLocaleString('en-US', dateFormatCorner)    
}

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

/**
 * Get data from the backend
 * @param {*} from 
 * @param {*} to 
 * @param {*} date 
 * @param {*} update 
 */
function getData( update=true) {
    // refresh date to
    if( nightFlight.value) {
        dateTo.value = new Date( dateFrom.value.getTime() + ONE_DAY_MS)
    } else {
        dateTo.value = dateFrom.value
    }

    loading.value = true
    getSunlight( airportFromCode.value, airportToCode.value, dateFrom.value, nightFlight.value).then( sunlightData => {
        // console.log('[Sunlight.getData] data received', JSON.stringify(sunlightData))
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
            state.night = nightFlight.value
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

function onAirportFrom( airport) {
    // console.log('[SunLight.onAirportFrom]', JSON.stringify(airport))
    if(airport.code && airport.code != airportFromCode.value) {
        airportFromCode.value = airport.code
    }
}

function onAirportTo( airport) {
    airportToCode.value = airport.code
}

function onApply() {
    // you need at least a valid from airport and a valid date
    if( airportFromCode.value && dateFrom.value) {
        // copy airportFrom onto airportTo if not provided
        if( airportToCode.value == '' || !airportToCode.value) airportToCode.value = airportFromCode.value
        // console.log('[SunLight.onApply]', airportFromCode.value, airportToCode.value, date.value)
        // fetch data for these airports
        getData()
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
    <div class="tile">
        <Header title="Sun Light" :hideReplace="mode!='edit'"
            @click="onHeaderClick" 
            @replace="emits('replace')">
        </Header>
        <div class="tileContent" v-if="mode==''">
            <div v-if="airportFromCode">
                <Circle :time="circleKey" :night="nightFlight" />
                <div v-if="loading" class="loading">Fetching...</div>
                <div v-else class="text">
                    <div v-if="nightFlight">
                        <div><span class="pr2">{{civilTwilightPm}}</span><span>{{civilTwilightAm}}</span></div>
                        <div class="pb1">Civil Twilight</div>
                        <div><span class="pr4">{{sunsetTime}}</span><span>{{sunriseTime}}</span></div>
                        <div class="sunrise"><span class="pr2">Sunset</span><span>Sunrise</span></div>
                    </div>
                    <div v-else>
                        <div class="sunrise pt1"><span class="pr2">Sunrise</span><span>Sunset</span></div>
                        <div><span class="pr4">{{sunriseTime}}</span><span>{{sunsetTime}}</span></div>
                        <div class="pt1">Civil Twilight</div>
                        <div><span class="pr2">{{civilTwilightAm}}</span><span>{{civilTwilightPm}}</span></div>
                    </div>
                </div>
                <CornerStatic class="corner topLeftCorner" label="From" :value="airportFromCode"/>
                <CornerStatic class="corner topRightCorner" label="To" :value="airportToCode"/>
                <CornerStatic class="corner bottomLeftCorner" position="bottom"
                    :label="nightFlight?'From':'Solar Noon'" 
                    :value="nightFlight?formatDate(dateFrom):solarNoon" />
                <CornerStatic class="corner bottomRightCorner" position="bottom" 
                    :label="nightFlight?'To':'Golden Hour'" 
                    :value="nightFlight?formatDate(dateTo):goldenHour"/>
                <div v-if="nightFlight" class="date">Night Flight</div>
                <div v-else class="date" :title="dateFrom ? dateFrom.toDateString() : '?'">{{ dateFrom ? dateFrom.toLocaleString('en-US', dateFormatBottom) : '?' }}</div>
            </div>
            <PlaceHolder v-else title="No Airport" />
        </div>
        <div v-else class="content">
            <div class="settings">
                <AirportInput :code="airportFromCode" label="From" :auto="true"
                    @valid="onAirportFrom" />
                <AirportInput :code="airportToCode" label="To" :auto="true"
                    @valid="onAirportTo"   />
                <InputGroup>
                    <InputGroupAddon class="airportCodeLabel">Date</InputGroupAddon>
                    <Calendar v-model="dateFrom" showIcon />
                </InputGroup>
                <div class="nightFlight">
                    <Checkbox v-model="nightFlight" inputId="nightFlight" binary/>
                    <label for="nightFlight" class="ml-2">Overnight Flight</label>
                </div> 
            </div>
            <ActionBar @cancel="onHeaderClick" @apply="onApply" :help="UserUrl.sunlightTileGuide" />
        </div>
    </div>    
</template>
<style scoped>
.corner {
    position: absolute; /* Absolute positioning within container */
    padding: 5px; /* Adjust padding for better visibility */
}
.bottomLeftCorner {
    bottom: 0;
    left: 0;
    text-align: left;
}
.bottomRightCorner {
    bottom: 0;
    right: 0;
    text-align: right;
}
.topLeftCorner {
    top: 0;
    left: 0;
    text-align: left;
}
.topRightCorner {
    top: 0;
    right: 0;
    text-align: right;
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
.nightFlight {
    display: flex;
    align-items: center;
    padding-left: 3rem;
}
.pb1 {
    padding-bottom: 1rem;
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
}
.date {
    font-size: 10px;
    position: absolute;
    bottom: 6px;
    width: 100%;
    text-align: center;
}

</style>