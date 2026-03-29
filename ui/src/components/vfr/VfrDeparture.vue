<template>
    <div class="vfr-departure">
        <div class="freq-row-top">
            <FrequencyBox :freq="freqWeather" size="small" />
            <FrequencyBox :freq="freqGround" size="small" />
            <FrequencyBox :freq="freqTower" size="small" />
        </div>
        <div class="departure-line-1">
            <!-- Line 1: Info, Wind, Vis and Ceiling -->
            <TitleBox title="Info" class="br bb" />
            <WindBox class="br bb" />
            <VisibilityBox class="br bb" />
        </div>
        <div class="departure-line-2">
            <!-- Line 2: T/DP, Altimeter, Rwy -->
            <TemperatureBox class="bb br" />
            <AltimeterBox class="br bb" />
            <TitleBox title="Rwy" class="bb" />
        </div>

        <div class="departure-line">
             <TitleBox title="Notes" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Metar } from '@gak/shared';
import { computed, PropType } from 'vue';
import { Airport } from '../../models/Airport';
import { Frequency, FrequencyType } from '../../models/Frequency';
import { AirportService } from '../../services/AirportService';

import VisibilityBox from '../atis/VisibilityBox.vue';
import WindBox from '../atis/WindBox.vue';
import FrequencyBox from '../shared/FrequencyBox.vue';
import TitleBox from '../shared/TitleBox.vue';
import TemperatureBox from '../atis/TemperatureBox.vue';
import AltimeterBox from '../atis/AltimeterBox.vue';

const props = defineProps({
    airport: { type: Object as PropType<Airport>, required: true },
    metar: { type: Object as PropType<Metar | null>, default: null },
})

const freqWeather = computed(() => AirportService.getFreqWeather(props.airport) || Frequency.noFreq('Weather', FrequencyType.weather))
const freqGround = computed(() => AirportService.getFreqGround(props.airport))
const freqTower = computed(() => {
    const twr = AirportService.getFreqTower(props.airport)
    if (twr) return Frequency.fromType(twr, FrequencyType.tower)
    const ctaf = AirportService.getFreqCtaf(props.airport)
    return ctaf ? Frequency.fromType(ctaf, FrequencyType.ctaf) : Frequency.noFreq('TWR/CTAF', FrequencyType.tower)
})

</script>

<style scoped>
.vfr-departure {
    display: flex;
    flex-direction: column;
    height: var(--tile-content-height);
    align-items: stretch;
}

.freq-row-top {
    display: flex;
    justify-content: space-around;
    padding: 5px;
    background-color: lightgrey;
    gap: 4px;
}

.departure-line {
    flex: 1;
}

.departure-line-1 {
    display: grid;
    grid-template-columns: 1fr 3fr 2fr;
    flex: 1;
}

.departure-line-2 {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    flex: 1;
}

.departure-line {
    flex: 1;
}

</style>
