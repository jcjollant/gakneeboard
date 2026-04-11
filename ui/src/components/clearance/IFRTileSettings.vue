<template>
    <div class="settings">

        <Separator name="Airport" :leftAligned="true" />
        <AirportInput v-model="airport" v-model:routeCode="selectedRouteCode" :showRecent="true" large :route="route" @valid="emitUpdate"/>

        <!-- Display Configuration -->
        <div class="settings-section display-section">
            <Separator name="Display" :leftAligned="true" />
            <ChoiceList v-model="displayMode" :choices="modeOptions" :small="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Route, RouteCode } from '@gak/shared';
import { inject, onMounted, ref, watch } from 'vue';
import { Airport } from '../../models/Airport.ts';
import { DisplayModeIfr } from '../../models/DisplayMode.ts';
import { TileData } from '../../models/TileData.ts';
import { getAirport } from '../../services/AirportDataService';
import { RouteService } from '../../services/RouteService.ts';
import { IfrTileConfig } from './IfrTileConfig.ts';

import AirportInput from '../shared/AirportInput.vue';
import ChoiceList from '../shared/ChoiceList.vue';
import Separator from '../shared/Separator.vue';

const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

const props = defineProps({
    tileData: { type: Object, default: null }, // We expect TileData
    route: { type: Object as () => Route, default: undefined }
})

const airport = ref(new Airport())
const modeOptions = IfrTileConfig.modesList;
const displayMode = ref(DisplayModeIfr.BoxV)
const expanded = ref(false)
const selectedRouteCode = ref<RouteCode | undefined>(undefined);
const isInternalUpdate = ref(false);

const tileData = ref<TileData>(props.tileData as TileData);

onMounted(() => {
    loadFromData(props.tileData as TileData)
})

watch(() => props.tileData, (newData) => {
    loadFromData(newData as TileData)
}, { deep: true })

watch([displayMode, expanded, selectedRouteCode, () => airport.value.code], () => {
    // console.debug('[IFRTileSettings.watch] displayMode', displayMode.value, isInternalUpdate.value)
    if (!isInternalUpdate.value) {
        emitUpdate()
    }
})

function loadFromData(data: TileData) {
    if (!data) return
    isInternalUpdate.value = true;
    const params = data.data || {}
    
    // Mode
    if (params.mode) {
        // Handle deprecated modes if necessary, logic copied from IfrTile
        if(params.mode == DisplayModeIfr.BoxH_deprecated 
            || params.mode == DisplayModeIfr.Craft_deprecated 
            || params.mode == "") {
            displayMode.value = DisplayModeIfr.BoxV;
        } else {
            if (displayMode.value !== params.mode) {
                displayMode.value = params.mode
            }
        }
    } else {
        displayMode.value = DisplayModeIfr.BoxV
    }
    
    expanded.value = data.span2;

    const codeFromRoute = RouteService.getAirportCode(props.route, params.routeCode)
    const airportCode = codeFromRoute || params.airport
    
    if (airportCode) {
        getAirport(airportCode).then(output => {
            if (output) {
                airport.value = Airport.copy(output)
                selectedRouteCode.value = params.routeCode
            }
            isInternalUpdate.value = false;
        }).catch(() => {
            isInternalUpdate.value = false;
        })
    } else {
        airport.value = new Airport()
        selectedRouteCode.value = undefined
        isInternalUpdate.value = false;
    }
}

function emitUpdate() {
    // console.debug('[IFRTileSettings.emitUpdate] isInternalUpdate', isInternalUpdate.value)
    if (isInternalUpdate.value) return;
    
    // Reconstruct the tile data params using a plain object
    const newConfig = {
        mode: displayMode.value,
        airport: airport.value.code,
        routeCode: selectedRouteCode.value
    }
    
    // Mutate the local tileData object (which is the object passed from TilePage)
    tileData.value.data = newConfig
    tileData.value.span2 = expanded.value
    
    // console.debug('[IFRTileSettings.emitUpdate] tileData.value', tileData.value, tileSettingsUpdate)
    if (tileSettingsUpdate) {
        tileSettingsUpdate(tileData.value);
    }
}

</script>

<style scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: bold;
    font-size: 0.9em;
}

.settings-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.display-section :deep(.choicelist) {
    justify-content: center;
}

</style>
