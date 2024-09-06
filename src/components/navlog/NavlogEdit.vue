<script setup>
import { onMounted, ref, watch } from 'vue'

import { formatAltitude } from '../../assets/format'
import { Formatter } from '../../assets/Formatter'
import { emitToast, emitToastError, emitToastWarning } from '../../assets/toast'
import { Navlog } from './Navlog'
import { NavlogEntry } from './NavlogEntry'
import { EditorItem } from './EditorItem'

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import NavlogLegEditor from './NavlogLegEditor.vue'
import NavlogCheckpointEditor from './NavlogCheckpointEditor.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import { useConfirm } from 'primevue/useconfirm'

const emits = defineEmits(['apply','cancel','toast'])

const activeEntry = ref(null)
const activeTime = ref(0)
const altitudes = ref('')
const codeFrom = ref(null)
const codeTo = ref(null)
const confirm = useConfirm()
const initialFuel = ref(null)
const items = ref([])
const magneticVariation = ref(null)
const magneticDeviation = ref(0)
const nextEntry = ref(null)
const prevEntry = ref(null)
const reserveFuel = ref(null)
const showEditorCheckpoint = ref(false)
const showEditorLeg = ref(false)
const totalDistance = ref(0)
const totalTime = ref(0)
const totalFuel = ref(0)

let elevFrom = 0;
let elevTo = 0;
let activeIndex = -1

const props = defineProps({
    navlog: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[NavlogEdit.loadProps]', JSON.stringify(newProps))
    if (newProps.navlog && newProps.navlog.entries) {
        const navlog = Navlog.copy(newProps.navlog);
        const entries = navlog.entries;

        codeFrom.value = navlog.from;
        codeTo.value = navlog.to;
        initialFuel.value = navlog.getFuelFrom();
        reserveFuel.value = navlog.getFuelReserve();
        magneticVariation.value = navlog.getMagneticVariation()
        magneticDeviation.value = 0

        // build a list of items from entries
        items.value = entries.map( (e,index) => {
            const first = (index == 0);
            const last = (index == (entries.length - 1))
            // can delete everything except first and last element
            const canDelete = !(first || last)
            // can add after anything but last element
            const canAdd = !last;
            return new EditorItem( e, canDelete, canAdd)
        })
        totalFuel.value = navlog.ff - navlog.ft
        totalDistance.value = navlog.td;
        totalTime.value = navlog.tt;
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management
//-------------------------

function compass(raw) {
    const value = Number(raw)
    return isNaN(value) ? 0 : value;
}

function formatName(name) {
    if(!name) return '?'
    if(name.length > 15) return name.substring(0,15) + '...'
    return name;
}

function onAirportFromValid(airport) {
    codeFrom.value = airport.code;
    elevFrom = Math.round(airport.elev);
}
function onAirportFromInvalid() {
    elevFrom = 0;
}
function onAirportToValid(airport) {
    codeTo.value = airport.code;
    elevTo = Math.round(airport.elev);
}
function onAirportToInvalid() {
    elevTo = 0;
}

function onApply() {
    // Create a new NavLog from entries
    const newNavLog = new Navlog(codeFrom.value, codeTo.value)
    newNavLog.setFuelFrom(initialFuel.value)
    newNavLog.setFuelReserve(reserveFuel.value)
    newNavLog.setMagneticVariation(magneticVariation.value)
    newNavLog.setMagneticDeviation(magneticDeviation.value)
    newNavLog.setTotalDistance(totalDistance.value)
    newNavLog.setTotalTime(totalTime.value)
    newNavLog.setFuelTo(initialFuel.value - totalFuel.value)
    // copy Editor Items entries into navlog
    newNavLog.setEntries( items.value.map( i => NavlogEntry.copy(i.entry)))

//    console.log('[NavlogEdit.onApply]', JSON.stringify(newNavLog))
    if(newNavLog.getFuelFrom() <= 0) {
        emitToastError( emits, 'Bingo Fuel', 'Like aircrafts, navlogs need initial fuel')
        return;
    }

    if(newNavLog.getFuelReserve() < 0) {
        emitToastError( emits, 'Invalid Reserve', 'Fuel reserve cannot be negative')
        return;
    }
    if(newNavLog.getFuelReserve() == 0) {
        emitToastWarning(emits, 'No Reserve?', 'Fuel reserve is set to 0.\nRemind me to take the next flight.', 5000)
    }
    emits('apply', newNavLog)
}

// function onCheat() {
//     codeFrom.value = 'KRNT'
//     elevFrom = 32
//     codeTo.value = 'KELN'
//     elevTo = 1763
//     altitudes.value = "2500 2500 4500 4500 7500 7500 5500"
//     doCreate()
// }

/**
 * Create a new items list using from and to
 */
function onCreate() {
    if(!codeFrom.value || !codeTo.value) {
        emitToastError( emits, 'Airports Required', 'We need two airports to create the log')
        return
    }

    // are we overwritting something?
    if(items.value.length > 0) {
        // console.log('[NavlogEdit.onCreate]', (typeof confirm))
        // call confirmation after short delay
        confirm.require({
            message: 'Do you want to replace all entries in the current log?',
            header: 'Overwrite?',
            rejectLabel: 'No',
            acceptLabel: 'Yes, Replace',
            accept: () => {
                doCreate()
            }
        })
    } else {
        doCreate()
    }
}

// let's create a base for this log
function doCreate() {
    const newList = []
    

    const altList = altitudes.value.split(' ').map( a => Number(a)).filter( a => !isNaN(a))
    // console.log('[NavlogEdit.doCreate]', JSON.stringify(altList))

    newList.push( EditorItem.vanilla( codeFrom.value, elevFrom, false, true))
    const altItems = altList.map( (alt,index) => {
        const level = Math.trunc(alt / 100)
        const previousAlt = index == 0 ? elevFrom : altList[index-1]
        const lastLeg = index == altList.length - 1
        const nextAlt = lastLeg ? elevTo : altList[index+1]
        if( alt > previousAlt) {
            return EditorItem.vanilla('TOC ' + level, alt)
            // newList.push( EditorItem.vanilla('@' + level, alt))
        } else if(alt == previousAlt) {
            if( alt > nextAlt) {
                return EditorItem.vanilla('TOD ' + Math.trunc(nextAlt / 100), alt)
            }
            return  EditorItem.vanilla('CheckPt ' + index, alt)
        } else { // desent
            if(lastLeg)
                return EditorItem.vanilla('TOD ' + codeTo.value, alt)
            return EditorItem.vanilla('TOD ' + level, alt)
        }
    })
    newList.push.apply(newList, altItems)
    newList.push( EditorItem.vanilla( codeTo.value, elevTo, false, false))

    // console.log('[NavlogEdit.onCreate]', JSON.stringify(newNL))
    items.value = newList;

    updateAttitudes()

    // reset totals
    totalDistance.value = 0
    totalTime.value = 0
    totalFuel.value = 0

    emitToast(emits, 'Clear','Navlog Created')

}

function onEditCheckpoint(index) {
    activeIndex = index;
    activeEntry.value = items.value[index].entry
    activeTime.value = Date.now()
    nextEntry.value = items.value[index+1]?.entry
    showEditorCheckpoint.value = true
}

function onEditLeg(index) {
    activeIndex = index;
    activeEntry.value = items.value[index].entry
    nextEntry.value = (index < items.value.length - 1) ? items.value[index+1].entry : null
    prevEntry.value = index > 0 ? items.value[index-1].entry : null
    activeTime.value = Date.now()
    // console.log('[NavlogEdit.onItemEdit]', JSON.stringify(activeEntry.value))
    showEditorLeg.value = true
}

function onEntryEditorSave(entry) {
    // refresh this entry
    items.value[activeIndex].entry = entry
    // close editor
    showEditorCheckpoint.value = false;
    showEditorLeg.value = false;

    // recompute totals
    totalDistance.value = items.value.reduce( (total,i) => i.entry.ld ? total + i.entry.ld : total,0)
    totalTime.value = items.value.reduce( (total,i) => i.entry.lt ? total + i.entry.lt : total,0)
    totalFuel.value = items.value.reduce( (total,i) => i.entry.lf ? total + i.entry.lf : total,0)

    // update attitudes
    updateAttitudes()
}

function onItemAdd(index) {
    // console.log('[NavlogEdit.onAddItem]', index, items.value.length)
    if(items.value.length >= Navlog.maxItems) {
        emitToastError( emits, 'Log Full', `We cannot display more than ${Navlog.maxItems} checkpoints in the navlog`)
        return
    }
    const newItem = EditorItem.vanilla('?')
    // insert new item at position
    const newList =  items.value
    newList.splice(index,0,newItem)

    items.value = newList;
}

function onItemDelete(index) {
    // remove entry at position index from items
    items.value.splice(index, 1)
    updateAttitudes()
}

function updateAttitudes() {
    // get a list of NavlogEntries
    const entries = items.value.map( ei => ei.entry)
    Navlog.updateAllAttitudes(entries)
}

</script>

<template>
<div>
    <NavlogCheckpointEditor v-model:visible="showEditorCheckpoint" :entry="activeEntry" :time="activeTime"
        @close="showEditorCheckpoint=false" @save="onEntryEditorSave" />
    <NavlogLegEditor v-model:visible="showEditorLeg" :entry="activeEntry" :nextEntry="nextEntry" :prevEntry="prevEntry" :time="activeTime" :magVar="compass(magneticVariation)" :magDev="compass(magneticDeviation)"
        @close="showEditorLeg=false" @save="onEntryEditorSave" />
    <div class="variables">
        <AirportInput :code="codeFrom" :auto="true" label="From" class="varAirportFrom" @valid="onAirportFromValid" @invalid="onAirportFromInvalid" />
        <AirportInput :code="codeTo" :auto="true" label="To" class="varAirportTo" @valid="onAirportToValid" @invalid="onAirportToInvalid"/>
        <InputGroup class="varAltitudes" title="List of Enroute Altitudes (Space separated)">
            <InputGroupAddon>Altitudes</InputGroupAddon>
            <InputText v-model="altitudes" placeholder="Ex: 2500 4500 7500 ..."/>
        </InputGroup>
        <Button label="Create" class="varCreateBtn" @click="onCreate" :disabled="(!codeFrom||!codeTo)"></Button>
        <div class="varGroupFuel varGroup">Fuel Tank</div>
        <!-- <div class="varGroupFuelFlows varGroup">Fuel Flow</div> -->
        <div class="varGroupDescent varGroup">Descent</div>
        <InputGroup class="varInitialFuel" title="Initial Fuel. Bake your taxi/runup into this number OR the first leg">
            <InputGroupAddon>Init.</InputGroupAddon>
            <InputText v-model="initialFuel" placeholder="Gal"/>
        </InputGroup>
        <InputGroup class="varReserveFuel" title="Minium fuel onboard (consider day/night)">
            <InputGroupAddon>Res.</InputGroupAddon>
            <InputText v-model="reserveFuel" placeholder="Gal"/>
        </InputGroup>
        <InputGroup class="varDescentFpm" title="Descent Rate (Feet per minute)">
            <InputGroupAddon>FPM</InputGroupAddon>
            <InputText :disabled="true"/>
        </InputGroup>
        <InputGroup class="varDescentGph" title="Descent Fuel Flow (Gallons per hour)">
            <InputGroupAddon>GPH</InputGroupAddon>
            <InputText :disabled="true"/>
        </InputGroup>
        <!-- <InputGroup title="Magnetic Variation for the flight">
            <InputGroupAddon>MagVar</InputGroupAddon>
            <InputText v-model="magneticVariation" @input="onMagneticChange"/>
        </InputGroup>
        <InputGroup title="We are hardcoding deviation to 0 for the moment">
            <InputGroupAddon>MagDev</InputGroupAddon>
            <InputText v-model="magneticDeviation" @input="onMagneticChange" :disabled="true"/>
        </InputGroup> -->
        <!-- <Button label="..." class="varCheatBtn" @click="onCheat" ></Button> -->
    </div>
    <div class="grids" v-if="items.length">
        <div class="checkpoints"><!-- checkpoints -->
            <div class="headers checkpointGrid bb">
                <div>&nbsp</div>
                <div title="Checkpoint Name">CheckPt</div>
                <div title="Checkpoint Altitude">Alt</div>
            </div>
            <div v-for="(i,index) in items" class="checkpointGrid bb">
                <div class="actions">
                    <!-- <i class="pi pi-pencil clickable actionEdit" title="Edit"
                        @click="onItemEdit(index)"></i> -->
                    <i v-if="i.canDelete" class="pi pi-times actionDelete clickable" title="Delete checkpoint"
                        @click="onItemDelete(index)"></i>
                    <i v-if="i.canAdd" class="pi pi-plus actionAdd clickable" title="Add new checkpoint after"
                        @click="onItemAdd(index+1)"></i>
                </div>
                <div class="bl checkpointName editable" @click="onEditCheckpoint(index)">{{ formatName(i.entry.name) }}</div>
                <div class="bl br checkpointAlt editable" @click="onEditCheckpoint(index)">{{ formatAltitude(i.entry.alt) }}</div>
            </div>
        </div>
        <div class="legs"><!-- legs -->
            <div class="headers legGrid bb">
                <!-- <div title="True Heading">TH</div> -->
                <div title="Magnetic Heading">MH</div>
                <!-- <div title="Compass Heading (Magnetic Heading + Magnetic Deviation)">CH</div> -->
                <div title="Leg Distance">Dist.</div>
                <div title="Ground Speed">GS</div>
                <div title="Leg Time">Time</div>
                <div title="Leg Fuel">Fuel</div>
            </div>
            <div v-for="(i,index) in items.slice(0, items.length - 1)" class="legGrid bb" @click="onEditLeg(index)">
                <!-- <div class="editable trueHeading" @click="onItemEdit(index)">{{ Formatter.heading(i.entry.th) }}</div> -->
                <div class="magneticHeading editable">{{ Formatter.heading(i.entry.mh) }}</div>
                <!-- <div class="bl compassHeading">{{ Formatter.heading(i.entry.ch) }}</div> -->
                <div class="legDistance bl editable">{{ Formatter.distance( i.entry.ld) }}</div>
                <div class="groundSpeed bl editable">{{ Formatter.speed(i.entry.gs) }}</div>
                <div class="legTime bl editable">{{ Formatter.legTime(i.entry.lt) }}</div>
                <div class="legFuel bl editable">{{ Formatter.fuel(i.entry.lf) }}</div>
            </div>
            <div class="legGrid">
                <div class="total totalDistance">{{ Formatter.distance(totalDistance) }}</div>
                <div class="total totalTime">{{ Formatter.legTime(totalTime) }}</div>
                <div class="total totalFuel">{{ Formatter.fuel(totalFuel) }}</div>
            </div>
        </div>
    </div>
    <ActionBar @cancel="emits('cancel')" @apply="onApply"></ActionBar>
</div>
</template>

<style scoped>
.actions {
    display: flex;
    gap: 5px;
    justify-content: center;
    /* color: #2196F3; */
    color: blue;
    opacity: 0.5;
    font-size: 0.7rem;
    margin: auto;
}
.actionDelete {
    color: red;
}
.checkpointGrid {
    display: grid;
    grid-template-columns: 4rem auto 3rem;
    line-height: 2rem;
    font-size: 0.8rem;
}
.compassHeading {
    background-color: #EEE;
}
.editable {
    cursor: pointer;
    color: darkblue;
}
.grids {
    display: grid;
    grid-template-columns: auto 15rem;
}
:hover.editable {
    font-weight: bold;
}
.headers {
    font-weight: bold;
    font-size: 0.8rem;
}
.legGrid {
    display: grid;
    grid-template-columns: 2.5rem 2.5rem 3rem 4rem 3rem;
    line-height: 2rem;
    font-size: 0.8rem;
}
.legs {
    margin-top: 1rem;
}
.checkpointName {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: normal;
    overflow: hidden;
    height: 2rem;
}
.total {
    font-weight: bold;
}
.totalDistance {
    grid-column: 2;
}
.totalTime {
    grid-column: 4;
}
.variables {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));;
    gap: 5px;
    padding: 5px;
}
.varAirportFrom {
    grid-column: 1 / span 2;
}
.varAirportTo {
    grid-column: 3 / span 2;
}
.varAltitudes {
    grid-column: 1 / span 3;
}
.varCreateBtn {
    grid-column: 4 / span 1;
}
.varDescentFpm {
    grid-column: 3;
}
.varGroup {
    font-size: 0.7rem;
    background-color: lightblue;
}
.varGroupFuel {
    grid-column: 1 / span 2;
}
.varGroupFuelFlows {
    grid-column: 4 ;
}
.varGroupDescent {
    grid-column: 3 / span 2 ;
    background-color: #DFD;
}
.varInitialFuel {
    grid-column: 1;
}
:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
}

:deep(.variables .p-inputtext) {
    width: 2rem;
}


</style>