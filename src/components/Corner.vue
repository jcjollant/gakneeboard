<script setup>
import { watch } from 'vue';
import { onMounted,ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel'
import RadioButton from 'primevue/radiobutton'


const emits = defineEmits(['update'])


const label = ref('')
const value = ref('')
const labelUnder = ref('')

const props = defineProps({
    airport: { type: Object, default: null},
    data: { type: Object, default: null},
    runway: { type: Object, default: null},
    flip: { type: Boolean, default: false}
})

let airport = null
let runway = null
let cornerId = -1
const noFrequency = '-.-'
const selectedCornerType = ref('weather')
const cornerTypes = ref([
    { name: 'Weather Frequency', key: 'weather' },
    { name: 'Tower/CTAF Frequency', key: 'twr' },
    { name: 'Ground Frequency', key: 'gnd' },
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
    { name: 'Nothing', key: 'blank' },
]);


function loadProps(newProps) {
    // console.log( 'Corner loadProps ' + JSON.stringify(newProps))
    if( newProps == undefined || newProps.airport == null || newProps.data == null) {
        label.value = '-'
        value.value = '-'
        labelUnder.value = true
    } else {
        airport = newProps.airport;
        runway = newProps.runway
        const field = newProps.data.field
        showField(field)
        labelUnder.value = !newProps.flip
        cornerId = newProps.data.id
        selectedCornerType.value = field
    }
}

function onChange(field) {
    // console.log('onChange ' + JSON.stringify(field))
    showField(field)
    emits('update', {'id':cornerId,'field':field})
}

onMounted(() => {
    loadProps(props)
})

function showField( field) {
    // console.log('showField ' + field)
    switch( field) {
        case 'weather':
            value.value = airport.weather.freq.toString()
            label.value = airport.weather.type;
            break
        case 'twr':
            if( runway && 'freq' in runway) {
                // console.log('User runway frequency')
                label.value = 'TWR ' + runway.name
                value.value = runway.freq
            } else if( 'ctaf' in airport) {
                value.value = airport.ctaf
                if( airport.twr == 'Y') {
                    label.value = 'TWR/CTAF'
                } else {
                    label.value = 'CTAF'
                }
            } else {
                value.value = noFrequency
            }
            break
        case 'field':
            value.value = Math.round(airport.elev).toString()
            label.value = 'Elev'
            break
        case 'tpa':
            value.value = Math.round(airport.elev + 1000).toString()
            label.value = 'TPA'
            break
        case 'gnd':
            if( 'gnd' in airport && airport.gnd != null) {
                value.value = airport.gnd
            } else {
                value.value = noFrequency
            }
            label.value = 'GND'
            break;
        case 'rwyinfo':
            value.value = runway.length + 'x' + runway.width
            label.value = runway.surface.condition + '/' + runway.surface.type
            break;
        case 'blank':
            value.value = '.'
            label.value = ''
            break;
        default:
            value.value = '?'
            label.value = '?'
    }
}

const op = ref()
function toggleSelection(event) {
    // console.log( 'Toggle Overlay')
    op.value.toggle(event)
}

watch( props, () => {
    loadProps(props)
})

</script>

<template>
    <div>
        <div @click="toggleSelection" class="clickable" :class="{faded: value=='.'}">
            <div v-if="labelUnder">
                <div>{{value}}</div>
                <div class="label">{{label}}</div>
            </div>
            <div v-else>
                <div class="label">{{label}}</div>
                <div>{{value}}</div>
            </div>
        </div>
        <OverlayPanel ref="op">
            <div class="ctList">
                <div v-for="ct in cornerTypes" class="ctItem" >
                    <RadioButton v-model="selectedCornerType" :inputId="ct.key" :value="ct.key" @change="onChange(ct.key)"/>
                    <label :for="ct.key" class="ml-2">{{ ct.name }}</label>
                </div>
            </div>
        </OverlayPanel>
    </div>
</template>

<style scoped>
    .label {
        padding: 0;
        font-size:9px;
    }

    .ctList {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .ctItem {
        display: flex;
        align-items: center;
    }
    .faded {
        opacity: 0.3;
    }

</style>