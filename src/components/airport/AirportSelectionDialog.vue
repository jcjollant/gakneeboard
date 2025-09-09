<template>
    <Dialog header="Select Airport" :style="{ width: '35rem' }">
        <AirportInput code="KBFI" :auto="true" :expanded="true"
            @valid="onValid" @invalid="onInvalid" />
    </Dialog>
</template>
<script setup lang="ts">
import { Airport } from '../../model/Airport';
import AirportInput from '../shared/AirportInput.vue';
import Dialog from 'primevue/dialog';

const emits = defineEmits(['invalid','valid']);

function onInvalid() {
    emits('invalid');
}

function onValid(airport: Airport) {
    emits('valid', airport);
}

</script>