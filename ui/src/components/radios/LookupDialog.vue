<template>
    <Dialog modal header="Frequency Lookup" style="width:45rem" class="lookupDialog">
        <FieldSet legend="Route">
            <AirportInput :auto="true" @valid="onAirport" class="mb-2" :expanded="true"/>
            <div class="listAirports">
                <FAButton v-for="airport in airports" title="Click to remove Airport" :label="airport.code"
                    icon="times" class="selectedAirport"
                    @click="onRemoveAirport(airport)" />
            </div>
        </FieldSet>
        <div v-if="airports.length > 0" class="airportSpecific">
            <FieldSet legend="Weather">
                <div class="listLocal">
                    <FrequencyBox v-for="fna in weatherFrequencies" :freq="fna.freq" :title="fna.freq.name" class="clickable"
                        @click="addFrequency(fna.freq)" />
                </div>
            </FieldSet>
            <FieldSet legend="Tower, CTAF & GND">
                <div class="listLocal">
                    <FrequencyBox v-for="fna in towerCtafGndFrequencies" :freq="fna.freq" :title="fna.freq.name" class="clickable"
                        @click="addFrequency(fna.freq)" />
                </div>
            </FieldSet>
            <FieldSet legend="Approach Control">
                <div class="listLocal">
                    <FrequencyBox v-for="fag in approachFrequencies" :freq="fag.freq" :title="fag.freq.name" class="clickable"
                        @click="addFrequency(fag.freq)" />
                </div>
            </FieldSet>
        </div>
        <div v-else class="tip mt-5">Select Airports along your route</div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { AtcGroup } from '../../models/AtcGroup.ts'
import { Frequency, FrequencyType } from '../../models/Frequency'

import Dialog from 'primevue/dialog'
import FAButton from '../shared/FAButton.vue'
import FieldSet from 'primevue/fieldset'

import AirportInput from '../shared/AirportInput.vue'
import { Airport } from '../../models/Airport'
import { AirportService } from '../../services/AirportService';
import FrequencyBox from '../shared/FrequencyBox.vue'

const emits = defineEmits(["add"]);
const airports = ref<Airport[]>([])
const approachFrequencies = ref<FrequencyGroupAirport[]>([])
const noAirport = new Airport()
const selectedAirport = ref(noAirport)
const weatherFrequencies = ref<FrequencyAndAirport[]>([])
const towerCtafGndFrequencies = ref<FrequencyAndAirport[]>([])

class FrequencyAndAirport {
    freq:Frequency
    airport:Airport
    constructor(freq:Frequency, airport:Airport) {
        const name = airport.code + ' ' + freq.name
        freq.name = name
        this.freq = freq
        this.airport = airport
    }
}

class FrequencyGroupAirport {
    freq:Frequency
    group:AtcGroup
    airport:Airport
    constructor(freq:Frequency, group:AtcGroup, airport:Airport) {
        const name = group.name + ' ' + freq.name
        freq.name = name
        this.freq = freq
        this.group = group
        this.airport = airport
    }    
}

//--------------------------------
// Props management
const props = defineProps({ 
  time: { type: Number, default: 0},
})

watch(props, () => {
    // refreshAirportList()
})
//--------------------------------

function addFrequency(item:Frequency) {
    emits('add', item)
}

function onAirport(airport:Airport) {
    selectedAirport.value = airport

    if( !airport) return;

    // do we already have this airport in the list?
    const found = airports.value.find( a => a.code == airport.code)
    if(found) return;

    const groupList = AtcGroup.parse(airport)

    // add this airport to the list
    airports.value.push(airport)

    // add weather frequency
    const weatherFreq = AirportService.getFreqWeather(airport)
    if(weatherFreq) weatherFrequencies.value.push(new FrequencyAndAirport(weatherFreq, airport)) 

    // tower ctaf ground
    const towerFreqs = AirportService.getFreqTowerAll(airport)
    towerFreqs.forEach( f => {
        towerCtafGndFrequencies.value.push( new FrequencyAndAirport( Frequency.fromType(f.mhz, FrequencyType.tower), airport))
    })
    // CTAF frequency
    const ctafFreq = AirportService.getFreqCtaf(airport)
    if(ctafFreq) 
        towerCtafGndFrequencies.value.push( new FrequencyAndAirport( Frequency.fromType(ctafFreq, FrequencyType.ctaf), airport) )

    const gndFreq = AirportService.getFreqGround(airport)
    if(gndFreq && gndFreq.value != '') 
        towerCtafGndFrequencies.value.push( new FrequencyAndAirport( gndFreq, airport))

    // Approach control
    groupList.forEach( g => {
        g.atcs.forEach( atc => {
            approachFrequencies.value.push( new FrequencyGroupAirport( atc, g, airport))
        })
    })
    // atcGroups.forEach(g => {
    //     g.items.forEach( item => approachFrequencies.value.push( item.freq))
    // })
}

function onRemoveAirport(airport:Airport) {
    // remove airport from list
    airports.value = airports.value.filter(a => a.code != airport.code)
    weatherFrequencies.value = weatherFrequencies.value.filter(fna => fna.airport.code != airport.code)
    towerCtafGndFrequencies.value = towerCtafGndFrequencies.value.filter(fna => fna.airport.code != airport.code)
    approachFrequencies.value = approachFrequencies.value.filter(fga => fga.airport.code != airport.code)
}

</script>

<style scoped>

.airportSpecific {
    display: flex;
    flex-flow: column;
}

.freqButton {
    font-size: 0.8rem;
}

.listAirports {
    display: flex;
    flex-flow: wrap;
    gap: 5px;
}

.listAtc {
    display: flex;
    flex-flow: column;
    justify-content: left;
}

.listLocal, .listNavaids {
    display: flex;
    gap: 5px;
    flex-flow: wrap;
}

.lookupDialog {
    display: flex;
    flex-flow: column;
}

.tip {
    text-align: center;
}
:deep(.p-fieldset-legend) {
    border: none;
    background: none;
}
:deep(.p-fieldset-content) {
    padding: 0;
}
.selectedAirport {
    background-color: darkgrey;
}
</style>