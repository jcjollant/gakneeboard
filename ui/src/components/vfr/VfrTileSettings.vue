<template>
    <div class="settings">
        <!-- Route Section -->
        <Separator name="Airports" :leftAligned="true" />
        <AirportInput 
            v-model="airportFrom" 
            v-model:routeCode="selectedFromRouteCode" 
            label="Dep."
            :showRecent="true" 
            large 
            :route="route" 
            @valid="emitUpdate"
        />

        <AirportInput 
            v-model="airportTo" 
            v-model:routeCode="selectedToRouteCode" 
            label="Dest."
            :showRecent="true" 
            large 
            :route="route" 
            @valid="emitUpdate"
        />

        <!-- Date Section -->
        <SeparatorChoice 
            name="Date" 
            v-model="isDayFlight" 
            choiceA="Day" 
            choiceB="Overnight" 
        />
        <div class="field calendar-field">
            <Calendar v-model="flightDate" showIcon class="w-full" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, inject } from 'vue'
import { Airport } from '../../models/Airport.ts';
import { TileData } from '../../models/TileData.ts';
import { Route, RouteCode } from '@gak/shared';
import { getAirport } from '../../services/AirportDataService';
import { RouteService } from '../../services/RouteService.ts';
import { VfrTileConfig } from './VfrTileConfig.ts';

import AirportInput from '../shared/AirportInput.vue';
import Separator from '../shared/Separator.vue';
import SeparatorChoice from '../shared/SeparatorChoice.vue';
import Calendar from 'primevue/calendar';

const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

const props = defineProps({
    tileData: { type: Object, default: null }, // We expect TileData
    route: { type: Object as () => Route, default: undefined }
})

const airportFrom = ref(new Airport())
const airportTo = ref(new Airport())
const isDayFlight = ref(true)
const flightDate = ref(new Date())
const selectedFromRouteCode = ref<RouteCode | undefined>(undefined);
const selectedToRouteCode = ref<RouteCode | undefined>(undefined);

let isInternalUpdate = false;

onMounted(() => {
    loadFromData(props.tileData as TileData)
})

watch(() => props.tileData, (newData) => {
    loadFromData(newData as TileData)
}, { deep: true })

watch([isDayFlight, flightDate, selectedFromRouteCode, selectedToRouteCode], () => {
    if (!isInternalUpdate) {
        emitUpdate()
    }
})

function loadFromData(data: TileData) {
    if (!data) return
    isInternalUpdate = true;
    const params = (data.data || {}) as VfrTileConfig;
    
    // Sunlight params mapping
    const sunlight = params.sunlight || {};
    isDayFlight.value = sunlight.night === undefined ? true : !sunlight.night;
    flightDate.value = sunlight.date ? new Date(sunlight.date) : new Date();

    // From Airport
    const fromRouteCode = params.fromRouteCode as RouteCode | undefined;
    const fromCode = fromRouteCode ? RouteService.getAirportCode(props.route, fromRouteCode) : params.from;
    if (fromCode) {
        getAirport(fromCode).then(output => {
            if (output) {
                airportFrom.value = Airport.copy(output)
                selectedFromRouteCode.value = fromRouteCode;
            }
        })
    }

    // To Airport
    const toRouteCode = params.toRouteCode as RouteCode | undefined;
    const toCode = toRouteCode ? RouteService.getAirportCode(props.route, toRouteCode) : params.to;
    if (toCode) {
        getAirport(toCode).then(output => {
            if (output) {
                airportTo.value = Airport.copy(output)
                selectedToRouteCode.value = toRouteCode;
            }
        })
    }

    setTimeout(() => { isInternalUpdate = false; }, 0);
}

function emitUpdate() {
    // Construct the tile data params
    const sunlight = {
        from: airportFrom.value.code,
        to: airportTo.value.code,
        date: flightDate.value,
        night: !isDayFlight.value,
        mode: (props.tileData.data?.sunlight?.mode) || 'flight'
    };

    const newConfig: any = {
        ...props.tileData.data,
        from: airportFrom.value.code,
        to: airportTo.value.code,
        fromRouteCode: selectedFromRouteCode.value,
        toRouteCode: selectedToRouteCode.value,
        sunlight: sunlight
    };
    
    const newTileData = TileData.copy(props.tileData as TileData)
    newTileData.data = newConfig
    
    if (tileSettingsUpdate) {
        tileSettingsUpdate(newTileData);
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

.calendar-field {
    padding: 0 10px;
}

.w-full {
    width: 100%;
}
</style>
