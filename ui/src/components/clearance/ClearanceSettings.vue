<template>
    <div class="settings">
        <div class="field">
            <Separator name="Display" />
            <DisplayModeSelector :choices="modeChoices" v-model="selectedModeChoice" />
        </div>
        <div class="field" v-if="showAirportInput">
            <Separator name="Airport" />
            <AirportInput v-model="airport" :expanded="true" large @valid="emitUpdate"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, inject, computed } from 'vue'
import { Airport } from '../../models/Airport.ts';
import { TileData } from '../../models/TileData.ts';
import { 
    DisplayModeChoice, 
    DisplayModeIfr 
} from '../../models/DisplayMode.ts';
import { IfrTileDisplayModeLabels } from './IfrTileDisplayModeLabel.ts';
import { getAirport } from '../../services/AirportDataService';

import AirportInput from '../shared/AirportInput.vue';
import DisplayModeSelector from '../shared/DisplayModeSelector.vue';
import Separator from '../shared/Separator.vue';
import { OneChoiceValue } from '../../models/OneChoiceValue';

const emits = defineEmits(['update'])
const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

const props = defineProps({
    tileData: { type: Object, default: null } // We expect TileData
})

const airport = ref(new Airport())
const displayMode = ref(DisplayModeIfr.BoxV)

const displayModes = [
    new DisplayModeChoice( IfrTileDisplayModeLabels.craft, DisplayModeIfr.BoxV),
    new DisplayModeChoice( IfrTileDisplayModeLabels.departure, DisplayModeIfr.Departure),
    new DisplayModeChoice( IfrTileDisplayModeLabels.appraoch, DisplayModeIfr.Approach),
    new DisplayModeChoice( IfrTileDisplayModeLabels.alternate, DisplayModeIfr.Alternate),
    new DisplayModeChoice( IfrTileDisplayModeLabels.lostComms, DisplayModeIfr.LostComms),
]

const modeChoices = computed(() => {
    return displayModes.map(m => new OneChoiceValue(m.label, m.value, m.description));
})

const selectedModeChoice = computed({
    get: () => modeChoices.value.find(c => c.value === displayMode.value),
    set: (val) => { 
        if(val) displayMode.value = val.value as DisplayModeIfr 
    }
})

const showAirportInput = computed(() => {
    return displayMode.value === DisplayModeIfr.Departure || displayMode.value === DisplayModeIfr.Approach
})

onMounted(() => {
    loadFromData(props.tileData as TileData)
})

watch(() => props.tileData, (newData) => {
    loadFromData(newData as TileData)
}, { deep: true })

watch(displayMode, () => {
    emitUpdate()
})

function loadFromData(data: TileData) {
    if (!data) return
    const params = data.data || {}
    
    // Mode
    if (params.mode) {
        // Handle deprecated modes if necessary, logic copied from IfrTile
        if(params.mode == DisplayModeIfr.BoxH_deprecated 
            || params.mode == DisplayModeIfr.Craft_deprecated 
            || params.mode == "") {
            displayMode.value = DisplayModeIfr.BoxV;
        } else {
            displayMode.value = params.mode
        }
    } else {
        displayMode.value = DisplayModeIfr.BoxV
    }

    // Airport
    if (params.airport) {
        // If it's a string code or object? 
        // IfrTile.vue assumes params.airport is a string code usually passed to getAirport
        getAirport(params.airport).then(output => {
            if (output) {
                airport.value = Airport.copy(output)
            }
        })
    } else {
        airport.value = new Airport()
    }
}

function emitUpdate() {
    // Reconstruct the tile data params
    const params = {
        mode: displayMode.value, 
        airport: airport.value.code
    }
    
    // Ensure we treat the prop as TileData
    const newTileData = TileData.copy(props.tileData as TileData)
    newTileData.data = params
    
    emits('update', newTileData)
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

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: bold;
    font-size: 0.9em;
}


</style>
