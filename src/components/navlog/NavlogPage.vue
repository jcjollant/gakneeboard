<script setup>
import { onMounted, ref, watch } from 'vue'

import { duplicate } from '../../assets/data'
import { formatAltitude, formatLegTime } from '../../assets/format'

import Header from '../shared/Header.vue'
import NavlogEdit from './NavlogEdit.vue'
import PlaceHolder from '../shared/PlaceHolder.vue'


const emits = defineEmits(['toast','update'])

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data) {
        data.value = newProps.data;
        if (newProps.data.name) title.value = newProps.data.name
        if ('items2' in newProps.data) {
            columns.value = colDouble
        } else {
            columns.value = colSingle
        }
        if( 'theme' in newProps.data) {
            theme.value = 'theme-' + newProps.data.theme
        } else {
            theme.value = 'theme-yellow'
        }
    } else {
        data.value = null
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
const demoNavlog = {
    legs:[
        {name:"KRNT", alt:32, mh:129,wca:-2,ld:4.2,gs:71,lt:3.5,fr:53,lf:-2.4, att:'+'},
        {name:"TOC25", alt:2500, mh:128,wca:-3,ld:2.9,gs:106,lt:1.66,fr:50.6,lf:-0.2},
        {name:"Lk Youngs ZEBKU", alt:2500, mh:75,wca:0,ld:4.0,gs:68,lt:3.5,fr:50.4,lf:-0.7},
        {name:"TOC45", alt:2500, mh:75,wca:0,ld:1.0,gs:101,lt:0.62,fr:49.7,lf:-0.1},
        {name:"Bravo Shelf 50", alt:2500, mh:75,wca:0,ld:2.2,gs:67,lt:2.0,fr:49.6,lf:-0.4, att:'+'},
        {name:"TOC55", alt:5500, mh:75,wca:0,ld:4.5,gs:96,lt:2.79,fr:49.2,lf:-0.4},
        {name:"Clear B Shelf 60", alt:5500, mh:75,wca:0,ld:4.4,gs:66,lt:4.0,fr:48.8,lf:-0.8, att:'+'},
        {name:"TOC75", alt:7500, mh:75,wca:0,ld:7.6,gs:94,lt:4.9,fr:48.0,lf:-0.6},
        {name:"4W0", alt:7500, mh:98,wca:-3,ld:28.8,gs:95,lt:18.25,fr:47.4,lf:-2.4},
        {name:"TOD", alt:7500, mh:65,wca:2,ld:18.2,gs:95,lt:11.47,fr:45.0,lf:-1.5, att:'-'},
        {name:"KELN", alt:1763,fr:43.5}
    ]
}
const navlog = ref(null)
const data = ref(null)
const mode = ref('')
const title = ref('NavLog')
let navlogBeforeEdit = null

function onEditApply(newNavlog) {
    console.log('[NavlogPAge.onEditApply]', JSON.stringify(newNavlog))
    navlog.value = newNavlog
    mode.value = ''
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
            <Header :title="title" :page="true" @click="onHeaderClick"></Header>
            <NavlogEdit :navlog="navlog"
                @toast="onToast" @cancel="onEditCancel" @apply="onEditApply" />
        </div>
        <div v-else-if="navlog==null">
            <Header :title="title" :page="true" @click="onHeaderClick"></Header>
            <PlaceHolder title="No Entries"></PlaceHolder>
        </div>
        <div v-else class="main">
            <div class="checkpoints borderRight">
                <div class="checkpointGrid checkpointHeader navlogHeader">
                    <div title="Checkpoint">CheckPt</div>
                    <div title="Altitude">Alt.</div>
                </div>
                <div v-for="v in navlog.entries" class="checkpointGrid borderBottom">
                    <div class="name borderRight" :class="{'checkpointStrong':(v.name.length < 7)}">{{ v.name }}</div>
                    <div class="altitudeGroup">
                        <span class="altitude checkpointStrong">{{ formatAltitude( v.alt) }}</span>
                        <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(v.att=='+'),'pi-arrow-down-right attDesc':(v.att=='-')}"></i>
                    </div>
                    
                </div>
            </div>
            <div class="legs">
                <div class="title clickable" @click="onHeaderClick">{{title}}</div>
                <div class="legsHeader legsGrid navlogHeader borderBottom">
                    <div title="Compass Heading">CH</div>
                    <div title="Distance">Dist.</div>
                    <div title="Ground Speed">GS</div>
                    <div>Notes</div>
                    <div>Time</div>
                    <div>Fuel</div>
                </div>
                <div v-for="v in navlog.entries.slice(0, navlog.entries.length - 1)" 
                    class="legsGrid borderBottom"  :class="{'legClimb':(v.att=='+'),'legDesc':(v.att=='-')}">
                    <div class="headingGroup">
                        <!-- <i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(v.att=='+'),'pi-arrow-down-right attDesc':(v.att=='-')}"></i> -->
                        <div class="heading">{{ v.mh }}</div>
                    </div>
                    <div class="borderLeft borderRight">{{ v.ld }}</div>
                    <div class="">{{ v.gs }}</div>
                    <div class="borderLeft legNote"><i class='pi attitude' :class="{'pi-arrow-up-right attClimb':(v.att=='+'),'pi-arrow-down-right attDesc':(v.att=='-')}"></i></div>
                    <div class="borderLeft">{{ formatLegTime(v.lt) }}</div>
                    <div class="borderLeft fuel">{{ v.lf }}<span class="fuelRemaining">{{ v.fr }}</span></div>
                </div>
                <div class="legsGrid legsFooter">
                    <div class="totalDistance borderLeft borderRight borderBottom">{{ navlog.td }}</div>
                    <div class="totalTime borderLeft borderBottom">{{ formatLegTime(navlog.tt) }}</div>
                    <div class="totalFuel borderLeft borderBottom">{{ navlog.ft }}</div>
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
    right: 0;
    bottom: 0;
    opacity: 0.10;
}

.attClimb {
    color: red;
}
.attCruise {
    color: blue;
}
.attDesc {
    color: green;
}
.borderBottom {
    border-bottom: 1px dashed darkgrey;
}
.borderLeft {
    border-left: 1px dashed darkgrey;
}
.borderRight {
    border-right: 1px dashed darkgrey;
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
/* .legs {
    display: grid;
    grid-template-rows: auto auto;
} */
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
    font-size: 3rem;
    line-height: 3.5rem;
    font-weight: 700;
    opacity: 0.1;
    width: 100%;
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
}
.totalFuel {
    grid-column: 6;
    color: blue;
}
.totalGrid {
    display: grid;
    grid-template-columns: 4rem 4rem;
}
.totalTime {
    grid-column: 5;
}

</style>