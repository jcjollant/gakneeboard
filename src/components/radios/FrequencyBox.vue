<script setup>
import { formatMhz } from '../../assets/data'
const props = defineProps({
    freq: { type: Object, default: null},
    small: { type: Boolean, default: false},
})

</script>

<template>
    <div class="frequencyBox" :class="small?'fbSmall':'fbMedium'">
        <div :class="small?'freqSmall':'freqMedium'">{{ formatMhz( freq.mhz) }}</div>
        <div class="name" :class="small?'nameSmall':'nameMedium'">{{freq.name}}</div>
    </div>
</template>

<style scoped>
.frequencyBox {
    border-radius: 5px;
    display: flex;
    flex-flow: column;
    gap: 0;
    border: 2px solid darkcyan;
    color: darkcyan;
    /* border: 2px solid darkgreen;
    color: darkgreen; */
    padding: 4px 2px;
}
.fbSmall {
    height: 2.1rem;
    width: 4.5rem;
    font-size: 0.9rem;
}
.fbMedium {
    height: 2.7rem;
    width: 7rem;
    font-size: 1.4rem;
}
.freqSmall {
    line-height: 0.8rem;
}
.freqMedium {
    line-height: 1.1rem;
}
.name {
    text-align: right;
}

.nameSmall {
    font-size: 0.5rem;
}
.nameMedium {
    font-size: 0.8rem;
}
</style>