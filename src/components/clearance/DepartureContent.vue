<template>
    <div class="tileContent departure">
        <div v-if="airportMode" class="airportFreq">
            <FrequencyBox class="prebox" :freq="freqClearance" :small="true"/>
            <FrequencyBox class="prebox" :freq="freqGround" :small="true"/>
            <FrequencyBox class="prebox" :freq="freqTower" :small="true"/>
        </div>
        <div v-else class="row bb">
            <div class="boxClearance box br">
                <div class="tileBoxLabel">{{labelClearance}}</div>
            </div>
            <div class="boxGround box br">
                <div class="tileBoxLabel">{{labelGround}}</div>
            </div>
            <div class="boxTower box">
                <div class="tileBoxLabel">{{labelTower}} / {{labelCtaf}}</div>
            </div>
        </div>
        <div class="row bb">
            <div class="boxClearedTo box br">
                <div class="tileBoxLabel">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="boxRoute box">
                <div class="tileBoxLabel">Route</div>
                <div class="watermrk">R</div>
            </div>
        </div>
        <div class="row bb">
            <div class="boxAltitudes box br">
                <div class="tileBoxLabel">Alt/Exp</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxFrequency box br">
                <div class="tileBoxLabel">Freq</div>
                <div class="watermrk">F</div>
            </div>
            <div class="boxTransponder box">
                <div class="tileBoxLabel">XPDR</div>
                <div class="watermrk">T</div>
            </div>
        </div>
        <div class="row">
            <div class="boxTaxi box">
                <div class="tileBoxLabel">Taxi</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport'
import { Frequency } from '../../model/Frequency'

import FrequencyBox from '../shared/FrequencyBox.vue'

const noFreq = new Frequency(0,'')
const freqClearance = ref(noFreq)
const freqGround = ref(noFreq)
const freqTower = ref(noFreq)
const labelClearance = 'Clearance'
const labelCtaf = 'CTAF'
const labelGround = 'Ground'
const labelTower = 'Tower'
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
        const cdFreq = airport.getFreq('CD/P')
        freqClearance.value = new Frequency(cdFreq ? cdFreq : 0,labelClearance)
        // console.log('[DepartureContent] loadProps', freqClearance.value)
        const gndFreq = airport.getFreq('GND')
        freqGround.value = new Frequency(gndFreq ? gndFreq : 0,labelGround)
        const twrFreq = airport.getFreq('TWR')
        const ctafFreq = airport.getFreq('CTAF')
        freqTower.value = twrFreq ? new Frequency(twrFreq,labelTower) : ( ctafFreq ? new Frequency(ctafFreq,labelCtaf) : noFreq)
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
    cursor: pointer;
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
}
.bb {
    border-bottom: 1px dashed darkgrey;
}

.br {
    border-right: 1px dashed darkgrey;
}

.boxGround, .boxClearance, .boxTower {
    flex-grow: 1;
}
.boxInfo {
    flex-grow: 1.5;
}
.boxWind {
    flex-grow: 4.5;
}
.boxAltimeterSetting {
    flex-grow: 3;
}
.boxRunway {
    flex-grow: 2.5;
}
.boxClearedTo {
    flex-grow: 2;
}
.boxRoute {
    flex-grow: 5;
}
.boxAltitudes {
    flex-grow: 3;
}
.boxFrequency {
    flex-grow: 5;
}
.boxTransponder {
    flex-grow: 4;
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

</style>