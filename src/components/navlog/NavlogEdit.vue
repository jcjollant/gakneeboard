<script setup>
import { onMounted, ref, watch } from 'vue'

import { formatAltitude, formatFuel, formatLegTime } from '../../assets/format'
import { emitToast, emitToastError } from '../../assets/toast'
import { getAirport } from '../../assets/data'
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

const emits = defineEmits(['apply','cancel','toast'])

const activeEntry = ref(null)
const activeTime = ref(0)
// const codeFrom = ref(null)
// const codeTo = ref(null)
const fuel = ref('')
const items = ref([])
const showEditor = ref(false)
const maxLogItems = 15
const navlog = ref(new Navlog())

let airportFrom = null;
let airportTo = null;
let activeIndex = -1

const props = defineProps({
    navlog: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[NavlogEdit.loadProps]', JSON.stringify(newProps))
    if (newProps.navlog) {
        navlog.value = Navlog.copy(newProps.navlog);
        // build a list of items from entries
        const entries = newProps.navlog.entries;
        items.value = entries.map( (e,index) => {
            const first = (index == 0);
            const last = (index == (entries.length - 1))
            // can delete everything except first and last element
            const canDelete = !(first || last)
            // can add after anything but last element
            const canAdd = !last;
            return new EditorItem( e, canDelete, canAdd)
        })
    } else {
        navlog.value = new Navlog();
    }
    // codeFrom.value = navlog.value.from
    // codeTo.value = navlog.value.to
    fuel.value = navlog.value.ff
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management
//-------------------------

function onAirportFromValid(airport) {
    airportFrom = airport;
}
function onAirportFromInvalid() {
    airportFrom = null;
}
function onAirportToValid(airport) {
    airportTo = airport;
}
function onAirportToInvalid() {
    airportTo = null;
}

function onApply() {
    // copy items into navlog
    const newNavLog = Navlog.copy(navlog.value);
    newNavLog.ff = Number(newNavLog.ff)
    // copy Editor Items entries into navlog
    newNavLog.setEntries( items.value.map( i => NavlogEntry.copy(i.entry)))

    emits('apply', newNavLog)
}

function onCheat() {
    navlog.value.from = 'KRNT'
    navlog.value.to = 'KELN'
    navlog.value.ff = 53
    navlog.value.mv = -15
    navlog.value.md = 0
    Promise.all([getAirport('KRNT'), getAirport('KELN')]).then((values) => {
        airportFrom = values[0]
        airportTo = values[1]
        onCreate()
    })
}

/**
 * Create a new items list using from and to
 */
function onCreate() {
    if(!airportFrom || !airportTo) {
        emitToastError( emits, 'Invalid Airports', 'We need two valid airports to create the log')
        return
    }
    const newList = []
    
    newList.push( EditorItem.boundary( airportFrom))
    newList.push( EditorItem.vanila('TOC', airportFrom.elev + 2000))
    newList.push( EditorItem.vanila('TOD', airportTo.elev + 2000))
    newList.push( EditorItem.boundary( airportTo, false))
    // console.log('[NavlogEdit.onCreate]', JSON.stringify(newNL))
    items.value = newList;

    emitToast(emits, 'Navlog Created','Please update TOC/TOD altitudes')
}

function onEntryEditorClose() {
    showEditor.value = false;
}

function onEntryEditorSave(entry) {
    entry.ch = navlog.value.getEntryCompassHeading( entry);
    items.value[activeIndex].entry = entry
    navlog.value.setEntries( items.value.map( i => NavlogEntry.copy(i.entry)))

    showEditor.value = false;
}

function onItemAdd(index) {
    console.log('[NavlogEdit.onAddItem]', index, items.value.length)
    if(items.value.length >= maxLogItems) {
        emitToastError( emits, 'Log Full', `We cannot display more than ${maxLogItems}`)
        return
    }
    const newItem = EditorItem.vanila('?')
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
    console.log('[NavlogEdit.onItemEdit]', JSON.stringify(activeEntry.value))
    showEditor.value = true
}

</script>

<template>
<div>
    <NavlogEntryEditor v-model:visible="showEditor" :entry="activeEntry" :time="activeTime" 
        @close="onEntryEditorClose" @save="onEntryEditorSave" />
    <div class="variables">
        <AirportInput :code="navlog.from" :auto="true" label="From" class="airportFrom" @valid="onAirportFromValid" @invalid="onAirportFromInvalid" />
        <AirportInput :code="navlog.to" :auto="true" label="To" class="airportTo" @valid="onAirportToValid" @invalid="onAirportToInvalid"/>
        <InputGroup>
            <InputGroupAddon>Initial Fuel</InputGroupAddon>
            <InputText v-model="navlog.ff"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>MagVar</InputGroupAddon>
            <InputText v-model="navlog.mv"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>MagDev</InputGroupAddon>
            <InputText v-model="navlog.md"/>
        </InputGroup>
        <Button label="Create" @click="onCreate"></Button>
    </div>
    <div>
        <Button label="Cheat" @click="onCheat"></Button>
    </div>
    <div class="headers legGrid bb">
        <div>&nbsp</div>
        <div title="Checkpoint Name">CheckPt</div>
        <div title="Checkpoint Altitude">Alt</div>
        <div title="True Heading">TH</div>
        <div title="True Heading corrected for Magnetic Variation and Deviation">CH</div>
        <div title="Leg Distance">Dist.</div>
        <div title="Ground Speed">GS</div>
        <div title="Leg Time">Time</div>
        <div title="Leg Fuel">Fuel</div>
    </div>
    <div>
        <div v-for="(i,index) in items" class="legGrid bb">
            <div class="actions">
                <!-- <i class="pi pi-pencil clickable actionEdit" title="Edit"
                    @click="onItemEdit(index)"></i> -->
                <i v-if="i.canDelete" class="pi pi-times actionDelete clickable" title="Delete checkpoint"
                    @click="onItemDelete(index)"></i>
                <i v-if="i.canAdd" class="pi pi-plus actionAdd clickable" title="Add new checkpoint after"
                    @click="onItemAdd(index+1)"></i>
            </div>
            <div class="bl name clickable" @click="onItemEdit(index)">{{ i.entry.name }}</div>
            <div class="bl">{{ formatAltitude(i.entry.alt) }}</div>
            <div class="bl">{{ (index < items.length - 1) ? i.entry.th : '' }}</div>
            <div v-if="index < items.length - 1" class="bl compassHeading">{{ i.entry.ch }}</div>
            <div v-else></div>
            <div v-if="index < items.length - 1" class="bl">{{ i.entry.ld }}</div>
            <div v-else class="total">{{ navlog.td }}</div>
            <div v-if="index < items.length - 1" class="bl">{{ i.entry.gs }}</div>
            <div v-else></div>
            <div v-if="index < items.length - 1" class="bl">{{ formatLegTime(i.entry.lt) }}</div>
            <div v-else class="total">{{ formatLegTime(navlog.tt) }}</div>
            <div v-if="index < items.length - 1" class="bl">{{ i.entry.lf }}</div>
            <div v-else class="total">{{ formatFuel(navlog.ff - navlog.ft) }}</div>
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
.compassHeading {
    background-color: #EEE;
}
.headers {
    display: flex;
    font-weight: bold;
    font-size: 0.8rem;
}
.legGrid {
    display: grid;
    grid-template-columns: 3rem 4rem 3rem 2.5rem 2.5rem 2.5rem 3rem 4rem 3rem;
    line-height: 2rem;
    font-size: 0.8rem;
}

:hover.name {
    font-weight: bold;
}
.total {
    font-weight: bold;
}
.variables {
    display: grid;
    grid-template-columns: auto auto auto auto;
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