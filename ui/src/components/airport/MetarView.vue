<template>
    <div class="metar-content">
        <div class="raw-text">{{ metar?.rawOb }}</div>
        
        <div class="decoded-grid">
            <div class="grid-item">
                <span class="label">Flight Category:</span>
                <span class="value" :class="flightCategoryClass">{{ metar?.fltCat }}</span>
            </div>
            <div class="grid-item">
                <span class="label">Local Time (Age):</span>
                <span class="value">{{ localTimeWithAge }}</span>
            </div>
            <div class="grid-item">
                <span class="label">Wind:</span>
                <span class="value">{{ formattedWind }}</span>
            </div>
            <div class="grid-item">
                <span class="label">Visibility:</span>
                <span class="value" :class="visHighlightClass">{{ metar?.visib }} SM</span>
            </div>
             <div class="grid-item">
                <span class="label">Clouds:</span>
                <span class="value" :class="ceilingHighlightClass">
                    <span v-for="(cloud, index) in metar?.clouds" :key="index" class="cloud-layer">
                        {{ cloud.cover }} {{ cloud.base }}
                    </span>
                    <span v-if="!metar?.clouds || metar?.clouds.length === 0">Clear</span>
                </span>
            </div>
             <div class="grid-item">
                <span class="label">Temp/Dew (Saturation Alt):</span>
                <span class="value">
                    {{ Math.round(metar?.temp ?? 0) }}°C / {{ Math.round(metar?.dewp ?? 0) }}°C
                    <span v-if="saturationAltitude !== null">({{ saturationAltitude }} ft)</span>
                </span>
            </div>
            <div class="grid-item">
                <span class="label">Altimeter:</span>
                <span class="value">{{ formattedAltimeter }}"Hg</span>
            </div>
            <div class="grid-item density-altitude">
                <span class="label">Density Altitude (Theoretical):</span>
                <span class="value">{{ densityAltitude !== null ? densityAltitude + ' ft' : '---' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { Metar } from '@gak/shared';

const props = defineProps({
    metar: { type: Object as PropType<Metar>, required: true },
    elevation: { type: Number, default: 0 }
})

const densityAltitude = computed(() => {
    if (!props.metar || props.metar.temp === undefined || props.metar.altim === undefined) return null;
    
    // Formula for Density Altitude:
    // 1. Pressure Altitude (PA) = Elevation + (29.92 - Altimeter_inHg) * 1000
    // 2. ISA Temperature at Elevation = 15 - (1.98 * Elevation / 1000)
    // 3. Density Altitude (DA) = PA + (118.8 * (Outside_Air_Temp - ISA_Temp))
    
    const altimInHg = props.metar.altim / 33.864;
    const pa = props.elevation + (29.92 - altimInHg) * 1000;
    const isaTemp = 15 - (1.98 * props.elevation / 1000);
    const da = pa + (118.8 * (props.metar.temp - isaTemp));
    
    return Math.round(da);
});

const saturationAltitude = computed(() => {
    if (!props.metar || props.metar.temp === undefined || props.metar.dewp === undefined) return null;
    const spread = props.metar.temp - props.metar.dewp;
    return Math.round(spread * 400);
});

const formattedAltimeter = computed(() => {
    if (!props.metar || !props.metar.altim) return '---';
    return (props.metar.altim / 33.864).toFixed(2);
})

const formattedWind = computed(() => {
    if (!props.metar) return '---';
    if (props.metar.wdir === 0 && props.metar.wspd === 0) {
        return 'Calm';
    }
    let wind = `${props.metar.wdir} @ ${props.metar.wspd} kts`;
    if (props.metar.wgst) {
        wind += ` (Gusts ${props.metar.wgst})`;
    }
    return wind;
});

const metarAge = computed(() => {
    if (!props.metar || !props.metar.receiptTime) return 'unknown';
    const diff = new Date().getTime() - new Date(props.metar.receiptTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
});

const localTime = computed(() => {
    if (!props.metar || !props.metar.receiptTime) return '---';
    const date = new Date(props.metar.receiptTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
});

const localTimeWithAge = computed(() => {
    if (!props.metar || !props.metar.receiptTime) return '---';
    return `${localTime.value} (${metarAge.value})`;
});

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

const CAT_RANK: Record<string, number> = { 'LIFR': 3, 'IFR': 2, 'MVFR': 1, 'VFR': 0 };

const visibilityCategory = computed(() => {
    if (!props.metar) return 'VFR';
    const visStr = String(props.metar.visib).replace('+', '');
    const vis = parseFloat(visStr);
    if (isNaN(vis)) return 'VFR';

    if (vis < 1) return 'LIFR';
    if (vis < 3) return 'IFR';
    if (vis <= 5) return 'MVFR';
    return 'VFR';
});

const ceiling = computed(() => {
    if (!props.metar || !props.metar.clouds || !Array.isArray(props.metar.clouds)) return null;
    const layers = props.metar.clouds
        .filter(c => ['BKN', 'OVC', 'OVX', 'VV'].includes(c.cover))
        .map(c => c.base)
        .sort((a, b) => a - b);
    return layers.length > 0 ? layers[0] : null;
});

const ceilingCategory = computed(() => {
    const ceil = ceiling.value;
    if (ceil === null) return 'VFR';
    if (ceil < 500) return 'LIFR';
    if (ceil < 1000) return 'IFR';
    if (ceil <= 3000) return 'MVFR';
    return 'VFR';
});

const visHighlightClass = computed(() => {
    if (!props.metar || props.metar.fltCat === 'VFR') return '';
    const cat = visibilityCategory.value;
    if (CAT_RANK[cat] >= CAT_RANK[props.metar.fltCat]) {
        return flightCategoryClass.value;
    }
    return '';
});

const ceilingHighlightClass = computed(() => {
    if (!props.metar || props.metar.fltCat === 'VFR') return '';
    const cat = ceilingCategory.value;
    if (CAT_RANK[cat] >= CAT_RANK[props.metar.fltCat]) {
        return flightCategoryClass.value;
    }
    return '';
});

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
    border: 2px solid #ccc;
    border-radius: 4px;
}

.density-altitude {
    border-style: dashed;
    border-color: #eee;
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
