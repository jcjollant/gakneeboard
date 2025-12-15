<template>
    <div class="tileContent approach">
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq">
                <FrequencyBox :freq="freqWeather"/>
            </div>
            <div v-else class="atis tileBoxLabel br">ATIS</div>
            <div class="iloc tileBoxLabel br">ILOC</div>
            <div class="crs tileBoxLabel">CRS</div>
        </div>
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq">
                <FrequencyBox :freq="freqAtc"/>
            </div>
            <div v-else class="atc tileBoxLabel br">TRACON</div>
            <div class="fixes tileBoxLabel br">IAF</div>
        </div>
        <div class="row bb">
            <div v-if="airportMode" class="airportFreq">
                <FrequencyBox :freq="freqTower"/>
            </div>
            <div v-else class="twr tileBoxLabel br">Tower / CTAF</div>
            <div class="min tileBoxLabel">Minimum</div>
        </div>
        <div class="row">
            <div v-if="airportMode" class="airportFreq">
                <FrequencyBox :freq="freqGround"/>
            </div>
            <div v-else class="gnd tileBoxLabel br">Ground</div>
            <div class="missed tileBoxLabel">Missed<span class="climb">&#8593;</span></div>
        </div> 
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Airport } from '../../models/Airport';
import { Frequency, FrequencyType } from '../../models/Frequency';

import FrequencyBox from '../shared/FrequencyBox.vue';

const airportMode = ref(false)
const noFreq = Frequency.noFreq()
const freqAtc = ref(noFreq)
const freqWeather = ref(noFreq)
const freqGround = ref(noFreq)
const freqTower = ref(noFreq)
const props = defineProps({
    airport: { type: Airport, default: null},
})


function loadProps(props:any) {
    // console.log('[ApproachContent.loadProps]', props.airport)
  
    if (props.airport && props.airport.code != '') {
        airportMode.value = true
        const airport:Airport = props.airport
        // console.log('[DepartureContent] loadProps', props.airport)
        freqAtc.value = Frequency.fromType(0,FrequencyType.tracon)
        // console.log('[DepartureContent] loadProps', freqClearance.value)
        freqGround.value = airport.getFreqGround()
        const twrFreq = airport.getFreqTower()
        const ctafFreq = airport.getFreqCtaf()
        freqTower.value = twrFreq ? Frequency.fromType(twrFreq,FrequencyType.tower) : ( ctafFreq ? Frequency.fromType(ctafFreq,FrequencyType.ctaf) : noFreq)
        const weatherFreq = airport.getFreqWeather()
        freqWeather.value = weatherFreq || Frequency.noFreq(undefined, FrequencyType.weather)
    } else {
        airportMode.value = false
        freqWeather.value = noFreq
        freqAtc.value = noFreq
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
.approach {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
}

.row {
    display: flex;
}

.tileBoxLabel {
    text-align: start;
    padding: 2px;
    position: relative;
}

.label {
    padding-left: 2px;
}
.bb {
    border-bottom: 1px dashed darkgrey;
}
.br {
    border-right: 1px dashed darkgrey;
}
.atis, .atc, .twr, .gnd {
    flex: 0.9 1 0px;
}
.iloc, .apch, .crs, .alt {
    flex: 1 1 0px;
}

.fixes, .min, .missed {
    position: relative;
    flex: 2 2 0px;
}

.missed {
    position: relative;
}
.climb {
    position: absolute;
    font-size: xx-large;
    left: 5px;
    top: 10px;
}

.airportFreq {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0.9 1 0px;
    gap: 5px;
    padding: 5px;
    background-color: lightgrey;
}


</style>