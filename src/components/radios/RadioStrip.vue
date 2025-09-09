<template>
    <div class="stripContent radio">
        <div class="top">AIRPORT</div>
        <div class="top">ATIS</div>
        <div class="top">GROUND</div>
        <div class="top">CLEARANCE</div>
        <div class="top">TOWER</div>
        <div class="top">FLTPL</div>
        <Button v-if="edit" :label="airport ? airport.code : 'Pick'" @click="onPick" />
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

const airport = ref<Airport|undefined>(undefined)
const emits=defineEmits(['action','update'])
const edit = ref(false)
const freqWeather = ref('')
const freqGround = ref('')
const freqClearance = ref('')
const freqTower = ref('')
const props = defineProps({
    edit: { type: Boolean, required: false, default: false },
    code: { type: String, required: false, default: '' }
})

onMounted(() => {
    edit.value = props.edit
    if(props.code && props.code.length > 0) {
        loadAirport(props.code)
    }
})

watch(props, () => {
    edit.value = props.edit
})

function loadAirport(code: string) {
    // console.debug('[RadioStrip.loadAirport] code', code)
    getAirport(code).then(a => { 
        const airpt = Airport.copy(a)
        // console.debug('[RadioStrip.onPick] airport', airpt)
        freqWeather.value = Formatter.frequency( airpt.getFreqWeather())
        const fg = airpt.getFreqGround()
        // console.debug('[RadioStrip.onPick] freqGround', fg)
        freqGround.value = Formatter.frequency( fg)
        freqClearance.value = Formatter.frequency( airpt.getFreqClearance())
        freqTower.value = Formatter.frequency( airpt.getFreqTowerIfr())
        airport.value = airpt
    })
}

function onPick() {
    const airportCode = 'KBFI'
    loadAirport(airportCode)
    emits('update',{code: airportCode})
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
</style>