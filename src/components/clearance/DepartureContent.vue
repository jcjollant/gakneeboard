<template>
    <div class="tileContent departure">
        <div v-if="airportMode" class="leftColumn airportFreq">
            <FrequencyBox :freq="freqWeather" class="preWeather"/>
            <FrequencyBox :freq="freqClearance"  class="preAtc"/>
            <FrequencyBox :freq="freqGround" class="preGround"/>
            <FrequencyBox :freq="freqTower" class="preTower"/>
        </div>
        <div v-else class="leftColumn">
            <div class="atis box br bb"><div class="tileBoxLabel">Weather</div></div>
            <div class="atc box br bb"><div class="tileBoxLabel">Clearance</div></div>
            <div class="gnd box br bb"><div class="tileBoxLabel">Ground</div></div>
            <div class="twr box br"><div class="tileBoxLabel">Tower / CTAF</div></div>
        </div>
        <div class="boxFiled bb">
            <div class="tileBoxLabel">Filed</div>
        </div> 
        <div class="boxRoute box bb">
            <div class="tileBoxLabel">Cleared to</div>
            <div class="watermrk topRight">
                <div>AF</div>
            </div>
            <div class="watermrk bottomRight">
                <div class="direct">D></div>
            </div>
        </div>
        <div class="boxAltitudes box br slash bb">/
            <div class="tileBoxLabel">Alt/Exp</div>
            <div class="watermrk topRight">SID</div>
            <div class="watermrk bottomRight">+5/10</div>
        </div>
        <div class="boxFrequency box freq bb">
            <div class="tileBoxLabel">Freq</div>
            <div class="freqValue">
                <div class="fNumber">1</div>
                <div class="digit fDigit"></div>
                <div class="digit fDigit"></div>
                <div class="fNumber">.</div>
                <div class="digit fDigit"></div>
                <div class="digit fDigit"></div>
            </div>
            <!-- <div class="watermrk">F</div> -->
        </div>
        <div class="boxTransponder box br">
            <div class="tileBoxLabel">XPDR</div>
            <div class="xpdrValue">
                <div class="digit xDigit">&nbsp;</div>
                <div class="digit xDigit"></div>
                <div class="digit xDigit"></div>
                <div class="digit xDigit"></div>
            </div>
            <!-- <div class="watermrk">T</div> -->
        </div>
        <div class="boxTaxi box">
            <div class="tileBoxLabel">Taxi</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../models/Airport'
import { Frequency, FrequencyType } from '../../models/Frequency'

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
        // tower frequency will be tower or ctaf
        freqTower.value = twrFreq ? Frequency.fromType(twrFreq,FrequencyType.tower) : ( ctafFreq ? Frequency.fromType(ctafFreq,FrequencyType.ctaf) : noFreq)
        const weatherFreq = airport.getFreqWeather()
        freqWeather.value = weatherFreq || noFreq
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
    grid-template-columns: repeat(3, 1fr);
}

.leftColumn {
    grid-row: 1 / span 4;
    display: flex;
    flex-flow: column;
}

.row {
    display: flex;
}

.box {
  position: relative;
}

.airportFreq {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    background-color: lightgrey;
}
.bb {
    border-bottom: 1px dashed darkgrey;
}

.br {
    border-right: 1px dashed darkgrey;
}

.boxAltitudes, .boxFrequency, .boxTaxi, .boxTransponder {
    flex: 1 1 0px;
}

.boxTransponder {
    display: flex;
    justify-content: center;
    align-items: center;
}

.atis, .atc, .twr, .gnd {
    flex: 0.9 1 0px;
}

.boxRoute, .boxFiled {
    position: relative;
    grid-column: 2 / span 2;
}

.watermrk {
    line-height: 1;
    font-weight:600;
    font-size: 10px;
    position:absolute;
    left: 0;
    bottom: 0;
    opacity: 0.3;
    padding: 2px 4px;
}

.tileBoxLabel {
    text-align: start;
    padding: 2px 4px;
    position: absolute;
    left: 0;
    top: 0;
}

.freqValue {
    display: flex;
    align-items: center;
}
.digit {
    border: 1px dashed lightgrey;
    height: 38px;
    border-radius: 4px;
}
.fDigit {
    width: 16px
}
.xpdrValue {
    display: flex;
    align-items: flex-end;
    font-size: 20px;
    gap: 2px;
    height: 100%;
    padding-bottom: 5px;;
}

.xDigit {
    width: 18px;
}

.topRight {
    text-align: right;
    top: 0;
    right: 0;
    padding: 2px 4px;
}

.bottomLeft {
    text-align: left;
    bottom: 0;
    left: 0;
}

.bottomRight {
    display: flex;
    bottom: 0;    
    right: 0;
    gap: 14px;
    padding: 2px 4px;
    justify-content: end;
}
.direct {
    text-decoration: line-through;
}
.slash {
    display: flex;
    font-size: x-large;
    align-items: center;
    justify-content: center;
}
.freq {
    display: flex;
    align-items: flex-end;
    padding-bottom: 5px;
}
</style>