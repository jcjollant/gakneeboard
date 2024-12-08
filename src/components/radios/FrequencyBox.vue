<script setup>
import { Formatter } from '../../lib/Formatter'

const props = defineProps({
    freq: { type: Object, default: null},
    small: { type: Boolean, default: false},
})

</script>

<template>
    <div class="frequencyBox" :class="small?'fbSmall':'fbMedium'">
        <div :class="small?'freqSmall':'freqMedium'">{{ Formatter.frequency(freq) }}</div>
        <div class="name" :class="small?'nameSmall':'nameMedium'">{{freq.name}}</div>
    </div>
</template>

<style scoped>
.frequencyBox {
    border-radius: 5px;
    display: flex;
    flex-flow: column;
    gap: 0;
    border: 1px solid darkslategrey;
    /* color: darkcyan; */
    padding: 4px 2px;
}
.fbSmall {
    height: 2.1rem;
    width: 4.5rem;
    font-size: 0.9rem;
}
.fbMedium {
    height: 3.3rem;
    width: 7rem;
    font-size: 1.6rem;
}
.freqSmall {
    line-height: 0.8rem;
}
.freqMedium {
    line-height: 1.3rem;
}
.name {
    text-align: right;
    overflow: hidden;
}

.nameSmall {
    font-size: 0.5rem;
}
.nameMedium {
    padding-top: 5px;
    font-size: 1rem;
}
</style>