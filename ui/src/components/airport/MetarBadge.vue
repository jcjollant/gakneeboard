<template>
    <div class="metar-badge" :class="flightCategoryClass" :title="tooltip">
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { Metar } from '@checklist/shared';

const props = defineProps({
    metar: { type: Object as PropType<Metar>, required: false }
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

const tooltip = computed(() => {
    if (!props.metar) return 'No Metar Data';
    return `${props.metar.fltCat} (${getAge(props.metar.receiptTime)})`;
})

function getAge(time: string) {
    if (!time) return 'unknown';
    const diff = new Date().getTime() - new Date(time).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
</script>

<style scoped>
.metar-badge {
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.2);
}

.cat-vfr {
    background-color: #4CAF50; /* Green */
}
.cat-mvfr {
    background-color: #2196F3; /* Blue */
}
.cat-ifr {
    background-color: #F44336; /* Red */
}
.cat-lifr {
    background-color: #E91E63; /* Pink */
}
.unknown {
    background-color: #9E9E9E; /* Grey */
}
</style>
