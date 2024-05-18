<script setup>
import { ref } from 'vue'
import Header from '../Header.vue'
import FuelGauge from './FuelGauge.vue';
import FuelEdit from './FuelEdit.vue';
import { onMounted } from 'vue';
import { watch } from 'vue';
// import NoSettings from '../NoSettings.vue';

const emits = defineEmits(['replace','update'])
const props = defineProps({
    params: { type: Object, default: null},
})


onMounted( () => {
    loadData(props.params)
})

watch( props, async () => {
    loadData(props.params)
})

function loadData(params) {
    // console.log('FuelBug loadData ' + JSON.stringify(params))
    if( 'usable' in params) {
        usable.value = params.usable;
    } else {
        usable.value = 53;
    }
    if('fuelFlow' in params) {
        fuelFlow.value = params.fuelFlow
    } else {
        fuelFlow.value = 9
    }
    if('reserve' in params) {
        reserve.value = params.reserve
    } else {
        reserve.value = 1
    }
}

const editMode = ref(false)
const usable = ref(53)
const fuelFlow = ref(9)
const reserve = ref(1)

function onHeaderClick() {
    editMode.value = !editMode.value;
    // console.log( 'FuelBug onHeaderClick ' + editMode.value)
}

function onSettingsUpdate(newUsable, newFuelFlow, newReserve) {
    editMode.value = false
    usable.value = newUsable
    fuelFlow.value = newFuelFlow
    reserve.value = newReserve
    const data = {usable:newUsable,fuelFlow:newFuelFlow,reserve:newReserve}
    emits('update',data)
}

</script>

<template>
    <div class="widget">
        <Header title="Fuel Bug" :replace="editMode" 
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <!-- <NoSettings v-if="editMode" /> -->
        <FuelEdit v-if="editMode" :usable="usable" :fuelFlow="fuelFlow" :reserve="reserve"
            @close="onHeaderClick" @update="onSettingsUpdate"/>
        <div v-else class="fuelGrid">
            <div class="bb left"><div class="dot"></div></div>
            <div class="bb right"><div class="dot"></div></div>
            <div class="bb left"><div class="dot"></div></div>
            <div class="bb right"><div class="dot"></div></div>
            <div class="bb left"><div class="dot"></div></div>
            <div class="bb right"><div class="dot"></div></div>
            <div class="left"><div class="dot"></div></div>
            <div class="right"><div class="dot"></div></div>
            <FuelGauge class="gauge" :usable="usable" :fuelFlow="fuelFlow" :reserve="reserve" />
        </div>
    </div>
</template>

<style scoped>
.fuelGrid{
    display:grid;
    grid-template-columns: 70px 99px 70px;
    grid-template-rows: 50px 50px 50px 50px;
    /* grid-template-rows: auto auto auto auto; */
    /* height: 196px; */
}
.left {
    position: relative;
    border-right: 1px dashed darkgrey;
}
.right {
    grid-column: 3;
    position: relative;
    border-left: 1px dashed darkgrey;
}
.gauge {
    grid-column: 2;
    grid-row: 1 / span 4;
}
.right .dot {
    left: -4px;
}
.dot {
    position: absolute;
    display: none;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #666666;
    right: -5px;
    top: 20px;
}
</style>