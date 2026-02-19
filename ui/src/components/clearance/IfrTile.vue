<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="false" leftButton="settings"
            @replace="emits('replace')" @settings="emits('settings')"></Header>
       
        <ApproachContent v-if="displayMode==DisplayModeIfr.Approach" :airport="airport" />
        <DepartureContent v-else-if="displayMode==DisplayModeIfr.Departure" :airport="airport" />
        <div v-else-if="displayMode==DisplayModeIfr.Alternate">
            <ImageContent src="alternate.png" /> 
            <RegLink :regs="[Regulation.IFRFlightPlanInformation]" />
        </div>
        <div v-else-if="displayMode==DisplayModeIfr.LostComms" >
            <ImageContent src="lostcomms-ifr.png" /> 
            <RegLink :regs="[Regulation.IFRTwoWayRadioFailure]" />
        </div>
        <CraftBoxedContent v-else />

        <NotamBadge v-if="displayMode==DisplayModeIfr.Departure && notamsList.length > 0" 
            :count="notamsList.length" 
            class="notam-badge-pos" 
            @click.stop="showNotamsDialog = true" />

        <NotamListDialog :visible="showNotamsDialog" 
            :notams="notamsList" 
            :airportCode="airport.code" 
            :airportName="airport.name" 
            @close="showNotamsDialog = false" />

        <TileModeDots 
            v-model="displayMode" 
            :modes="modesList" 
        />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../models/Airport.ts';
import { DisplayModeIfr } from '../../models/DisplayMode.ts';
import { getAirport, getNotams } from '../../services/AirportDataService';
import { IfrTileConfig } from './IfrTileConfig.ts';
import { Regulation } from '../../models/Regulation.ts';
import { Notam } from '../../models/Notam.ts';
import { TileData } from '../../models/TileData.ts';
import { TileType } from '../../models/TileType.ts';

import ApproachContent from './ApproachContent.vue';
import CraftBoxedContent from './CraftBoxedContent.vue';
import DepartureContent from './DepartureContent.vue';
import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import RegLink from '../regulations/RegLink.vue';
import NotamBadge from '../airport/NotamBadge.vue';
import NotamListDialog from '../airport/NotamListDialog.vue';
import TileModeDots from '../shared/TileModeDots.vue';

// Enum with display modes

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update','settings'])
const defaultMode = DisplayModeIfr.BoxV
const displayMode=ref(DisplayModeIfr.Unknown)
const modesList = IfrTileConfig.modesList
const notamsList = ref<Notam[]>([])
const showNotamsDialog = ref(false)

const props = defineProps({
    params: { type: Object, default: null},
})

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch( displayMode, (newValue, oldValue) => {
    if( newValue == oldValue || oldValue == DisplayModeIfr.Unknown) return;
    saveConfig()
})

function saveConfig() {
    const params = {mode:displayMode.value, airport:airport.value.code}
    emits('update', new TileData( TileType.clearance, params))
}

function loadProps(props:any) {
    // console.debug('[Clearance.loadProps]', JSON.stringify(props))
    // displayMode.value = defaultMode
    if( props.params) {
         if( props.params.mode) {
            // for compatibility with old versions
            if(props.params.mode == DisplayModeIfr.BoxH_deprecated 
                || props.params.mode==DisplayModeIfr.Craft_deprecated 
                || props.params.mode=="") {
                displayMode.value = defaultMode;
            } else {
                displayMode.value = props.params.mode
            }
         } else {
            displayMode.value = defaultMode
         }
         if( props.params.airport) {
            getAirport(props.params.airport).then( output => {
                if( output) {
                    airport.value = Airport.copy(output)
                    getNotams(output.code).then(notams => {
                        notamsList.value = notams
                    })
                }
            })
         }
    } else {
        displayMode.value = defaultMode
    }

}

function getTitle() {
    let title:string;
    const airportCode = airport.value.code || ''
    if( displayMode.value==DisplayModeIfr.Approach) {
        title =  `${airportCode} Apch`
    } else if( displayMode.value==DisplayModeIfr.Alternate) {
        title = 'IFR Alternate'
    } else if( displayMode.value==DisplayModeIfr.LostComms) {
        title = 'IFR Lost Comms'
    } else if( displayMode.value==DisplayModeIfr.Departure) {
        title = airportCode.length ? `Depart ${airportCode} IFR` : 'IFR Departure'
    } else {
        title = 'IFR CRAFT Clearance'
    }

    return title
}

</script>

<style scoped>
.notam-badge-pos {
    position: absolute;
    top: calc(var(--header-height) + 2px);
    right: 2px;
    z-index: 10;
}
</style>