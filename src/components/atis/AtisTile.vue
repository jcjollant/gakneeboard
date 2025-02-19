<template>
    <div class="tile" ref="thisTile">
        <Header :title="getTitle()" :left="!displaySelection && displayMode==DisplayModeAtis.FullATIS && !expanded"
            @replace="emits('replace')" @display="displaySelection=!displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList"  @selection="changeMode" />
        <div v-else-if="displayMode==DisplayModeAtis.FullATIS && expanded" class="tileContent">
            <div v-for="n in 4" class="expanded" :class="{'bb': n < 4}">
                <div class="infoEx br">
                    <div class="tileBoxLabel">Info</div>
                </div>
                <div class="windEx br">
                    <div class="tileBoxLabel">Wind</div>
                    <div class="at">@</div>
                    <div class="wtrmrk">
                        <div>Calm</div>
                        <div>Vrbl</div>
                    </div>
                </div>
                <div class="visEx br">
                    <div class="tileBoxLabel">Vis</div>
                    <div class="wtrmrk">
                        <div>Ra</div>
                        <div>Fg</div>
                        <div>Br</div>
                    </div>
                </div>
                <div class="skyEx br">
                    <div class="tileBoxLabel">Sky</div>
                    <div class="wtrmrk">
                        <div>Fw</div>
                        <div>Sc</div>
                        <div>Bk</div>
                        <div>Ov</div>
                    </div>
                </div>
                <div class="tempEx br">
                    <div class="tileBoxLabel">Temp</div>
                </div>
                <div class="altEx br">
                    <div class="tileBoxLabel">Alt</div>
                    <div class="wtrmrk">
                        <div>28</div>
                        <div>29</div>
                        <div>30</div>
                    </div>
                </div>
                <div class="rwyEx">
                    <div class="tileBoxLabel">Rwy</div>
                </div>
            </div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.FullATIS" class="tileContent full" @click="cycleMode">
            <div class="info br">
                <div class="tileBoxLabel">Info</div>
            </div>
            <div class="wind br">
                <div class="tileBoxLabel">Wind</div>
            </div>
            <div class="runway">
                <div class="tileBoxLabel">Rwy</div>
            </div>
            <div class="visibility bt bb">
                <div class="tileBoxLabel">Vis</div>
            </div>
            <div class="sky bt bl">
                <div class="tileBoxLabel">Sky</div>
            </div>
            <div class="temperature bb">
                <div class="tileBoxLabel">Temp</div>
            </div>
            <div class="altimeter">
                <div class="tileBoxLabel">Alt</div>
            </div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.CompactATIS" class="tileContent" @click="cycleMode">
            <div v-for="n in 4" class="compact">
                <div class="info br" :class="{bb: n < 4 }">
                    <div class="tileBoxLabel">Info</div>
                </div>
                <div class="wind br" :class="{bb: n < 4 }">
                    <div class="tileBoxLabel">Wind</div>
                    <span class="at">@</span>
                </div>
                <div class="altimeter br" :class="{bb: n < 4 }">
                    <div class="tileBoxLabel">Alt</div>
                </div>
                <div class="runway" :class="{bb: n < 4 }">
                    <div class="tileBoxLabel">Rwy</div>
                </div>
                
            </div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.Categories" class="tileContent categories">
            <div class="vfrLeft vfr">VFR<span class="alt">3,000ft</span></div>
            <div class="vfrRight vfr">&nbsp;<span class="vis">5sm</span></div>
            <div class="mvfrLeft mvfr">MVFR<span class="alt">1,000ft</span></div>
            <div class="mvfrRight mvfr">&nbsp;<span class="vis">3sm</span></div>
            <div class="ifrLeft ifr">IFR<span class="alt">500ft</span></div>
            <div class="ifrRight ifr">&nbsp;<span class="vis">1sm</span></div>
            <div class="lifr">LIFR</div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.CloudClearance" class="tileContent cloudClear">
            <!-- 14 CFR 103.23 -->
            <div v-for="c in ['B','C','D']" class="className towered" :title="'Class ' + c + ' Airspace'">{{ c }}</div>
            <div class="className untowered" title="Class E Airspace">E</div>
            <div class="className untowered" title="Class G Airspace at Night">Gn</div>
            <div class="className untowered" title="Class G Airspace Day time">Gd</div>
            <div class="classB req" title="3sm visibility and Clear of Clouds">3:cc</div>
            <div class="classEHigh req" title="5sm visibility, 1,000ft above, 1,000ft below, 1sm horizontal">5:111<span class="altMin"  title="Above 10,000 ft MSL">10k MSL</span></div>
            <div class="classCDHigh req" title="3sm visibility, 1,000ft above, 500ft below, 2,000ft horizontal">3:152</div>
            <div class="classCDLow">
                <div class="above">1,000ft</div>
                <div class="at">
                    <div class="left">3 sm</div>
                    <font-awesome-icon icon="fa-solid fa-cloud" />
                    <div class="right">2,000ft</div>
                </div>
                <div class="below">500ft</div>
            </div>
            <div class="classGMid req" title="1sm visibility, 1,000ft above, 500ft below, 2,000ft horizontal">1:152</div>
            <div class="classGLow req" title="1sm visibility and Clear of Clouds">1:cc<span class="altMax" title="Below 1,200ft AGL">1k2 AGL</span></div>
            <!-- <font-awesome-icon icon="fa-solid fa-link" class="link" @click="showRegulation" title="Show Regulation" /> -->
            <div class="svfr req" title="Special VFR 1sm visibility and Clear of Clouds">SVFR 1:cc</div>
        </div>
        <NoSettings v-else />
    </div>
</template>

<script setup lang="ts">
import { ref,onMounted, watch } from 'vue'

import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue'
import { DisplayModeAtis } from '../../model/DisplayMode';

// Enum with display modes

const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeAtis.FullATIS
const displayMode = ref(defaultMode)
const displaySelection = ref(false)
const expanded = ref(false)
const modesList = ref([
    {label:'Full Size ATIS', value:DisplayModeAtis.FullATIS},
    {label:'Compact ATIS (x4)', value:DisplayModeAtis.CompactATIS},
    {label:'Flight Categories', value:DisplayModeAtis.Categories},
    {label:'Cloud Clearance', value:DisplayModeAtis.CloudClearance}
])
const props = defineProps({
    params: { type: Object, default: null}, // expects {'mode':'compact'}
    span2: {type: Boolean, default: false}
})
const thisTile=ref<HTMLElement | null>(null)


function loadProps(props:any) {
    // console.log('ATIS loadProps ' + JSON.stringify(props))
    const newMode = props.params.mode
    // load mode from params but defaults to full
    if( newMode) {
        displayMode.value = newMode
    } else {
        displayMode.value = defaultMode
    }
    expanded.value = props.span2
    // console.log('[Atis.loadProps]', expanded.value)
}

onMounted(() => {   
    // console.log('ATIS mounted with ' + JSON.stringify(props.params))
    loadProps(props)
    // console.log('onMounted mode ' + mode.value)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})
// End of Props management


function changeMode(newMode) {
    // console.log('[Atis.changeMode]', newMode)
    displayMode.value = newMode
    displaySelection.value = false;
    const params = {mode:newMode}
    emits('update', params)
}

function cycleMode() {
    if(displayMode.value == '') {
        changeMode('compact')
    } else {
        changeMode(defaultMode)
    }
}

function getTitle() {
    if( displaySelection.value) return "Weather Tile Mode"
    switch(displayMode.value) {
        case DisplayModeAtis.CompactATIS: return 'ATIS';
        case DisplayModeAtis.Categories: return 'Flight Categories';
        case DisplayModeAtis.CloudClearance: return 'Cloud Clearance';
        default: return 'ATIS @';
    }
}

function onHeaderClick() {
    displaySelection.value = ! displaySelection.value
}

</script>

<style scoped>
.tileContent {
    display: grid;
    grid-template-rows: repeat( 4, 1fr);
    width: 100%;
}
.expanded {
    display: flex;
    position: relative;
}
.categories {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    font-weight: 600;
    font-size: optional;
}
.categories div {
    position: relative;
    text-align: end;
    padding: 5px;
}
.categories .alt {
    position: absolute;
    left: 2px;
    bottom: 2px;
    font-size: 1rem;
    font-weight: normal;
}
.categories .ifr {
    /* color: white; */
    /* background-color: #E33; */
    color: #600;
    border-right: 1px solid #600;
}
.categories .ifrLeft {
    grid-column: 1 / span 2;
    grid-row: 3;
    border-top: 1px solid #600;
}
.categories .ifrRight {
    grid-column: 2;
    grid-row: 4;
}
.categories .lifr {
    color: white;
    background-color: #E3E;
}
.categories .mvfr {
    /* color: white; */
    /* background-color: #66E; */
    color: #006;
    border-right: 1px solid #006;
}
.categories .mvfrLeft {
    border-top: 1px solid #006;
    grid-column: 1 / span 3;
}
.categories .mvfrRight {
    grid-column: 3;
    grid-row: 3 / span 2;
}
.categories .vfr {
    color: #000
    /* background-color: #6E6; */
}
.categories .vfrLeft {
    grid-column: 1 / span 4;
}
.categories .vfrRight {
    grid-column: 4;
    grid-row: 2 / span 3;
}
.categories .vis {
    position: absolute;
    left: 0;
    bottom: 2px;
    writing-mode: vertical-lr;
    font-size: 1rem;
    font-weight: normal;
}
.cloudClear {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr 3fr 3fr 3fr;
}
.cloudClear .altMin {
    position: absolute;
    right: 0;
    bottom : 0;
    font-size: 0.8rem;
}
.cloudClear .altMax {
    position: absolute;
    right: 0;
    top : 0;
    font-size: 0.6rem;
}
.cloudClear .classB {
    grid-row: 2 / span 3;
    grid-column: 1;
    border-right: 1px dashed grey;
}
.cloudClear .classCDHigh {
    grid-row: 2;
    grid-column: 2 / span 2;
}
.cloudClear .classCDLow {
    grid-row: 3 / span 2;
    grid-column: 2 / span 4;
    border-right: 1px dashed grey;
    display: flex;
    flex-flow: column;
    font-size: 0.8rem;
    justify-content: center;
    color: #006;
}
.cloudClear .classCDLow .fa-cloud {
    font-size: 1.5rem;
    color: #006;
    margin: 10px;
}

.cloudClear .classCDLow .at {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cloudClear .classEHigh {
    position: relative;
    grid-row: 2;
    grid-column: 4 / span 3;
    border-bottom: 1px dashed grey;
    border-left: 1px dashed grey;
}
.cloudClear .classGMid {
    grid-row: 3;
    grid-column: 6;
    font-size: 0.8rem;
}
.cloudClear .classGLow {
    position: relative;
    grid-row: 4;
    grid-column: 6;
    border-top: 1px dashed grey;
}
.cloudClear .className {
    font-weight: 600;
    border-bottom: 1px dashed grey;
}

.cloudClear .link {
    position: absolute;
    left: 5px;
    bottom: 5px;
    font-size: 0.7rem;
    color: #666;
    cursor: pointer;
}

.cloudClear .req {
    display: flex;
    justify-content: center;
    align-items: center;
}
.cloudClear .svfr {
    border-top: 1px dashed grey;
    grid-column: 1 / span 6;
    font-size: 0.8rem;
    background-color: lightgrey;
}
.cloudClear .towered {
    color: #006
}

.cloudClear .untowered {
    color: #606
}

.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-rows: repeat(4, 3rem);
}

.full {
    display: grid;
    grid-template-columns: 20% 30% 25% 25%;
}
.compact {
    display: grid;
    grid-template-columns: 15% 40% 25% 20%;
}
.info {
    grid-column: 1;
    position: relative;
}
.wind {
    position: relative;
}
.full .wind {
    grid-column: 2 / span 2;
}
.compact .wind {
    grid-column: 2;
}
.runway {
    grid-column: 4;
    position: relative;
}
.sky {
    grid-column: 3 / span 2;
    grid-row: 2 / span 3;
    position: relative;
}
.visibility {
    grid-row: 2;
    grid-column: 1 / span 2;
    position: relative;
}
.temperature {
    grid-row: 3;
    grid-column: 1 / span 2;
    position: relative;
}
.altimeter {
    position: relative;
}
.full .altimeter {
    grid-row: 4;
    grid-column: 1 / span 2;
}
.compact .altimeter {
    grid-column:3;
}
.wind .at {
    position: absolute;
    left: 50px;
    top: 20px;
    font-size: 0.8rem;
    color: darkgrey;
}

.infoEx, .windEx, .visEx, .skyEx, .tempEx, .altEx, .rwyEx {
    position: relative;
}
.infoEx {
    flex: 1.5 1 0px;
}
.windEx {
    flex: 4.5 1 0px;
}
.visEx {
    flex: 2.5 1 0px;
}
.skyEx {
    flex: 4 1 0px;
}
.tempEx {
    flex: 3 1 0px;
}
.altEx {
    flex: 4 1 0px;
}
.rwyEx {
    flex: 2 1 0px;
}
.wtrmrk {
    position: absolute;
    display: flex;
    font-size: 10px;
    font-weight: 600;
    opacity: 0.3;
    bottom: 0;
    justify-content: space-between;
    width: 100%;
    padding: 2px 4px;
}
.windEx .at {
    display: flex;
    font-size: 15px;
    font-weight: bolder;
    padding-left: 55px;
    padding-top: 20px;
    opacity: 0.3;
}
</style>