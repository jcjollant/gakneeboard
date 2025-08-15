<template>
    <div class="tile">
        <Header title="Fuel Bug" :showReplace="editMode" :displayMode="false"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <FuelEdit v-if="editMode" :usable="usable" :fuelFlow="fuelFlow" :reserve="reserve"
            @close="onHeaderClick" @update="onSettingsUpdate"/>
        <div v-else class="fuelGrid">
            <div class="bb left">1</div>
            <div class="bb right">2</div>
            <div class="bb left">3</div>
            <div class="bb right">4</div>
            <div class="bb left">5</div>
            <div class="bb right">6</div>
            <div class="left">7</div>
            <div class="right">8</div>
            <FuelGauge class="gauge" :usable="usable" :fuelFlow="fuelFlow" :reserve="reserve" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../shared/Header.vue'
import FuelGauge from './FuelGauge.vue';
import FuelEdit from './FuelEdit.vue';
import { onMounted } from 'vue';
import { watch } from 'vue';
import { TileData } from '../../model/TileData';
import { TileType } from '../../model/TileType';

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
    if( params && 'usable' in params) {
        usable.value = params.usable;
    } else {
        usable.value = 53;
    }
    if(params && 'fuelFlow' in params) {
        fuelFlow.value = params.fuelFlow
    } else {
        fuelFlow.value = 9
    }
    if(params && 'reserve' in params) {
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
    // console.debug( 'FuelBug onHeaderClick ' + editMode.value)
}

function onSettingsUpdate(newUsable, newFuelFlow, newReserve) {
    editMode.value = false
    usable.value = newUsable
    fuelFlow.value = newFuelFlow
    reserve.value = newReserve
    const data = {usable:newUsable,fuelFlow:newFuelFlow,reserve:newReserve}
    emits('update', new TileData(TileType.fuel, data))
}

</script>

<style scoped>
.fuelGrid{
    display:grid;
    grid-template-columns: 70px 99px 70px;
    grid-template-rows: 60px 60px 60px 59px;
    font-size:2.5rem;
    font-weight: 900;
    color: #eee;
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
</style>