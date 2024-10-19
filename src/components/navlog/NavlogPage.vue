<template>
    <div class="contentPage pageNavlog">
        <div v-if="mode == modeEdit">
            <Header title="NavLog Editor" :hideReplace="false" 
                @replace="emits('replace')"></Header>
            <NavlogEdit :navlog="navlog"
                @toast="onToast" @cancel="onEditCancel" @apply="onEditApply" />
        </div>
        <div v-else-if="checkpoints==null">
            <Header :title="title" :page="true" 
                @click="onHeaderClick" @replace="emits('replace')"></Header>
            <PlaceHolder title="No Entries"></PlaceHolder>
        </div>
        <div v-else class="main">
            <div class="checkpoints br">
                <div class="checkpointGrid checkpointHeader navlogHeader">
                    <div title="Checkpoint">CheckPt</div>
                    <div title="Altitude">Alt.</div>
                </div>
                <div v-for="v in checkpoints" class="checkpointGrid bb">
                    <div class="name br" :class="{'checkpointStrong':(v.name.length < 7)}">{{ v.name }}</div>
                    <div class="altitudeGroup">
                        <span class="altitude checkpointStrong">{{ Formatter.altitude( v.alt) }}</span>
                        <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(v.att=='+'),'pi-arrow-down-right attDesc':(v.att=='-')}"></i>
                    </div>
                    
                </div>
            </div>
            <div class="legs" v-if="legs">
                <div class="title clickable" @click="onHeaderClick">{{title}}</div>
                <div class="legsHeader legsGrid navlogHeader bb">
                    <div title="Magnetic Heading">MH</div>
                    <!-- <div title="Compass Heading">CH</div> -->
                    <div title="Distance">Dist.</div>
                    <div title="Ground Speed">GS</div>
                    <div>Notes</div>
                    <div>Time</div>
                    <div>Fuel</div>
                </div>
                <div v-if="legs" v-for="(l,index) in legs" 
                    class="legsGrid bb"  :class="getLegClass(l,index)">
                    <div class="headingGroup">
                        <div class="heading">{{ Formatter.heading(l.mh) }}</div>
                        <!-- <div class="heading">{{ e.ch }}</div> -->
                    </div>
                    <div class="bl br">{{ l.ld }}</div>
                    <div class="">{{ l.gs }}</div>
                    <div class="bl legNote">
                        <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(l.att=='+'),'pi-arrow-down-right attDesc':(l.att=='-'),'pi-arrow-right attCruise':(l.att!='+'&&l.att!='-')}"></i>
                    </div>
                    <div class="bl">{{ Formatter.legTime(l.lt) }}</div>
                    <div class="bl fuel" :class="{'fuelBingo': l.fr < navlog.fr}">{{ l.lf }}<span class="fuelRemaining"  :class="{'fuelRemainingBingo': l.fr < navlog.fr}">{{ Formatter.fuel(l.fr) }}</span></div>
                </div>
                <div v-if="truncated" class="legsFooterTruncated">
                    <div>{{ navlog.entries.length - legs.length - 1 }} more legs</div>
                    <i class="pi pi-arrow-right"></i>
                </div>
                <div v-else class="legsGrid legsFooter">
                    <div class="totalDistance bl br bb">{{ Formatter.distance(navlog.td) }}</div>
                    <div class="totalTime bl bb">{{ Formatter.legTime(navlog.tt) }}</div>
                    <div class="totalFuel bl bb">{{ Formatter.fuel(navlog.ff - navlog.ft) }}</div>
                </div>
            </div>
            <!-- <div class="notes">Notes</div> -->
            <div class="fuelRecap" v-if="navlog && mode!=modeEdit">
                <div class="fuelRecapGroup departureFuel">
                    <div class="fuelRecapGroupLabel">Departure Fuel</div>
                    <div class="fuelRecapAvailable fuelRecapFuel">{{ Formatter.fuel(navlog.ff) }}</div>
                    <div class="fuelRecapTime">{{ formatFuelRecapTime(navlog.ff)}}</div>
                </div>
                <div class="fuelRecapGroup">
                    <div class="fuelRecapGroupLabel">Used</div>
                    <div class="fuelRecapUsed fuelRecapFuel">{{ Formatter.fuel(navlog.ff - navlog.ft) }}</div>
                </div>
                <div class="fuelRecapGroup destinationFuel">
                    <div class="fuelRecapGroupLabel">Destination Fuel</div>
                    <div class="fuelRecapAvailable fuelRecapFuel" :class="{'fuelRecapAvailableReserve':navlog.ft < navlog.fr}">{{ Formatter.fuel(navlog.ft) }}</div>
                    <div class="fuelRecapTime"  :class="{'fuelRecapAvailableReserve':navlog.ft < navlog.fr}">{{ formatFuelRecapTime(navlog.ft) }}</div>
                </div>
                <div class="fuelRecapGroup">
                    <div class="fuelRecapGroupLabel">Fuel Reserve</div>
                    <div class="fuelRecapReserve fuelRecapFuel">{{ Formatter.fuel(navlog.fr) }}</div>
                    <div class="fuelRecapTime">{{ formatFuelRecapTime(navlog.fr) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { duplicate, navlogQueue } from '../../assets/data'
import { Formatter } from '../../assets/Formatter'
import { Navlog } from '../../assets/Navlog'

import Header from '../shared/Header.vue'
import NavlogEdit from './NavlogEdit.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'


const emits = defineEmits(['replace','toast','update'])
const modeEdit = 'edit'
const modeDisplay = ''
const continued = ref(false)
const truncated = ref(false)
const navlog = ref(null)
const checkpoints = ref(null)
const legs = ref(null)
const mode = ref(modeDisplay)
const title = ref('NavLog')
let navlogBeforeEdit = null

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[NavlogPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data) {
        continued.value = 'continued' in newProps.data
        applyData(newProps.data);
    } else {
        navlog.value = null
    }
}

onMounted(() => {
    // register listener for navlog updates
    loadProps(props)
    const existingNavlog = navlogQueue.addListener(onNavlogUpdate)
    if(existingNavlog && continued.value) applyData(existingNavlog)
})

watch(props, () => {
    loadProps(props)
})

// End of props management
//------------------------

// refresh navlog, checkpoints and legs with new data
// update title
function applyData(logData) {
    if( !logData || !logData.entries) return;
    // console.log('[NavlogPage.applyData]', continued.value, JSON.stringify(logData))

    if( continued.value) {
        // use navlog.entries elements from index 14
        checkpoints.value = logData.entries.slice(14)
        const numCheckpoints = checkpoints.value.length
        legs.value = checkpoints.value.slice(0, numCheckpoints - 1)
        truncated.value = false
        navlog.value = Navlog.copy(logData, true)
        navlog.value.continued = true;
        title.value = "NavLog (Cont'd)"
    } else {
        // we only display the first 15 entries
        checkpoints.value = logData.entries.slice(0, 15)
        const numCheckpoints = checkpoints.value.length
        legs.value = checkpoints.value.slice(0, numCheckpoints - 1)
        truncated.value = logData.entries.length > 15
        navlog.value = logData
        title.value = "NavLog"
        navlogQueue.notify(logData)
    }
}

function formatFuelRecapTime(value) {
    if(!value) return Formatter.noTime
    if(navlog.value.cff > 0) {
        return Formatter.legTime(value / navlog.value.cff * 60)
    }
    return '';
}

function getLegClass(leg, index) {
    let output = 'leg'+index;
    if(leg.att == '+') output += ' legClimb';
    else if(leg.att == '-') output += ' legDesc'
    return output;
}

// New NavLog configuration is available
// If newNavLog is 'continue' we continue the previous page
function onEditApply(newNavlog) {
    // console.log('[NavlogPage.onEditApply]', JSON.stringify(newNavlog))
    continued.value = newNavlog.continued
    if(continued.value) {
        applyData(navlogQueue.getLast())
    } else {
        applyData(newNavlog)
    }
    // save data
    emits('update',newNavlog)
    // display mode
    mode.value = modeDisplay
}

// Edit has been cancelled, we restore previous state
function onEditCancel() {
    // restore previous values
    navlog.value = navlogBeforeEdit
    mode.value = modeDisplay
}

function onHeaderClick() {
    if(mode.value=='') {
        navlogBeforeEdit = duplicate( navlog.value)
    }
    mode.value = (mode.value == modeEdit ? modeDisplay : modeEdit)
}

function onNavlogUpdate(navlog) {
    if(!continued.value) return;
    // console.log('[NavlogPage.onNavlogUpdate]', JSON.stringify(navlog))
    applyData(navlog)
}

function onToast(data) {
    emits('toast', data)
}

</script>

<style scoped>
.altitude {
    line-height: normal;
}
.altClimb {
    vertical-align: bottom;
}
.altDesc {
    vertical-align: top;
}
.altitudeGroup {
    position:relative;
}
.altitudeGroup .attitude {
    font-size: 1rem;
    opacity: 0.5;
}
.attitude {
    font-size: 3rem;
    font-weight: 900;
    position: absolute;
    right: 1px;
    bottom: 0;
    opacity: 0.10;
}

.checkpointGrid {
    display:grid;
    grid-template-columns: 5rem 4rem;
}

.checkpointHeader {
    border-bottom: 1px dashed darkgrey;
    line-height: 2rem;
    vertical-align: bottom;
}
.checkpointStrong {
    font-size: 1.25rem;
    font-weight: bolder;
}

.fuel {
    position: relative;
}
.fuelBingo {
    color:white;
    background-color: orangered;
}
.fuelRecap{
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    font-size: 0.8rem;
    font-weight: bold;
    justify-content: space-around;
    width: 100%;
    align-items: center;
    padding: 0 5px;
    background-color: rgba(0,0,255,0.1);
    grid-column: 1 / span 2;
    line-height: normal;
    height:36px;
}
.fuelRecapAvailable {
    color: blue;
}
.fuelRecapAvailableReserve {
    color: red;
}
.fuelRecapGroup {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0 5px;
}
.fuelRecapGroupLabel {
    display: flex;
    flex-flow: column;
    opacity: 0.5;
    grid-column: 1 / span 2;
}
.fuelRecapTime {
    font-weight: normal;
    opacity: 1;
}
.fuelRecapUsed {
    grid-column: 1 / span 2;
}
.fuelRemaining {
    font-size: 0.7rem;
    font-weight: bold;
    line-height: normal;
    position: absolute;
    top: 2px;
    right: 2px;
    opacity: 0.3;
    color: blue;
}
.fuelRemainingBingo {
    font-weight: bolder;
    opacity: 1;
    color: white;
}
.navlogHeader {
    font-size: 0.8rem;
    font-weight: bold;
    opacity: 0.5;
}
.heading {
    font-size: 1.5rem;
    font-weight: 700;
}
.headingGroup {
    position: relative;
}
.legs {
    z-index: 1;
}
.legDesc {
    background-color: rgba(0, 255, 0, 0.1);
}
.legClimb {
    background-color: rgba(255, 0, 0, 0.1);
}
.legNote {
    position:relative;
}
.legsFooter {
    line-height: 1.5rem;
    font-size: 0.8rem;
    font-weight: bold;
}
.legsFooterTruncated {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    line-height: 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    opacity: 0.2;
    gap: 10px;
    padding-right: 10px;
}
.legsGrid {
    display: grid;
    grid-template-columns: 4rem 2.5rem 2.5rem auto 3.5rem 3.5rem;
}
.legsHeader {
    line-height: 1.5rem;
}

.main {
    line-height: 3rem;
    display: grid;
    grid-template-columns: 9rem auto;
}
.name {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: normal;
    overflow: hidden;
}
.pageNavlog {
    overflow: hidden;
    position: relative;
}
.notes {
    position: absolute;
    bottom: 0;
    font-size: 2.5rem;
    line-height: 3rem;
    font-weight: 700;
    opacity: 0.1;
    width: 100%;
    z-index: 0;
}
.settings {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
}
.title {
    line-height: 2rem;
    font-weight: bolder;
}
.totalDistance {
    grid-column: 2;
    background: white;
}
.totalFuel {
    grid-column: 6;
}
.totalFuel.fuelBingo {
    color: white;
}
.totalGrid {
    display: grid;
    grid-template-columns: 4rem 4rem;
}
.totalTime {
    grid-column: 5;
}

</style>