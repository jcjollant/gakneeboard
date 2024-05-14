<script setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({
    radio: { type: Object, default: null},
})

const targetRoot = ref('')
const isOne = ref(true)
const isTwo = ref(false)
const frequency = ref('-.-')
const name = ref('-')

function loadData( radio) {
    targetRoot.value = radio.target.substring(0,3)
    isOne.value = (radio.target.substring(3,4) === '1')
    isTwo.value = (radio.target.substring(3,4) === '2')
    frequency.value = radio.freq;
    name.value = radio.name;
    // console.log( isPrimary.value)
}

onMounted(() => {   
    // console.log('Airport mounted with ' + JSON.stringify(props.radio))
    loadData(props.radio)
})    

watch( props, async() => {
    loadData(props.radio)
})

</script>

<template>
    <div class="container">
        <div class="targetBox">
            <div class="targetName">{{ targetRoot }}</div>
            <div class="targetOne" :class="{targetActive: isOne}">1</div>
            <div class="targetTwo" :class="{targetActive: isTwo}">2</div>
        </div>
        <div class="freq" v-show="frequency!='-.-'">{{ frequency }}</div>
        <div class="name" v-show="name!='-'">{{ name }}</div>
    </div>
</template>

<style scoped>
.container {
    position: relative;
    /* border-bottom: 1px dashed darkgrey; */
}
.targetBox {
    line-height: 1;
    position: absolute;
    top: 2px;
    left: 8px;
    display: grid;
    gap: 2px;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
}
.targetName {
    grid-row: 1 / span 2;
    font-size: 12px;
    font-weight: 800;
    writing-mode: vertical-rl;
    text-orientation: upright;
}
.targetOne {
    grid-row: 1;
    grid-column: 2;
    font-size: 18px;
    opacity: 0.1;
}
.targetTwo {
    grid-column: 2;
    grid-row: 2;
    font-size: 18px;
    opacity: 0.1;
}
.targetActive {
    font-size: 20px;
    opacity: 1;
}
.freq {
    position: absolute;
    font-size: 18px;
    top: 1px;
    right: 5px;
}
.name {
    position: absolute;
    font-size: 9px;
    bottom: 5px;
    right: 5px;
}
</style>