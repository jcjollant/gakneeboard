<script setup>
import { ref } from 'vue'
import Header from '../Header.vue'
import FuelGauge from './FuelGauge.vue';
// import NoSettings from '../NoSettings.vue';

const emits = defineEmits(['replace'])

const editMode = ref(false)

function onHeaderClick() {
    editMode.value = !editMode.value;
}

</script>

<template>
    <div class="widget">
        <Header title="Fuel Bug" :replace="editMode" 
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <!-- <NoSettings v-if="editMode" /> -->
        <div v-if="editMode">
        </div>
        <div v-else class="fuelGrid">
            <div class="bb br"></div>
            <div class="bb bl right"></div>
            <div class="bb br"></div>
            <div class="bb bl right"></div>
            <div class="bb br"></div>
            <div class="bb bl right"></div>
            <div class="br"></div>
            <div class="bl right"></div>
            <FuelGauge class="gauge" />
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
.right {
    grid-column: 3;
}
.gauge {
    grid-column: 2;
    grid-row: 1 / span 4;
}
</style>