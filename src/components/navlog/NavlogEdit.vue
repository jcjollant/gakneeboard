<script setup>
import { onMounted, ref, watch } from 'vue'

import { Formatter } from '../../assets/Formatter'
import { emitToast, emitToastError, emitToastWarning } from '../../assets/toast'
import { Navlog } from '../../assets/Navlog'
import { NavlogEntry } from '../../assets/NavlogEntry'
import { EditorItem } from '../../assets/EditorItem'

import ActionBar from '../shared/ActionBar.vue'
import AirportInput from '../shared/AirportInput.vue'
import NavlogLegEditor from './NavlogLegEditor.vue'
import NavlogCheckpointEditor from './NavlogCheckpointEditor.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import { useConfirm } from 'primevue/useconfirm'
import OneChoice from '../shared/OneChoice.vue'

const emits = defineEmits(['apply','cancel','toast'])

const navlogModeCreate = {label:'Create New Log',value:'new'}
const navlogModeContinue = {label:'Continue Existing Log',value:'continue'}
const navlogModes = [navlogModeCreate,navlogModeContinue]

const actionReset = 'reset'
const modeBlank = ''
const modeEntries = 'entries'

const activeEntry = ref(null)
const activeTime = ref(0)
const activeNavlog = ref(null)
const altitudes = ref('')
const codeFrom = ref(null)
const codeTo = ref(null)
const confirm = useConfirm()
const cruiseFuelFlow = ref(null)
const descentFuelFlow = ref(null)
const descentRate = ref(null)
const initialFuel = ref(null)
const items = ref([])
const mode = ref(modeBlank) // can be '', 'entries' or 'continue'
const navlogMode = ref(navlogModeCreate)
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
    if(!newProps || !newProps.navlog) return;
    if(newProps.navlog.continued) {
        navlogMode.value = navlogModeContinue;
        mode.value = modeBlank
        return;
    } else {
        navlogMode.value = navlogModeCreate;
    }

    if( !newProps.navlog.entries || !newProps.navlog.entries.length) {
        mode.value = modeBlank
        return;
    }
    const navlog = Navlog.copy(newProps.navlog);
    const entries = navlog.entries;
    activeNavlog.value = navlog

    codeFrom.value = navlog.from;
    codeTo.value = navlog.to;
    initialFuel.value = navlog.getFuelFrom();
    reserveFuel.value = getValueOrEmpty(navlog.getFuelReserve());
    cruiseFuelFlow.value = getValueOrEmpty(navlog.getCruiseFuelFlow());
    descentFuelFlow.value = getValueOrEmpty(navlog.getDescentFuelFlow());
    descentRate.value = getValueOrEmpty(navlog.getDescentRate());

    // build a list of items from entries
    items.value = entries.map( (e,index) => {
        const first = (index == 0);
        const last = (index == (entries.length - 1))
        // can delete everything except first and last element
        const canDelete = !(first || last)
        // can add after anything but last element
        const canAdd = !last;
        return new EditorItem( e, canDelete, canAdd, getAttitudeClass(e))
    })
    totalFuel.value = navlog.ff - navlog.ft
    totalDistance.value = navlog.td;
    totalTime.value = navlog.tt;

    mode.value = modeEntries
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management
//-------------------------

function formatName(name) {
    if(!name) return '?'
    if(name.length > 15) return name.substring(0,15) + '...'
    return name;
}

function getAttitudeClass(entry) {
    if(!entry) return '';
    return entry.att == '+' ? 'attClimb' : entry.att=='-' ? 'attDescent' : ''    
}

function getValueOrEmpty(value) {
    return value ? value : ''
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
    if(navlogMode.value.value == navlogModeContinue.value) {
        emits('apply', Navlog.continued())
        return
    }

    if(!codeFrom.value || !codeTo.value) {
        emitToastError( emits, 'Airports', 'We need 2 airports to create a navigation log')
        return;
    }

    // Create a new NavLog from entries
    const newNavLog = new Navlog(codeFrom.value, codeTo.value)
    newNavLog.setFuelFrom(initialFuel.value)
    newNavLog.setFuelReserve(reserveFuel.value)
    newNavLog.setCruiseFuelFlow(cruiseFuelFlow.value)
    newNavLog.setDescentRate(descentRate.value)
    newNavLog.setDescentFuelFlow(descentFuelFlow.value)

    newNavLog.setTotalDistance(totalDistance.value)
    newNavLog.setTotalTime(totalTime.value)
    newNavLog.setFuelTo(initialFuel.value - totalFuel.value)
    // copy Editor Items entries into navlog
    newNavLog.setEntries( items.value.map( i => NavlogEntry.copy(i.entry)))

//    console.log('[NavlogEdit.onApply]', JSON.stringify(newNavLog))
    if(items.value.length) {
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
    }
    emits('apply', newNavLog)
}

/**
 * Create a new items list using from and to
 */
function onCreate() {
    if(!codeFrom.value || !codeTo.value) {
        emitToastError( emits, 'Airports Required', 'We need two airports to create the log')
        return
    }

    const newList = []

    // from airport is first in the list
    newList.push( EditorItem.first( codeFrom.value, elevFrom, 'attClimb'))

    if(altitudes.value) {
        const cleanAltitudes = altitudes.value.replace(/ +/g, " ").trim()
        const altList = cleanAltitudes.split(' ').map( a => Number(a)).filter( a => !isNaN(a))
        // console.log('[NavlogEdit.doCreate]', JSON.stringify(altList))

        const maxCount = Navlog.maxItems - 2
        if(altList.length > maxCount) {
            emitToastError(emits, 'Too Many Legs', `You have ${altList.length - maxCount} more legs than supported maximum (${maxCount})`, 5000 )
            return
        }

        const altItems = altList.map( (alt,index) => {
            const level = Math.trunc(alt / 100)
            const previousAlt = index == 0 ? elevFrom : altList[index-1]
            const lastLeg = (index == altList.length - 1)
            const nextAlt = lastLeg ? elevTo : altList[index+1]

            if(lastLeg) return EditorItem.last('TOD ' + codeTo.value, alt)

            if( alt > previousAlt) {
                return EditorItem.leg('TOC ' + level, alt, 'attClimb')
            } else if(alt == previousAlt) {
                if( alt > nextAlt) {
                    return EditorItem.leg('TOD ' + Math.trunc(nextAlt / 100), alt)
                }
                return  EditorItem.leg('ChkPt ' + index, alt)
            } else { // desent
                return EditorItem.leg('TOD ' + level, alt, 'attDescent')
            }
        })
        newList.push.apply(newList, altItems)
    } else { // we don't have altitudes
        // add TOC / TOD with unkown altitudes
        newList.push( EditorItem.naked('TOC', 'attClimb'))
        newList.push( EditorItem.naked('TOD', 'attDescent'))
    }

    // To airport is last in the list
    newList.push( EditorItem.last( codeTo.value, elevTo))

    // console.log('[NavlogEdit.onCreate]', JSON.stringify(newNL))
    items.value = newList;

    updateAttitudes()

    // reset totals
    totalDistance.value = 0
    totalTime.value = 0
    totalFuel.value = 0

    mode.value = modeEntries;
    emitToast(emits, 'Clear','Navlog Created')

}

// a custom action has been invoked in the action bar
function onAction(action) {
    if(action == actionReset) {
        confirm.require({
            message: 'Do you want to removed all entries in the current log?',
            header: 'NavLog Reset',
            rejectLabel: 'No',
            acceptLabel: 'Yes, Reset',
            accept: () => {
                // reset airports and items
                codeFrom.value = null
                codeTo.value = null
                items.value = []
                activeNavlog.value
                activeIndex =  -1
                mode.value = modeBlank
            }
        })
    }
}

// Open the checkpoint or leg editor
function onEdit(index,checkpoint) {
    if(index < 0 || index > items.value.length - 1) {
        console.log('[NavlogEdit.onEdit] invalid index', index)
        return
    }
    activeIndex = index;
    activeTime.value = Date.now()
    if(checkpoint) {
        activeEntry.value = items.value[index].entry
        showEditorCheckpoint.value = true
    } else {
        showEditorLeg.value = true

    }

}

function onEntryEditorSave(data) {
    // console.log('[NavlogEdit.onEntryEditorSave]', JSON.stringify(data))
    let next = false
    let entry = null
    if('next' in data) {
        entry = data.entry
        next = data.next
    } else {
        entry = data
    }
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

    // next leg?
    if(next) {
        onEdit(activeIndex+1, false)
    }
}

function onItemAdd(index) {
    // console.log('[NavlogEdit.onAddItem]', index, items.value.length)
    if(items.value.length >= Navlog.maxItems) {
        emitToastError( emits, 'Log Full', `We cannot display more than ${Navlog.maxItems} checkpoints in the navlog`)
        return
    }
    const newItem = EditorItem.naked('?')
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
    // console.log('[NavlogEdit.updateAttitudes]')
    // get a list of NavlogEntries
    const entries = items.value.map( ei => ei.entry)
    Navlog.updateAllAttitudes(entries)
    // const newItems = items.value.map( ei => {
    //     ei.attitudeClass = getAttitudeClass(ei.entry)
    // })
    for( let index = 0; index < entries.length; index++) {
        const ei = items.value[index]
        ei.attitudeClass = getAttitudeClass(entries[index])
    }
}

</script>

<template>
<div>
    <NavlogCheckpointEditor v-model:visible="showEditorCheckpoint" 
        :entry="activeEntry" :time="activeTime"
        @close="showEditorCheckpoint=false" @save="onEntryEditorSave" />
    <NavlogLegEditor v-model:visible="showEditorLeg" 
        :items="items" :index="activeIndex" :time="activeTime" 
        :cruiseFF="Number(cruiseFuelFlow)"
        :descentFF="Number(descentFuelFlow)" :descentRate="Number(descentRate)"
        @close="showEditorLeg=false" @save="onEntryEditorSave" />
    <div v-if="mode==modeBlank" class="blankMode">
        <OneChoice v-model="navlogMode" :choices="navlogModes" class="centered"/>
        <div v-if="navlogMode.value==navlogModeCreate.value" class="createMode">
            <AirportInput :code="codeFrom" :auto="true" label="From" class="createAirportFrom" @valid="onAirportFromValid" @invalid="onAirportFromInvalid" />
            <AirportInput :code="codeTo" :auto="true" label="To" class="createAirportTo" @valid="onAirportToValid" @invalid="onAirportToInvalid"/>
            <InputGroup class="createAltitudes" title="List of Enroute Altitudes (Space separated)">
                <InputGroupAddon>Altitudes</InputGroupAddon>
                <InputText v-model="altitudes" placeholder="Ex: 2500 4500 7500 ..."/>
            </InputGroup>
            <div class="createButton">
                <Button label="Create" @click="onCreate" :disabled="(!codeFrom||!codeTo)"></Button>
            </div>
        </div>
        <div v-else>
            <div class="continueHeader">This page will show the overflow from another NavLog page</div>
        </div>
    </div>
    <div v-else><!-- edit mode -->
        <div class="variables">
            <div class="varGroupFuel varGroup">Fuel Tank</div>
            <div class="varGroupCruise varGroup">Cruise</div>
            <div class="varGroupDescent varGroup">Descent</div>
            <InputGroup class="varInitialFuel" title="Initial Fuel. Bake your taxi/runup into this number OR the first leg">
                <InputGroupAddon>Initial</InputGroupAddon>
                <InputText v-model="initialFuel" placeholder="Gal"/>
            </InputGroup>
            <InputGroup class="varReserveFuel" title="Minium fuel onboard (consider day/night)">
                <InputGroupAddon>Reserve</InputGroupAddon>
                <InputText v-model="reserveFuel" placeholder="Gal"/>
            </InputGroup>
            <InputGroup class="varCruiseGph" title="Cruise Fuel Flow (Gallons per hour)">
                <InputGroupAddon>F.Flow</InputGroupAddon>
                <InputText v-model="cruiseFuelFlow"/>
            </InputGroup>
            <InputGroup class="varDescentFpm" title="Descent Rate (Feet per minute)">
                <InputGroupAddon>Rate</InputGroupAddon>
                <InputText v-model="descentRate"/>
            </InputGroup>
            <InputGroup class="varDescentGph" title="Descent Fuel Flow (Gallons per hour)">
                <InputGroupAddon>F.Flow</InputGroupAddon>
                <InputText v-model="descentFuelFlow"/>
            </InputGroup>
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
                        <i v-if="i.canDelete" class="pi pi-times actionDelete clickable" title="Delete checkpoint"
                            @click="onItemDelete(index)"></i>
                        <i v-if="i.canAdd" class="pi pi-plus actionAdd clickable" title="Add new checkpoint after"
                            @click="onItemAdd(index+1)"></i>
                    </div>
                    <div class="bl checkpointName editable" @click="onEdit(index,true)">{{ formatName(i.entry.name) }}</div>
                    <div class="bl br checkpointAlt editable" @click="onEdit(index,true)">{{ Formatter.altitude(i.entry.alt) }}</div>
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
                <div v-for="(i,index) in items.slice(0, items.length - 1)" 
                    class="legGrid bb" :class="i.attitudeClass"
                    @click="onEdit(index,false)">
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
    </div>
    <ActionBar :actions="(mode != modeBlank) ? [{label:'Reset Log',action:actionReset}] : null"
        video="https://youtu.be/gywuPnlgtkI"
        help="helpme"
        @cancel="emits('cancel')" @apply="onApply" @action="onAction"></ActionBar>
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
.blankMode {
    display: flex;
    flex-flow: column;
    gap: 1rem;
    padding-top: 1rem;
    font-size: 0.8rem;
}
.centered {
    margin: auto;
}
.continueHeader {
    font-weight: bolder;
    font-size: larger;
    opacity: 0.5;
    padding: 4rem 2rem;
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

.createAirportFrom {
    grid-column: 1 / span 2;
}
.createAirportTo {
    grid-column: 3 / span 2;
}
.createAltitudes {
    grid-column: 1 / span 4;
}
.createButton {
    grid-column: 1 / span 4;
}

.createMode {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));;
    gap: 5px;
    padding: 5px;
}

.editable {
    cursor: pointer;
    color: darkblue;
}
.grids {
    display: grid;
    grid-template-columns: auto 15rem;
    height: 685px;
    overflow: auto;
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
    grid-template-columns: repeat(5, minmax(0, 1fr));;
    gap: 5px;
    padding: 5px;
}
.varDescentFpm {
    grid-column: 4;
}
.varGroup {
    font-size: 0.7rem;
    background-color: lightgrey;
}
.varGroupFuel {
    grid-column: 1 / span 2;
}
.varGroupFuelFlows {
    grid-column: 4 ;
}
.varGroupCruise {
    grid-column: 3;
    background-color: lightblue;
}
.varGroupDescent {
    grid-column: 4 / span 2 ;
    background-color: #DFD;
}
.varInitialFuel {
    grid-column: 1;
}
:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    height: 1.5rem;
}
:deep(.p-inputgroup-addon .createAltitudes) {
    width: 60px;

}
:deep(.variables .p-inputtext) {
    width: 2rem;
    padding: 2px;
    text-align: center;
}


</style>