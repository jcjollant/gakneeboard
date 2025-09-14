<template>
    <AirportSelectionDialog v-model:visible="showSelection" @valid="onValidCode"/>
    <div class="stripContent radio">
        <div class="top">AIRPORT</div>
        <div class="top">ATIS</div>
        <div class="top">GROUND</div>
        <div class="top">CLEARANCE</div>
        <div class="top">TOWER</div>
        <div class="top">FLTPL</div>
        <Button v-if="edit" :label="airport ? airport.code : 'Pick'" @click="onPick" class="btnPick" />
        <div v-else-if="airport" class="frequency">{{ airport.code }}</div>
        <div v-else class="stripBox"></div>
        <div v-if="airport" class="frequency">{{ freqWeather }}</div>
        <div v-else class="stripBox"></div>
        <div v-if="airport" class="frequency">{{ freqGround }}</div>
        <div v-else class="stripBox"></div>
        <div v-if="airport" class="frequency">{{ freqClearance }}</div>
        <div v-else class="stripBox"></div>
        <div v-if="airport" class="frequency">{{ freqTower }}</div>
        <div v-else class="stripBox"></div>
        <div class="checkBox"></div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import StripActions from '../strips/StripActions.vue';
import Button from 'primevue/button'
import { Airport } from '../../model/Airport';
import { getAirport } from '../../assets/data';
import { Formatter } from '../../lib/Formatter';
import AirportSelectionDialog from '../airport/AirportSelectionDialog.vue';

const airport = ref<Airport|undefined>(undefined)
const emits=defineEmits(['action','update'])
const edit = ref(false)
const freqWeather = ref('')
const freqGround = ref('')
const freqClearance = ref('')
const freqTower = ref('')
const props = defineProps({
    edit: { type: Boolean, required: false, default: false },
    data: { type: Object, required: false, default: null }
})
const showSelection = ref(false)

onMounted(() => {
    edit.value = props.edit
    if(props.data && props.data.code && props.data.code.length > 0) {
        loadAirport(props.data.code)
    }
})

watch(props, () => {
    edit.value = props.edit
})

function applyAirport(a: Airport) {
    // console.debug('[RadioStrip.onPick] airport', airpt)
    freqWeather.value = Formatter.frequency( a.getFreqWeather())
    const fg = a.getFreqGround()
    // console.debug('[RadioStrip.onPick] freqGround', fg)
    freqGround.value = Formatter.frequency( fg)
    freqClearance.value = Formatter.frequency( a.getFreqClearance())
    freqTower.value = Formatter.frequency( a.getFreqTowerIfr())
    airport.value = a
}

function loadAirport(code: string) {
    // console.debug('[RadioStrip.loadAirport] code', code)
    getAirport(code).then(a => { 
        const airpt = Airport.copy(a)
        applyAirport(airpt)
    })
}

function onPick() {
    showSelection.value = true
}

function onValidCode(a: Airport) {
    showSelection.value = false
    applyAirport(a)
    emits('update',{code: a.code})
}

</script>

<style scoped>
.checkBox {
  border: 1px solid #ccc;
  border-radius: 5px;
  background: white;
  margin: 8px 5px;
}
.radio {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 3fr 3fr 3fr 3fr 2rem;
    grid-template-rows: 1rem 40px;
    width: 100%;
    border-right: none;
    font-size: 11px;
    gap: 2px;
} 
.top {
    text-align: center;
    line-height: 1rem;
}
.frequency {
    text-align: center;
    font-size: 20px;
    line-height: 40px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
}
.btnPick {
    padding: 8px 0;
}
</style>