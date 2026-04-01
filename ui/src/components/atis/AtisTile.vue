<template>
    <div class="tile" :class="{ 'hide-watermarks': !showWatermarks }" ref="thisTile">
        <Header :title="getTitle()" :left="(!displaySelection && displayMode==DisplayModeAtis.FullATIS && !expanded)" :leftButton="'settings'"
            @replace="emits('replace')" @settings="emits('settings')"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="modesList" :expandable="true" :expanded="expanded"
            @expand="onExpand" @keep="displaySelection=false" />
        <div v-else-if="expanded && displayMode==DisplayModeAtis.FullATIS" class="tileContentEx">
            <div class="expanded atisHeader">
                <div>Info</div>
                <div>Wind</div>
                <div>Visiblity</div>
                <div>Sky</div>
                <div>T°/DP</div>
                <div>Altimeter</div>
                <div>Rwy</div>
            </div>
            <div v-for="n in lines" class="expanded bt">
                <div class="br"></div>
                <WindBox class="br" :showTitle="false" />
                <VisibilityBox class="br" :showTitle="false" />
                <SkyBox class="skyEx br" :showTitle="false" />
                <TemperatureBox class="tempEx br" :showTitle="false" />
                <AltimeterBox class="altEx br" :showTitle="false" />
                <div class="rwyEx">
                </div>
            </div>
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.FullATIS" class="tileContent full">
            <TitleBox title="Info" class="br" />
            <WindBox class="br" />
            <TitleBox title="Rwy" />
            <VisibilityBox class="bt bb" />
            <SkyBox class="bt bl" />
            <TemperatureBox class="bb" />
            <AltimeterBox />
        </div>
        <div v-else-if="displayMode==DisplayModeAtis.CompactATIS" class="tileContent" :class="{ compactWide: expanded }">
            <AtisCompact v-for="n in compactCount" :key="'comp-' + n" :borderBottom="(n % lines !== 0)" :borderLeft="expanded && n > lines" />
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
        <NoSettings v-else />

        <TileModeDots 
            v-if="!displaySelection"
            v-model="displayMode" 
            v-model:expanded="expanded"
            :expandable="true"
            :modes="modesList" 
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { DisplayModeAtis, DisplayModeChoice } from '../../models/DisplayMode';
import { TileData } from '../../models/TileData';
import { TileType } from '../../models/TileType';
import { AtisTileDisplayModeLabels } from './AtisTileDisplayModeLabel';

import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue';
import TileModeDots from '../shared/TileModeDots.vue';
import AtisCompact from './AtisCompact.vue';
import WindBox from './WindBox.vue';
import AltimeterBox from './AltimeterBox.vue';
import VisibilityBox from './VisibilityBox.vue';
import SkyBox from './SkyBox.vue';
import TemperatureBox from './TemperatureBox.vue';
import TitleBox from '../shared/TitleBox.vue';

// Enum with display modes

const emits = defineEmits(['replace','update','settings'])
const defaultMode = DisplayModeAtis.FullATIS
const lines = ref(5)
const showWatermarks = ref(true)
const displayMode = ref(DisplayModeAtis.Unknown)
const displaySelection = ref(false)
const expanded = ref(false)
const modesList = ref([
    new DisplayModeChoice(AtisTileDisplayModeLabels.fullATIS, DisplayModeAtis.FullATIS, true),
    new DisplayModeChoice(AtisTileDisplayModeLabels.compactATIS, DisplayModeAtis.CompactATIS),
    new DisplayModeChoice(AtisTileDisplayModeLabels.categories, DisplayModeAtis.Categories, true),
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
    lines.value = props.params.lines ?? 5
    showWatermarks.value = props.params.showWatermarks !== false
    expanded.value = props.span2
    // console.log('[Atis.loadProps]', expanded.value)
}

const compactCount = computed(() => expanded.value ? lines.value * 2 : lines.value)

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

watch(lines, (newValue, oldValue) => {
    if(newValue !== oldValue) saveConfig()
})

watch(showWatermarks, (newValue, oldValue) => {
    if(newValue !== oldValue) saveConfig()
})

watch(expanded, (val, oldVal) => {
    if (val !== oldVal) {
        saveConfig()
    }
})


function getTitle() {
    if( displaySelection.value) return "Weather Tile Mode"
    switch(displayMode.value) {
        case DisplayModeAtis.Categories: return 'Flight Categories';
        case DisplayModeAtis.FullATIS: 
            if( !expanded.value) return 'Weather @';
//        case DisplayModeAtis.CompactATIS:
        default: return 'Weather';
    }
}

function onExpand(newValue:boolean) {
    expanded.value = newValue
    // saveConfig() will be called by watch
}

function saveConfig() {
    // console.debug('[AtisTile.saveConfig]')
    const data = {mode:displayMode.value, lines:lines.value, showWatermarks:showWatermarks.value}
    emits('update', new TileData(TileType.atis, data, expanded.value))    

}
</script>

<style scoped>
.tileContent {
    display: grid;
    grid-template-rows: repeat( v-bind(lines), 1fr);
    width: 100%;
    height: var(--tile-content-height);
}

.hide-watermarks :deep(.wtrmrk) {
    display: none !important;
}

.tileContent.compactWide {
    grid-template-rows: repeat( v-bind(lines), 1fr);
    grid-template-columns: 1fr 1fr;
    grid-auto-flow: column;
}
.tileContentEx {
    display: grid;
    grid-template-rows: 0.5fr repeat( v-bind(lines), 2fr);
    height: var(--tile-content-height);
}
.expanded {
    display: grid;
    position: relative;
    grid-template-columns: 1.5fr 4.5fr 2.5fr 4fr 3fr 4fr 2fr;
}

.categories {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    font-weight: 600;
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
    font-size: 0.8rem;
    font-weight: normal;
}
.categories .ifr {
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
    color: #000;
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
    font-size: 0.8rem;
    font-weight: normal;
}

.full {
    display: grid;
    grid-template-columns: 20% 30% 25% 25%;
}

.full .wind {
    grid-column: 2 / span 2;
}
.full .sky {
    grid-column: 3 / span 2;
    grid-row: 2 / span 3;
}
.full .visibility {
    grid-row: 2;
    grid-column: 1 / span 2;
}
.full .temperature {
    grid-row: 3;
    grid-column: 1 / span 2;
}
.full .altimeter {
    grid-row: 4;
    grid-column: 1 / span 2;
}

.tempEx {
    flex: 3 1 0px;
}
.atisHeader {
    font-size: 10px;
    font-weight: bold;
    line-height: 12px;
}

</style>