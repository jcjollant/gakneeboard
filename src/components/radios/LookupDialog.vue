<template>
    <Dialog modal header="Frequency Lookup" style="width:45rem" class="lookupDialog">
        <FieldSet legend="Airport">
            <AirportInput :auto="true" @valid="onAirport" class="mb-2"></AirportInput>
            <!-- <div class="listAirports">
                <Button v-for="airport in airports" @click="onAirport(airport)">{{airport.code}}</Button>
            </div> -->
        </FieldSet>
        <div class="mt-2 tip">{{selectedAirport ? 'Click on any frequency below to add them to your Radio Flow':'Pick an airport above to see associated frequencies'}}</div>
        <div v-if="selectedAirport" class="airportSpecific">
            <FieldSet :legend="selectedAirport['code'] + ' Local Frequencies'">
                <div class="listLocal">
                    <Button v-for="f in localFrequencies" :label="f.label" @click="addFrequency(f)" class="freqButton" link></Button>
                </div>
            </FieldSet>
            <FieldSet :legend="selectedAirport['code'] + ' Navaids'" class="listNavaids">
                <Button v-for="f in navaidFrequencies" :label="f.label" @click="addFrequency(f)" class="freqButton" link></Button>
            </FieldSet>
            <FieldSet v-for="group in atcGroups" :legend="group['name']" >
                <div class="listAtc">
                    <Button v-for="f in group.items" :label="formatLabel(f.label)" @click="addFrequency(f)" class="freqButton left" link :title="f.label"></Button>
                </div>
            </FieldSet>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { sessionAirports } from '../../assets/data'
import { AtcGroup } from '../../model/AtcGroup.ts'
import { Frequency, FrequencyType, FrequencyLabelled } from '../../model/Frequency'
import { Formatter } from '../../lib/Formatter.ts'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'

import AirportInput from '../shared/AirportInput.vue'
import { Airport, AirportFrequency, Navaid } from '../../model/Airport'

const emits = defineEmits(["add"]);
const airports = ref<Airport[]>([])
const noAirport = new Airport()
const selectedAirport = ref(noAirport)
const localFrequencies = ref<FrequencyLabelled[]>([])
const navaidFrequencies = ref<FrequencyLabelled[]>([])
const atcGroups = ref<LookupAtcGroup[]>([])
const maxLabelLength = 70;

class LookupAtcGroup {
    name:string;
    items:FrequencyLabelled[];
    constructor(g:AtcGroup) {
        this.name = g.name;
        this.items = g.atcs.map(atc => {
            const value = Formatter.frequency(atc.value)
            let label = value + ' ' + atc.name;
            // replace frequency name with group name
            const frequency:Frequency = new Frequency(value, g.name, atc.type)
            return new FrequencyLabelled( frequency, label)
        })
    }
}

//--------------------------------
// Props management
const props = defineProps({ 
  time: { type: Number, default: 0},
})

onMounted( () => {
    sessionAirports.addListener(refreshAirportList)
}) 

watch(props, () => {
    // refreshAirportList()
})
//--------------------------------

function addFrequency(item:FrequencyLabelled) {
    emits('add', item.freq)
}

function formatLabel(label:string) {
    if(label.length > maxLabelLength) return label.substring(0,maxLabelLength) + '...'
    return label
}

function formatAirportFrequency(airport:Airport, freq:AirportFrequency):FrequencyLabelled {
    const value = Formatter.frequency(freq.mhz)
    const name = airport.code + ' ' + freq.name
    const label = value + ' ' + freq.name
    return new FrequencyLabelled( new Frequency( value, name, Frequency.typeFromString(freq.name)), label)
}

function formatNavaid(navaid:Navaid):FrequencyLabelled {
    const value = Formatter.frequency(navaid.freq)
    const label = value + ' ' + navaid.id + ' ' + navaid.type
    const frequency = new Frequency(value, navaid.id + ' ' + navaid.type, FrequencyType.navaid)
    return   new FrequencyLabelled( frequency, label)
}


function onAirport(airport:Airport) {
    selectedAirport.value = airport

    if( !airport) return;
    
    const local = airport.freq.map( f => formatAirportFrequency(airport,f))
    localFrequencies.value = local;
    const navaids = airport.navaids.map( formatNavaid)
    navaidFrequencies.value = navaids;
    const groupList = AtcGroup.parse(airport)
    // console.log('[LookupDialog.onAirport]', groupList)
    // atcGroups.value = groupList.map(g => {return new LookupAtcGroup(g)});
    atcGroups.value = groupList.map(g => new LookupAtcGroup(g));
    // console.log('[LookupDialog.onAirport]', atcGroups.value)
}

function refreshAirportList(newAirports:Airport[]) {
    // keep airports that have frequencies
    airports.value =  newAirports.filter(a => a.freq.length > 0);
    // console.log('[LookupDialog.refreshAirportList]', JSON.stringify(airports.value))
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
</style>