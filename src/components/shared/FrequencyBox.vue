<template>
    <div class="frequencyBox" :class="[size]" :title="getTitle(freq)">
        <div class="name" :class="[size]">{{freq.name}}</div>
        <div class="freq" :class="[size,getClass(freq)]">{{ freq.mhz ? Formatter.frequency(freq.mhz) : '' }}</div>
        <font-awesome-icon v-if="size!='small' && iconClass.length" :icon="iconClass" class="freqType" :class="[size]"/>
    </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { Formatter } from '../../lib/Formatter'
import { Frequency, FrequencyType } from '../../model/Frequency';

const iconClass = ref<string[]>([])

const props = defineProps({
    freq: { type: Frequency, default: null},
    size: { type: String, default: 'small'},
})

function getClass(frequency:Frequency) {
    if(!frequency) return ''
    let css = ''
    switch(frequency.type) {
        case FrequencyType.ctaf: css = 'ctaf'; break;
        case FrequencyType.navaid: css = 'navaid'; break;
        case FrequencyType.tower: css = 'tower'; break;
        case FrequencyType.clearance: 
        case FrequencyType.tracon:  css = 'tracon'; break;
        case FrequencyType.weather: css = 'weather'; break;
        case FrequencyType.ground: css = 'ground'; break;
        default: css = '';
    }
    return css
}


function getIcon():Array<string> {
    // console.log("[FrequencyBox.getIcon]", props.freq?.type)
    let icon:string|undefined = undefined
    switch(props.freq?.type) {
        case FrequencyType.clearance: icon = 'truck-fast'; break;
        case FrequencyType.ctaf: icon = 'plane'; break;
        case FrequencyType.ground: icon = 'building'; break;
        case FrequencyType.navaid: icon = 'tower-cell'; break;
        case FrequencyType.tower: icon = 'tower-observation'; break;
        case FrequencyType.tracon: icon = 'route'; break;
        case FrequencyType.weather: icon = 'cloud-sun-rain'; break;
    }
    return icon ? ["fas", icon] : []
}

function getTitle(frequency:Frequency) {
    if(!frequency) return ''

    let title = frequency.name + ' (' + Frequency.typeToString(frequency.type) + ')'
    return title
}

onMounted(() => {
    // console.log('[FrequencyBox]', props)
    iconClass.value = getIcon()
})

</script>

<style scoped>
.frequencyBox {
    border-radius: 5px;
    display: flex;
    flex-flow: column;
    border: 1px solid darkslategrey;
    background-color: white;
    flex: 1 1 0px;
    position: relative
}
.frequencyBox.small {
    height: 42px;
}
.frequencyBox.medium, .frequencyBox.large {
    height: 53px;
}
.freq {
    text-align: right;
}
.freq.small {
    padding: 5px 3px;
    font-size: 16px;
}
.freq.medium {
    line-height: 32px;
    font-size: 20px;
    padding-left: 10px;
    padding-right: 5px;
}
.freq.large{
    font-size: 28px;
    padding-right: 10px;
}
.name {
    text-align: left;
    overflow: hidden;
}

.name.small {
    height: 12px;
    font-size: 10px;
    padding-left: 2px;
}
.name.medium {
    height: 20px;
    padding-left: 5px;
    font-size: 16px;
}
.name.large {
    height: 20px;
    padding-left: 40px;
    font-size: 16px;
}

.freqType {
    position: absolute;
    width: 15px;
    left: 5px;
    bottom: 8px;
    opacity: 0.4;
}
.freqType.large {
    width: 30px;
    height: 30px;
}
.ctaf {
    color: var(--text-ctaf);
}
.navaid {
    color: var(--text-navaid);
}
.tower, .tracon {
    color: var(--text-atc);
}
.weather {
    color: var(--text-weather);
}

</style>