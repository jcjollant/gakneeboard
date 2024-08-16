<script setup>
import { onMounted, ref, watch } from 'vue'
import { getAirports } from '../../assets/data'
import { formatAtcGroups, formatFrequency } from '../../assets/format'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'

import AirportInput from '../shared/AirportInput.vue'

                    // <Button v-for="kf in knownFrequencies" :label="kf.display" 
                    //     :title="formatMhz(kf.mhz) + ',' + kf.name"
                    //     @click="addFrequency(kf)" :icon="kf.nav?'pi pi-compass':''"></Button>


const emits = defineEmits(["add"]);


//--------------------------------
// Props management
const props = defineProps({ 
  time: { type: Number, default: 0},
})

onMounted( () => {
    refreshAirportList()
}) 

watch(props, () => {
    refreshAirportList()
})
//--------------------------------

const airports = ref([])
const selectedAirport = ref(null)
const localFrequencies = ref([])
const navaidFrequencies = ref([])
const atcGroups = ref([])

function addFrequency(mhz,name) {
    emits('add', {mhz:mhz,name:name})
}

function onAirport(airport) {
    selectedAirport.value = airport

    if( !airport) return;
    
    const local = airport.freq.map( f => { return {mhz:f.mhz, name:airport.code + ' ' + f.name,label:formatFrequency(f) + ' ' + f.name}})
    localFrequencies.value = local;
    const navaids = airport.navaids.map( n => { return {mhz:n.freq, name:n.id + ' ' + n.type, label:formatFrequency(n) + ' ' + n.id + ' ' + n.type}})
    navaidFrequencies.value = navaids;
    const groupList = formatAtcGroups(airport, (e) => {
        e['label'] = formatFrequency(e) + ' ' + e.use;
        const maxLength = 70;
        if(e.label.length > maxLength) e.label = e.label.substring(0,maxLength) + '...'
    })
    atcGroups.value = groupList;
}

function onAirportInput() {
    refreshAirportList()
}

function refreshAirportList() {
    // keep airports that have frequencies
    const raw = getAirports()
    airports.value =  Object.keys(raw).map( k => raw[k]).filter(a => a.freq.length > 0);
    // console.log('[LookupDialog.loadProps]', JSON.stringify(airports.value))
}
</script>

<template>
    <Dialog modal header="Frequency Lookup" style="width:45rem" class="lookupDialog">
        <FieldSet legend="Airport">
            <AirportInput :auto="true" @valid="onAirportInput" class="mb-2"></AirportInput>
            <div class="listAirports">
                <Button v-for="airport in airports" @click="onAirport(airport)">{{airport.code}}</Button>
            </div>
        </FieldSet>
        <div class="mt-2 tip">{{selectedAirport ? 'Click on any frequency below to add them to your Radio Flow':'Pick an airport above to see associated frequencies'}}</div>
        <div v-if="selectedAirport" class="airportSpecific">
            <FieldSet :legend="selectedAirport.code + ' Local Frequencies'">
                <div class="listLocal">
                    <Button v-for="f in localFrequencies" :label="f.label" @click="addFrequency(f.mhz, f.name)" class="freqButton" link></Button>
                </div>
            </FieldSet>
            <FieldSet :legend="selectedAirport.code + ' Navaids'" class="listNavaids">
                <Button v-for="f in navaidFrequencies" :label="f.label" @click="addFrequency(f.mhz, f.name)" class="freqButton" link></Button>
            </FieldSet>
            <FieldSet v-for="group in atcGroups" :legend="group.name" >
                <div class="listAtc">
                    <Button v-for="f in group.atcs" :label="f.label" @click="addFrequency(f.mhz, group.name)" class="freqButton left" link :title="f.use"></Button>
                </div>
            </FieldSet>
        </div>
    </Dialog>
</template>

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