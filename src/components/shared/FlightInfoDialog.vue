<template>
    <Dialog modal header="Flight Information" :style="{ width: '17.5rem' }">
        <div class="flight-dialog">
            <AirportInput :code="fromCode" label="From" @valid="onFromValid" @invalid="onFromInvalid" />
            <AirportInput :code="toCode" label="To" @valid="onToValid" @invalid="onToInvalid" />
            <AirportInput :code="alternateCode" label="Alter." @valid="onAlternateValid" @invalid="onAlternateInvalid" />
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
import AirportInput from './AirportInput.vue'
import { Airport } from '../../model/Airport'
import { LocalStore } from '../../lib/LocalStore'

const emits = defineEmits(['cancel', 'confirm'])

const fromAirport = ref<Airport | null>(null)
const toAirport = ref<Airport | null>(null)
const alternateAirport = ref<Airport | null>(null)
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
            
            // Fetch airport data if codes are present
            if (flightInfo.from) {
                try {
                    fromAirport.value = LocalStore.airportGet(flightInfo.from)
                } catch (e) {
                    // Airport not in local store, will be fetched by AirportInput
                }
            }
            if (flightInfo.to) {
                try {
                    toAirport.value = LocalStore.airportGet(flightInfo.to)
                } catch (e) {
                    // Airport not in local store, will be fetched by AirportInput
                }
            }
            if (flightInfo.alternate) {
                try {
                    alternateAirport.value = LocalStore.airportGet(flightInfo.alternate)
                } catch (e) {
                    // Airport not in local store, will be fetched by AirportInput
                }
            }
        }
    } catch (e) {
        console.warn('Failed to load flight info from storage:', e)
    }
}

function saveToStorage() {
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

function onFromValid(airport: Airport) {
    fromAirport.value = airport
}

function onFromInvalid() {
    fromAirport.value = null
}

function onToValid(airport: Airport) {
    toAirport.value = airport
}

function onToInvalid() {
    toAirport.value = null
}

function onAlternateValid(airport: Airport) {
    alternateAirport.value = airport
}

function onAlternateInvalid() {
    alternateAirport.value = null
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