<script setup>
import { ref } from 'vue'
// import InputText from 'primevue/inputtext';
// import InputGroup from 'primevue/inputgroup'
// import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { onMounted } from 'vue';

const emits = defineEmits(['close','update'])

const props = defineProps({
    usable: { type: Number, default: 53},
    fuelFlow: { type: Number, default: 9},
    reserve: { type: Number, default: 1},
})

onMounted( () => {
    usable.value = props.usable
    fuelFlow.value = props.fuelFlow
    reserve.value = props.reserve    
})
const usable = ref(53)
const fuelFlow = ref(9)
const reserve = ref(1)
const warnings = ref([])

function onApply() {
    emits('update',usable.value,fuelFlow.value,reserve.value)
}

function sanityCheck() {
    const list = []
    if( usable.value < 10) {
        list.push('Low Usable')
    } else if( usable.value > 100) {
        list.push('High Usable')
    } 
    if( fuelFlow.value < 4) {
        list.push( 'Low Fuel Flow')
    } else if( fuelFlow.value > 20) {
        list.push( 'High Fuel Flow')
    }

    if( reserve.value > usable.value / fuelFlow.value) {
        list.push('Reserve exceeds usable')
    }
    if( reserve.value < 0.5) {
        list.push('Reserve below minimums')
    }
    warnings.value = list
}

</script>

<template>
    <div class="content settings">
        <div class="editItem">Usable Fuel</div>
        <InputNumber v-model="usable" @input="sanityCheck" suffix=" gal" :min="1"></InputNumber>
        <div class="editItem">Fuel Flow</div>
        <InputNumber v-model="fuelFlow" @input="sanityCheck" suffix=" gph" :min="1"></InputNumber>
        <div class="editItem">Reserve</div>
        <InputNumber v-model="reserve" @input="sanityCheck" :suffix="reserve > 1 ? ' hours' : ' hour'" 
            :min="0" :step="0.25" :minFractionDigits="0" :maxFractionDigits="2"></InputNumber>
        <div class="editItem"></div>
        <div class="checks">
            <Button class="warning" v-for="warning in warnings" :label="warning" severity="warning"></Button>
        </div>
        <div class="actionBar">
            <Button label="Cancel" link @click="emits('close')"></Button>
            <Button label="Apply" @click="onApply"  ></Button>
        </div>
    </div>
</template>

<style scoped>
.settings {
    display: grid;
    grid-template-columns: 65px 150px;
    grid-template-rows: 1.5rem 1.5rem 1.5rem auto 2rem;
    gap: 5px;
    padding: 5px;
}
.checks {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    gap: 2px;
    /* grid-column: 1 / span 2; */
}
:deep(.p-component) {
    font-size: 0.8rem;
    height: 1.5rem;
}
:deep(.p-button-warning) { 
    /* padding: 10px; */
    font-size: 0.6rem;
} 
:deep(.p-inputtext) {
    width: 100%;
}
</style>