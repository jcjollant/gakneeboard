<template>
    <Dialog modal header="Enter Your Airports" :style="{ width: '17.5rem' }">
        <div class="flight-dialog">
            <AirportInput :code="fromCode" v-model="fromAirport" label="From" @invalid="onFromInvalid" />
            <AirportInput :code="toCode" v-model="toAirport" label="To" @invalid="onToInvalid" />
            <AirportInput :code="alternateCode" v-model="alternateAirport" label="Alter." @invalid="onAlternateInvalid" />
            <div class="dialog-actions">
                <Button label="Cancel" @click="onCancel" link />
                <Button label="Confirm" @click="onConfirm" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AirportInput from '../shared/AirportInput.vue'
import { Airport } from '../../model/Airport'
import { LocalStore } from '../../lib/LocalStore'

const emits = defineEmits(['cancel', 'confirm'])

const fromAirport = ref<Airport | undefined>(undefined)
const toAirport = ref<Airport | undefined>(undefined)
const alternateAirport = ref<Airport | undefined>(undefined)
const fromCode = ref('KBFI')
const toCode = ref('KPAE')
const alternateCode = ref('KRNT')

interface FlightInfo {
    from: string
    to: string
    alternate: string
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(LocalStore.flightInfo)
        if (stored) {
            const flightInfo: FlightInfo = JSON.parse(stored)
            fromCode.value = flightInfo.from || 'KBFI'
            toCode.value = flightInfo.to || 'KPAE'
            alternateCode.value = flightInfo.alternate || 'KRNT'
        }
    } catch (e) {
        console.warn('Failed to load flight info from storage:', e)
    }
}

function saveToStorage() {
    // console.debug('[DemoAirportSelection.saveToStorage] ', fromAirport.value?.code, toAirport.value?.code, alternateAirport.value?.code)
    try {
        const flightInfo: FlightInfo = {
            from: fromAirport.value?.code || fromCode.value,
            to: toAirport.value?.code || toCode.value,
            alternate: alternateAirport.value?.code || alternateCode.value
        }
        localStorage.setItem(LocalStore.flightInfo, JSON.stringify(flightInfo))
    } catch (e) {
        console.warn('Failed to save flight info to storage:', e)
    }
}

onMounted(() => {
    loadFromStorage()
})

function onFromInvalid() {
    fromAirport.value = undefined
}

function onToInvalid() {
    toAirport.value = undefined
}

function onAlternateInvalid() {
    alternateAirport.value = undefined
}

function onCancel() {
    emits('cancel')
}

function onConfirm() {
    saveToStorage()
    emits('confirm', {
        from: fromAirport.value,
        to: toAirport.value,
        alternate: alternateAirport.value
    })
}
</script>

<style scoped>
.flight-dialog {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}
</style>