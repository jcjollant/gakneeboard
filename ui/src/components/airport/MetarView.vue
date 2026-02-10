<template>
    <div class="metar-content">
        <div class="raw-text">{{ metar?.rawOb }}</div>
        
        <div class="decoded-grid">
            <div class="grid-item">
                <span class="label">Flight Category:</span>
                <span class="value" :class="flightCategoryClass">{{ metar?.fltCat }}</span>
            </div>
            <div class="grid-item">
                <span class="label">Time:</span>
                <span class="value">{{ metar?.receiptTime }}</span>
            </div>
             <div class="grid-item">
                <span class="label">Wind:</span>
                <span class="value">{{ metar?.wdir }} @ {{ metar?.wspd }} kts <span v-if="metar?.wgst">(Gusts {{ metar?.wgst }})</span></span>
            </div>
            <div class="grid-item">
                <span class="label">Visibility:</span>
                <span class="value">{{ metar?.visib }} SM</span>
            </div>
             <div class="grid-item">
                <span class="label">Clouds:</span>
                <span class="value">
                    <span v-for="(cloud, index) in metar?.clouds" :key="index" class="cloud-layer">
                        {{ cloud.cover }} {{ cloud.base }}
                    </span>
                </span>
            </div>
             <div class="grid-item">
                <span class="label">Temp/Dew:</span>
                <span class="value">{{ metar?.temp }}°C / {{ metar?.dewp }}°C</span>
            </div>
             <div class="grid-item">
                <span class="label">Altimeter:</span>
                <span class="value">{{ formattedAltimeter }}"Hg</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { Metar } from '@gak/shared';

const props = defineProps({
    metar: { type: Object as PropType<Metar>, required: true }
})

const formattedAltimeter = computed(() => {
    if (!props.metar || !props.metar.altim) return '---';
    return (props.metar.altim / 33.864).toFixed(2);
})

const flightCategoryClass = computed(() => {
    if (!props.metar || !props.metar.fltCat) return 'unknown';
    
    switch (props.metar.fltCat) {
        case 'VFR': return 'cat-vfr';
        case 'MVFR': return 'cat-mvfr';
        case 'IFR': return 'cat-ifr';
        case 'LIFR': return 'cat-lifr';
        default: return 'unknown';
    }
})

</script>
<style scoped>
.metar-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.raw-text {
    font-family: monospace;
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
}

.decoded-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
}

.grid-item {
    display: flex;
    flex-direction: column;
    padding: 5px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.label {
    font-weight: bold;
    font-size: 0.8rem;
    color: #666;
}

.value {
    font-size: 1rem;
}

.cloud-layer {
    margin-right: 5px;
}

.cat-vfr { color: #4CAF50; font-weight: bold;}
.cat-mvfr { color: #2196F3; font-weight: bold;}
.cat-ifr { color: #F44336; font-weight: bold;}
.cat-lifr { color: #E91E63; font-weight: bold;}
.unknown { color: #9E9E9E; font-weight: bold;}

</style>
