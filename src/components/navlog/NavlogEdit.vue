<script setup>
import { onMounted, ref, watch } from 'vue'

import { formatAltitude } from '../../assets/format'
import { Formatter } from '../../assets/Formatter'
import { emitToast, emitToastError } from '../../assets/toast'
import { Navlog } from './Navlog'
import { NavlogEntry } from './NavlogEntry'
import { EditorItem } from './EditorItem'

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import NavlogEntryEditor from './NavlogEntryEditor.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import { useConfirm } from 'primevue/useconfirm'

const emits = defineEmits(['apply','cancel','toast'])

const activeEntry = ref(null)
const activeTime = ref(0)
const codeFrom = ref(null)
const codeTo = ref(null)
const confirm = useConfirm()
const initialFuel = ref(null)
const items = ref([])
const magneticVariation = ref(null)
const magneticDeviation = ref(0)
const showEditor = ref(false)
const showLeg = ref(true)
const totalDistance = ref(0)
const totalTime = ref(0)
const totalFuel = ref(0)
const maxLogItems = 14

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
    const newNavLog = new Navlog(codeFrom, codeTo)
    newNavLog.setFuelFrom(initialFuel.value)
    newNavLog.setMagneticVariation(magneticVariation.value)
    newNavLog.setMagneticDeviation(magneticDeviation.value)
    newNavLog.setTotalDistance(totalDistance.value)
    newNavLog.setTotalTime(totalTime.value)
    newNavLog.setFuelTo(initialFuel.value - totalFuel.value)
    // copy Editor Items entries into navlog
    newNavLog.setEntries( items.value.map( i => NavlogEntry.copy(i.entry)))

    emits('apply', newNavLog)
}

/**
 * Create a new items list using from and to
 */
function onCreate() {
    if(!codeFrom.value || !codeTo.value) {
        emitToastError( emits, 'Invalid Airports', 'We need two airports to create the log')
        return
    }

    // are we overwritting something?
    if(items.value.length > 0) {
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
function doCreate() {
    const newList = []
    
    newList.push( EditorItem.vanilla( codeFrom.value, elevFrom, false, true))
    newList.push( EditorItem.vanilla('TOC', elevFrom + 2000))
    newList.push( EditorItem.vanilla('TOD', elevTo + 2000))
    newList.push( EditorItem.vanilla( codeTo.value, elevTo, false, false))
    // console.log('[NavlogEdit.onCreate]', JSON.stringify(newNL))
    items.value = newList;



    // reset totals
    totalDistance.value = 0
    totalTime.value = 0
    totalFuel.value = 0

    emitToast(emits, 'Navlog Created','Please update TOC/TOD altitudes')

}
function onEntryEditorClose() {
    showEditor.value = false;
}

function onEntryEditorSave(entry) {
    // refresh this entry
    items.value[activeIndex].entry = entry
    // close editor
    showEditor.value = false;

    // recompute totals
    totalDistance.value = items.value.reduce( (total,i) => i.entry.ld ? total + i.entry.ld : total,0)
    totalTime.value = items.value.reduce( (total,i) => i.entry.lt ? total + i.entry.lt : total,0)
    totalFuel.value = items.value.reduce( (total,i) => i.entry.lf ? total + i.entry.lf : total,0)
}

function onItemAdd(index) {
    // console.log('[NavlogEdit.onAddItem]', index, items.value.length)
    if(items.value.length >= maxLogItems) {
        emitToastError( emits, 'Log Full', `We cannot display more than ${maxLogItems} checkpoints in the navlog`)
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
}

function onItemEdit(index) {
    activeIndex = index;
    activeEntry.value = items.value[index].entry
    activeTime.value = Date.now()
    // console.log('[NavlogEdit.onItemEdit]', JSON.stringify(activeEntry.value))
    showLeg.value = index < items.value.length - 1
    showEditor.value = true
}

// a magnetic value has been changed, recompute course headings
function onMagneticChange() {
    for(const item of items.value) {
        if( item.entry.th) {
            item.entry.ch = item.entry.th + Number(magneticVariation.value) + Number(magneticDeviation.value)
        }
    }
}

</script>

<template>
<div>
    <NavlogEntryEditor v-model:visible="showEditor" :entry="activeEntry" :time="activeTime" :showLeg="showLeg" :magVar="compass(magneticVariation)" :magDev="compass(magneticDeviation)"
        @close="onEntryEditorClose" @save="onEntryEditorSave" />
    <div class="variables">
        <AirportInput :code="codeFrom" :auto="true" label="From" class="airportFrom" @valid="onAirportFromValid" @invalid="onAirportFromInvalid" />
        <AirportInput :code="codeTo" :auto="true" label="To" class="airportTo" @valid="onAirportToValid" @invalid="onAirportToInvalid"/>
        <InputGroup class="initialFuel" title="Fuel before Taxi">
            <InputGroupAddon>Initial Fuel</InputGroupAddon>
            <InputText v-model="initialFuel"/>
        </InputGroup>
        <!-- <InputGroup title="Magnetic Variation for the flight">
            <InputGroupAddon>MagVar</InputGroupAddon>
            <InputText v-model="magneticVariation" @input="onMagneticChange"/>
        </InputGroup>
        <InputGroup title="We are hardcoding deviation to 0 for the moment">
            <InputGroupAddon>MagDev</InputGroupAddon>
            <InputText v-model="magneticDeviation" @input="onMagneticChange" :disabled="true"/>
        </InputGroup> -->
        <Button label="Create" @click="onCreate" :disabled="(!codeFrom||!codeTo)"></Button>
    </div>
    <!-- <div>
        <Button label="Cheat" @click="onCheat"></Button>
    </div> -->
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
                <div class="bl name editable" @click="onItemEdit(index)">{{ formatName(i.entry.name) }}</div>
                <div class="bl br editable" @click="onItemEdit(index)">{{ formatAltitude(i.entry.alt) }}</div>
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
            <div v-for="(i,index) in items.slice(0, items.length - 1)" class="legGrid bb">
                <!-- <div class="editable trueHeading" @click="onItemEdit(index)">{{ Formatter.heading(i.entry.th) }}</div> -->
                <div class="magneticHeading editable" @click="onItemEdit(index)">{{ Formatter.heading(i.entry.mh) }}</div>
                <!-- <div class="bl compassHeading">{{ Formatter.heading(i.entry.ch) }}</div> -->
                <div class="legDistance bl editable" @click="onItemEdit(index)">{{ Formatter.distance( i.entry.ld) }}</div>
                <div class="groundSpeed bl editable" @click="onItemEdit(index)">{{ Formatter.speed(i.entry.gs) }}</div>
                <div class="legTime bl editable" @click="onItemEdit(index)">{{ Formatter.legTime(i.entry.lt) }}</div>
                <div class="legFuel bl editable" @click="onItemEdit(index)">{{ Formatter.fuel(i.entry.lf) }}</div>
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
.airportFrom {
    grid-column: 1 / 3;
}
.airportTo {
    grid-column: 3 / 5;
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
.initialFuel {
    grid-column: 3;
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
.name {
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

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
    
}

:deep(.variables .p-inputtext) {
    width: 2rem;
}


</style>