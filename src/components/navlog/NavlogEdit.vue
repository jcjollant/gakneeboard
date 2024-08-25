<script setup>
import { onMounted, ref, watch } from 'vue'

import { formatAltitude } from '../../assets/format'
import { getToastError } from '../../assets/toast'
import { getAirport } from '../../assets/data'
import { Navlog } from './Navlog'
import { NavlogItem } from './NavlogItem'

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import NavlogItemEditor from './NavlogItemEditor.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'

const emits = defineEmits(['apply','cancel','toast'])

const activeItem = ref(null)
// const codeFrom = ref(null)
// const codeTo = ref(null)
const fuel = ref(53)
const items = ref([])
const magneticDeviation = ref(0)
const magneticVariation = ref(0)
const showEditor = ref(false)
const maxLogItems = 15
const navlog = ref(new Navlog())

let airportFrom = null;
let airportTo = null;


const props = defineProps({
    navlog: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if (newProps.navlog) {
        navlog.value = Navlog.copy(newProps);
    } else {
        navlog.value = new Navlog();
    }
    // codeFrom.value = navlog.value.from
    // codeTo.value = navlog.value.to
    fuel.value = navlog.value.fuel
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
    const newNavLog = navlog.value || new Navlog();
    newNavLog.setEntries( items.value.map( i => i.entry))

    emits('apply', newNavLog)
}

function onCheat() {
    Promise.all([getAirport('KRNT'), getAirport('KELN')]).then((values) => {
        airportFrom = values[0]
        airportTo = values[1]
        onCreate()
    })
}

function onCreate() {
    if(!airportFrom || !airportTo) {
        toastError( 'Invalid Airports', 'We need two valid airports to create the log')
        return
    }
    const newList = []
    
    newList.push( NavlogItem.boundary( airportFrom))
    newList.push( NavlogItem.vanila('TOC'))
    newList.push( NavlogItem.vanila('TOD'))
    newList.push( NavlogItem.boundary( airportTo, false))
    // console.log('[NavlogEdit.onCreate]', JSON.stringify(newNL))
    items.value = newList;
}

function onItemAdd(index) {
    console.log('[NavlogEdit.onAddItem]', index, items.value.length)
    if(items.value.length >= maxLogItems) {
        toastError( 'Log Full', `We cannot display more than ${maxLogItems}`)
        return
    }
    const newItem = NavlogItem.vanila('?')
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
    activeItem.value = items.value[index]
    console.log('[NavlogEdit.onItemEdit]', JSON.stringify(activeItem.value))
    showEditor.value = true
}

function toastError(title, message) {
    emits('toast', getToastError(title, message))
}

</script>

<template>
<div>
    <NavlogItemEditor v-model:visible="showEditor" :item="activeItem" />
    <div class="codes">
        <AirportInput :code="navlog.from" :auto="true" label="From" class="airportFrom" @valid="onAirportFromValid" @invalid="onAirportFromInvalid" />
        <AirportInput :code="navlog.to" :auto="true" label="To" class="airportTo" @valid="onAirportToValid" @invalid="onAirportToInvalid"/>
    </div>
    <div class="variables">
        <InputGroup>
            <InputGroupAddon>Initial Fuel</InputGroupAddon>
            <InputText v-model="fuel"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>MagVar</InputGroupAddon>
            <InputText v-model="magneticVariation"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>MagDev</InputGroupAddon>
            <InputText v-model="magneticDeviation"/>
        </InputGroup>
        <Button label="Create" @click="onCreate"></Button>
    </div>
    <div>
        <Button label="Cheat" @click="onCheat"></Button>
    </div>
    <div class="headers legGrid bb">
        <div>&nbsp</div>
        <div>CheckPt</div>
        <div>Alt</div>
        <div>TH</div>
        <div>CH</div>
        <div>Dist.</div>
        <div>GS</div>
        <div>Time</div>
        <div>Fuel</div>
    </div>
    <div>
        <div v-for="(i,index) in items" class="legGrid bb">
            <div class="actions">
                <i class="pi pi-pencil clickable actionEdit" title="Edit"
                    @click="onItemEdit(index)"></i>
                <i v-if="i.canDelete" class="pi pi-times actionDelete clickable" title="Delete checkpoint"
                    @click="onItemDelete(index)"></i>
                <i v-if="i.canAdd" class="pi pi-plus actionAdd clickable" title="Add new checkpoint after"
                    @click="onItemAdd(index+1)"></i>
            </div>
            <div class="bl">{{ i.entry.name }}</div>
            <div class="bl">{{ formatAltitude(i.entry.alt) }}</div>
            <div class="bl">{{ i.entry.th }}</div>
            <div class="bl compassHeading">{{ i.entry.ch }}</div>
            <div class="bl">{{ i.entry.ld }}</div>
            <div class="bl">{{ i.entry.gs }}</div>
            <div class="bl">{{ i.entry.lt }}</div>
            <div class="bl">{{ i.entry.lf }}</div>
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
.codes {
    display: grid;
    grid-template-columns: 50% 50%;
    padding: 5px;
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
    grid-template-columns: 4.5rem 4rem 3rem 3rem 3rem 3rem 3rem 4rem 3rem;
    line-height: 2rem;
}
.variables {
    display: flex;
    padding: 5px;
    gap: 5px;
}

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
    
}

:deep(.variables .p-inputtext) {
    width: 2rem;
}


</style>