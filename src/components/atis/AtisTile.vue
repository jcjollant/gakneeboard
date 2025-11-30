<template>
    <div class="tile" ref="thisTile">
        <Header :title="getTitle()" :left="!displaySelection && displayMode==DisplayModeAtis.FullATIS && !expanded"
            @replace="emits('replace')" @display="displaySelection=!displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList" :expandable="true" :expanded="expanded"
            @expand="onExpand" @keep="displaySelection=false" />
        <div v-else-if="expanded && (displayMode==DisplayModeAtis.FullATIS || displayMode==DisplayModeAtis.CompactATIS)" class="tileContentEx">
            <div class="flex atisHeader">
                <div class="infoEx">Info</div>
                <div class="windEx">Wind</div>
                <div class="visEx">Vis</div>
                <div class="skyEx">Sky</div>
                <div class="tempEx">T°/DP</div>
                <div class="altEx">Alt</div>
                <div class="rwyEx">Rwy</div>
            </div>
            <div v-for="n in 5" class="expanded bt">
                <div class="infoEx br">
                </div>
                <div class="windEx br">
                    <div class="at atEx">@</div>
                    <div class="wtrmrk"><div>Vrb</div></div>
                    <div class="wtrmrk clear">Calm</div>
                    <div class="wtrmrk gust">G</div>
                </div>
                <div class="visEx br">
                    <div class="wtrmrk">
                        <div>Ra</div>
                        <div>Fg</div>
                        <div>Br</div>
                    </div>
                    <div class="wtrmrk clear">10+</div>
                </div>
                <div class="skyEx br">
                    <div class="wtrmrk">
                        <div>Fw</div>
                        <div>Sc</div>
                        <div>Bk</div>
                        <div>Ov</div>
                    </div>
                    <div class="wtrmrk clear">CLR</div>
                </div>
                <div class="tempEx br">
                    <div class="tempText">/</div>
                </div>
                <div class="altEx br">
                    <div class="wtrmrk">
                        <div>28</div>
                        <div>29</div>
                        <div>30</div>
                    </div>
                </div>
                <div class="rwyEx">
                </div>
            </div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.FullATIS" class="tileContent full" @click="cycleMode">
            <div class="info br">
                <div class="tileBoxLabel">Info</div>
            </div>
            <div class="wind br">
                <div class="tileBoxLabel">Wind</div>
                <div class="at">@</div>
                <div class="wtrmrk">
                    <div>Vrb</div>
                </div>
                <div class="wtrmrk clear">Calm</div>
                <div class="wtrmrk gust">G</div>
            </div>
            <!-- <div class="wind br">
                <div class="tileBoxLabel">Wind</div>
            </div> -->
            <div class="runway">
                <div class="tileBoxLabel">Rwy</div>
            </div>
            <div class="visibility bt bb">
                <div class="tileBoxLabel">Vis</div>
                <div class="wtrmrk">
                    <div>Ra</div>
                    <div>Fg</div>
                    <div>Br</div>
                </div>
                <div class="wtrmrk clear">10+</div>
                <!-- <div class="tileBoxLabel">Vis</div> -->
            </div>
            <div class="sky bt bl">
                <div class="tileBoxLabel">Sky</div>
                <div class="wtrmrk">
                    <div>Fw</div>
                    <div>Sc</div>
                    <div>Bk</div>
                    <div>Ov</div>
                </div>
                <div class="wtrmrk clear">CLR</div>
            </div>
            <div class="temperature bb">/
                <div class="tileBoxLabel">T°/DP</div>
            </div>
            <div class="altimeter">
                <div class="tileBoxLabel">Alt</div>
                <div class="wtrmrk">
                    <div>28</div>
                    <div>29</div>
                    <div>30</div>
                </div>
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
                    <div class="wtrmrk gust">G</div>
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
        <CloudClearance v-else-if="displayMode==DisplayModeAtis.CloudClearance" />
        <NoSettings v-else />
    </div>
</template>

<script setup lang="ts">
import { ref,onMounted, watch } from 'vue'
import { DisplayModeAtis, DisplayModeChoice } from '../../model/DisplayMode';
import { TileType } from '../../model/TileType';
import { TileData } from '../../model/TileData';
import { AtisTileDisplayModeLabels } from './AtisTileDisplayModeLabel';

import CloudClearance from './CloudClearance.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue'

// Enum with display modes

const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeAtis.FullATIS
const displayMode = ref(DisplayModeAtis.Unknown)
const displaySelection = ref(false)
const expanded = ref(false)
const modesList = ref([
    new DisplayModeChoice(AtisTileDisplayModeLabels.fullATIS, DisplayModeAtis.FullATIS, true),
    new DisplayModeChoice(AtisTileDisplayModeLabels.compactATIS, DisplayModeAtis.CompactATIS),
    new DisplayModeChoice(AtisTileDisplayModeLabels.categories, DisplayModeAtis.Categories, true),
    new DisplayModeChoice(AtisTileDisplayModeLabels.cloudClearance, DisplayModeAtis.CloudClearance, true),
])
const props = defineProps({
    params: { type: Object, default: null}, // expects {'mode':'compact'}
    span2: {type: Boolean, default: false}
})
const thisTile=ref<HTMLElement | null>(null)


function loadProps(props:any) {
    // console.debug('[AtisTile.loadProps]', props)
    const newMode = props.params.mode
    // load mode from params but defaults to full
    if( newMode && newMode != DisplayModeAtis.Unknown) {
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

watch(displayMode, (newValue, oldValue) => {
    // console.debug('[AtisTile.watch] displayMode changed to ', newValue)
    displaySelection.value = false;

    if(newValue == oldValue || oldValue == DisplayModeAtis.Unknown) return;
    saveConfig()
})


function cycleMode() {
    if(displayMode.value == '') {
        displayMode.value = DisplayModeAtis.CompactATIS
    } else {
        displayMode.value = defaultMode
    }
}

function getTitle() {
    if( displaySelection.value) return "Weather Tile Mode"
    switch(displayMode.value) {
        case DisplayModeAtis.Categories: return 'Flight Categories';
        case DisplayModeAtis.CloudClearance: return 'Cloud Clearance';
        case DisplayModeAtis.FullATIS: 
            if( !expanded.value) return 'Weather @';
//        case DisplayModeAtis.CompactATIS:
        default: return 'Weather';
    }
}

function onExpand(newValue:boolean) {
    expanded.value = newValue
    saveConfig()
}

function saveConfig() {
    // console.debug('[AtisTile.saveConfig]')
    const data = {mode:displayMode.value}
    emits('update', new TileData(TileType.atis, data, expanded.value))    

}
</script>

<style scoped>
.tileContent {
    display: grid;
    grid-template-rows: repeat( 4, 1fr);
    width: 100%;
}
.tileContentEx {
    display: grid;
    grid-template-rows: 0.5fr 2fr 2fr 2fr 2fr 2fr;
    height: var(--tile-content-height);
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
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: x-large;
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
.tempText {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: x-large;
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
    bottom: 0;
    justify-content: space-between;
    width: 100%;
    padding: 2px 4px;
}
.clear {
    top: 0;
    flex-flow: row-reverse;
}
.gust {
    right: 0;
    width: 49px;
    opacity: 0.2;
}
.windEx .at {
    display: flex;
    font-size: 15px;
    font-weight: bolder;
    padding-left: 55px;
    padding-top: 10px;
    opacity: 0.3;
}
.atisHeader {
    font-size: 10px;
    font-weight: bold;
    line-height: 12px;
}
</style>