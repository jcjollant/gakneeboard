<script setup>
import { onMounted, ref, watch } from 'vue'

import { duplicate } from '../../assets/data'
import { formatAltitude } from '../../assets/format'
import { Formatter } from '../../assets/Formatter'

import Header from '../shared/Header.vue'
import NavlogEdit from './NavlogEdit.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'


const emits = defineEmits(['toast','update'])

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[NavlogPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data) {
        navlog.value = newProps.data;
    } else {
        navlog.value = null
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management
//------------------------

// create a list of ten objects with one 'ch' key which has a number value between 0 and 359
const navlog = ref(null)
const mode = ref('')
const title = ref('NavLog')
let navlogBeforeEdit = null

function onEditApply(newNavlog) {
    console.log('[NavlogPage.onEditApply]', JSON.stringify(newNavlog))
    navlog.value = newNavlog
    mode.value = ''
    emits('update',newNavlog)
}

// Edit has been cancelled, we restore previous state
function onEditCancel() {
    // restore previous values
    navlog.value = navlogBeforeEdit
    mode.value = ''
}

function onHeaderClick() {
    if(mode.value=='') {
        navlogBeforeEdit = duplicate( navlog.value)
    }
    mode.value = (mode.value == 'edit' ? '' : 'edit')
}

function onToast(data) {
    emits('toast', data)
}
</script>

<template>
    <div class="contentPage navlogPage">
        <div v-if="mode == 'edit'">
            <Header title="NavLog Editor" :clickable="false"></Header>
            <NavlogEdit :navlog="navlog"
                @toast="onToast" @cancel="onEditCancel" @apply="onEditApply" />
        </div>
        <div v-else-if="navlog==null || navlog.entries==null">
            <Header :title="title" :page="true" @click="onHeaderClick"></Header>
            <PlaceHolder title="No Entries"></PlaceHolder>
        </div>
        <div v-else class="main">
            <div class="checkpoints br">
                <div class="checkpointGrid checkpointHeader navlogHeader">
                    <div title="Checkpoint">CheckPt</div>
                    <div title="Altitude">Alt.</div>
                </div>
                <div v-for="v in navlog.entries" class="checkpointGrid bb">
                    <div class="name br" :class="{'checkpointStrong':(v.name.length < 7)}">{{ v.name }}</div>
                    <div class="altitudeGroup">
                        <span class="altitude checkpointStrong">{{ formatAltitude( v.alt) }}</span>
                        <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(v.att=='+'),'pi-arrow-down-right attDesc':(v.att=='-')}"></i>
                    </div>
                    
                </div>
            </div>
            <div class="legs">
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
                <div v-for="e in navlog.entries.slice(0, navlog.entries.length - 1)" 
                    class="legsGrid bb"  :class="{'legClimb':(e.att=='+'),'legDesc':(e.att=='-')}">
                    <div class="headingGroup">
                        <div class="heading">{{ e.mh }}</div>
                        <!-- <div class="heading">{{ e.ch }}</div> -->
                    </div>
                    <div class="bl br">{{ e.ld }}</div>
                    <div class="">{{ e.gs }}</div>
                    <div class="bl legNote">
                        <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(e.att=='+'),'pi-arrow-down-right attDesc':(e.att=='-'),'pi-arrow-right attCruise':(e.att!='+'&&e.att!='-')}"></i>
                    </div>
                    <div class="bl">{{ Formatter.legTime(e.lt) }}</div>
                    <div class="bl fuel" :class="{'fuelBingo': e.fr < navlog.fr}">{{ e.lf }}<span class="fuelRemaining">{{ Formatter.fuel(e.fr) }}</span></div>
                </div>
                <div class="legsGrid legsFooter">
                    <div class="totalDistance bl br bb">{{ Formatter.distance(navlog.td) }}</div>
                    <div class="totalTime bl bb">{{ Formatter.legTime(navlog.tt) }}</div>
                    <div class="totalFuel bl bb" :class="{'fuelBingo': navlog.ft < navlog.fr}">{{ Formatter.fuel(navlog.ft) }}</div>
                </div>
            </div>
            <div class="notes">Notes</div>
        </div>
    </div>
</template>

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

.attClimb {
    color: red;
}
.attCruise {
    color: darkgray;
}
.attDesc {
    color: green;
}.checkpointGrid {
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
.navlogPage {
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
    color: blue;
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