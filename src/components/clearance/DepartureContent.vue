<template>
    <div class="tileContent departure">
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq preWeather">
                <FrequencyBox :freq="freqWeather"  :small="true"/>
            </div>
            <div v-else class="atis tileBoxLabel br">Weather</div>
            <div class="boxRoute box">
                <div class="tileBoxLabel">Route</div>
                <div class="watermrk">R</div>
            </div>
        </div>
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq preAtc">
                <FrequencyBox :freq="freqClearance" :small="true"/>
            </div>
            <div v-else class="atc tileBoxLabel br">Clearance</div>
            <div class="boxAltitudes box br">
                <div class="tileBoxLabel">Alt/Exp</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxFrequency box">
                <div class="tileBoxLabel">Freq</div>
                <div class="watermrk">F</div>
            </div>
        </div>
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq preGround">
                <FrequencyBox :freq="freqGround" :small="true"/>
            </div>
            <div v-else class="gnd tileBoxLabel br">Ground</div>
            <div class="boxTransponder box br">
                <div class="tileBoxLabel">XPDR</div>
                <div class="watermrk">T</div>
            </div>
            <div class="boxTaxi box">
                <div class="tileBoxLabel">Taxi</div>
            </div>
        </div>
        <div class="row">
            <div v-if="airportMode" class="airportFreq preTower">
                <FrequencyBox :freq="freqTower" :small="true"/>
            </div>
            <div v-else class="twr tileBoxLabel br">Tower / CTAF</div>
            <div class="boxNotes box">
                <div class="tileBoxLabel">Notes</div>
            </div>
        </div> 
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport'
import { Frequency, FrequencyType } from '../../model/Frequency'

import FrequencyBox from '../shared/FrequencyBox.vue'

const noFreq = Frequency.noFreq()
const freqClearance = ref(noFreq)
const freqGround = ref(noFreq)
const freqTower = ref(noFreq)
const freqWeather = ref(noFreq)
const airportMode = ref(false)
const props = defineProps({
    airport: { type: Airport, default: null},
})


function loadProps(props:any) {
    // const propsAirport:Airport = props.airport
    if (props.airport && props.airport.code != '') {
        airportMode.value = true
        const airport:Airport = props.airport
        // console.log('[DepartureContent] loadProps', props.airport)
        const cdFreq = airport.getFreqClearance()
        freqClearance.value = Frequency.fromType(cdFreq, FrequencyType.clearance)
        // console.log('[DepartureContent] loadProps', freqClearance.value)
        freqGround.value = airport.getFreqGround()
        const twrFreq = airport.getFreqTowerIfr()
        // console.log('[DepartureContent.loadProps] twrFreq', twrFreq)
        const ctafFreq = airport.getFreqCtaf()
        freqTower.value = twrFreq ? Frequency.fromType(twrFreq,FrequencyType.tower) : ( ctafFreq ? Frequency.fromType(ctafFreq,FrequencyType.ctaf) : noFreq)
        const weatherFreq = airport.getFreqWeather()
        freqWeather.value = weatherFreq ? Frequency.fromType(weatherFreq.mhz, FrequencyType.weather) : noFreq
    } else {
        airportMode.value = false
        freqClearance.value = noFreq
        freqGround.value = noFreq
        freqTower.value = noFreq
    }
    // console.log('[DepartureContent] loadProps', freqClearance.value)
}

onMounted(() => {
    loadProps(props)
})

watch(props, async() => {
    loadProps(props)
})

</script>

<style scoped>
.departure {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
}

.row {
    display: flex;
}

.box {
  position: relative;
}

.airportFreq {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    gap: 5px;
    padding: 5px;
    background-color: lightgrey;
    flex: 0.9 1 0px;
}
.bb {
    border-bottom: 1px dashed darkgrey;
}

.br {
    border-right: 1px dashed darkgrey;
}

.boxClearedTo, .boxAltitudes, .boxFrequency, .boxTaxi, .boxTransponder {
    flex: 1 1 0px;
}

.atis, .atc, .twr, .gnd {
    flex: 0.9 1 0px;
}

.boxRoute, .boxNotes {
    flex: 2 1 0px;
}

.watermrk {
    line-height: 1;
    font-weight:600;
    font-size: 15px;
    position:absolute;
    left: 2px;
    bottom: 2px;
    opacity: 0.2;
}

.tileBoxLabel {
    text-align: start;
    padding: 2px;
    position: relative;
}


</style>