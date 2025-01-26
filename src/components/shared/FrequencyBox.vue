<template>
    <div class="frequencyBox" :class="small?'fbSmall':'fbMedium'">
        <div class="name" :class="small?'nameSmall':'nameMedium'">{{freq.name}}</div>
        <div :class="small?'freqSmall':'freqMedium'">{{ Formatter.frequency(freq.mhz) }}</div>
    </div>
</template>

<script setup lang="ts">

import { Formatter } from '../../lib/Formatter'
import { Frequency } from '../../model/Frequency';

const props = defineProps({
    freq: { type: Frequency, default: null},
    small: { type: Boolean, default: false},
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
}
.fbSmall {
    height: 42px;
}
.fbMedium {
    height: 53px;
}
.freqSmall {
    padding: 5px;
    font-size: 14px;
}
.freqMedium {
    line-height: 34px;
    font-size: 20px;
}
.name {
    text-align: left;
    overflow: hidden;
    /* border:1px solid red; */
}

.nameSmall {
    height: 10px;
    font-size: 10px;
    padding-left: 2px;
}
.nameMedium {
    height: 16px;
    padding-left: 5px;
    font-size: 16px;
}
</style>