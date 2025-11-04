<template>
    <div class="frequencyBox" :class="[size, {inverted: inverted}, getClass(freq)]" :title="getTitle(freq)">
        <div class="name" :class="[size]">{{freq.name}}</div>
        <div class="freq" :class="[size,getClass(freq)]">
            <font-awesome-icon v-if="size!='small' && iconClass.length" :icon="iconClass" class="freqType" :class="[size]"/>
            <div>{{ freq.value }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { Frequency, FrequencyType } from '../../model/Frequency';

const iconClass = ref<string[]>([])

const props = defineProps({
    freq: { type: Frequency, default: null},
    size: { type: String, default: 'small'},
    inverted: { type: Boolean, default: false},
})

function getClass(frequency:Frequency) {
    // console.log("[FrequencyBox.getClass]", frequency)
    if(!frequency || frequency.value == '') return 'blank'
    let css = ''
    switch(frequency.type) {
        case FrequencyType.ctaf: css = 'ctaf'; break;
        case FrequencyType.navaid: css = 'navaid'; break;
        case FrequencyType.tower: css = 'tower'; break;
        case FrequencyType.clearance: 
        case FrequencyType.tracon:  css = 'tracon'; break;
        case FrequencyType.weather: css = 'weather'; break;
        case FrequencyType.ground: css = 'ground'; break;
        case FrequencyType.phone: css = 'phone'; break;
        default: css = 'plain';
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
        // case FrequencyType.phone: icon = 'phone'; break;
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
    /* justify-content: space-between; */
    padding: 0 3px;
    /* flex: 1 1 0px; */
}
.frequencyBox.small {
    height: fit-content;
    width: 75px;
}
.frequencyBox.medium, .frequencyBox.large {
    height: 53px;
}
.freq {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.freq.phone {
    justify-content: center;
}
.freq.small {
    font-size: 16px;
    line-height: 30px;
}
.freq.medium {
    font-size: 20px;
    line-height: 30px;
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
    font-size: 16px;
}
.name.large {
    height: 20px;
    padding-left: 40px;
    font-size: 16px;
}

.freq.phone.small {
    font-size: 9px;
}
.phone.medium {
    font-size: 14px;
}
.phone.large {
    font-size: 26px;
}

.freqType {
    /* position: absolute; */
    color: darkgrey;
    width: 15px;
    /* opacity: 0.4; */
}
.freqType.large {
    width: 30px;
    height: 30px;
}
.blank {
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

/* Inverted mode styles */
.frequencyBox.inverted {
    color: white;
}

.frequencyBox.inverted.ctaf {
    background-color: var(--text-ctaf);
}

.frequencyBox.inverted.navaid {
    background-color: var(--text-navaid);
}

.frequencyBox.inverted.tower,
.frequencyBox.inverted.tracon {
    background-color: var(--text-atc);
}

.frequencyBox.inverted.weather {
    background-color: var(--text-weather);
}

.frequencyBox.inverted .freqType {
    color: white;
}

.frequencyBox.inverted .freq {
    color: white;
}

.frequencyBox.inverted.ground,
.frequencyBox.inverted.phone,
.frequencyBox.inverted.blank,
.frequencyBox.inverted.plain {
    background-color: black;
}

</style>