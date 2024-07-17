<script setup>
import { ref, onMounted, watch } from 'vue';
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OverlayPanel from 'primevue/overlaypanel'
import RadioButton from 'primevue/radiobutton'
import { getFreqCtaf, getFreqWeather, getFreqGround, getFrequency } from '../../assets/data';


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
    // { name: 'Weather Frequency', key: 'weather' },
    // { name: 'Tower/CTAF Frequency', key: 'twr' },
    // { name: 'Ground Frequency', key: 'gnd' },
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
    { name: 'Nothing', key: 'blank' },
]);
const customLabel = ref('')
const customValue = ref('')

const frequencies = ref([])

function formatFrequency(freq) {
    // console.log('[Corner.formatFrequency]', typeof freq)
    if( !freq || !freq.mhz) return noFrequency
    return freq.mhz.toFixed(3)
}

function loadProps(newProps) {
    // console.log( '[Corner.loadProps]', JSON.stringify(newProps))
    if( newProps == undefined || newProps.airport == null || newProps.data == null) {
        unknownValues()
        labelUnder.value = true
        frequencies.value = []
    } else {
        airport = newProps.airport;
        runway = newProps.runway
        const field = newProps.data.field
        const freqList = airport.freq.map( f => {
            return { id:'#'+f.name,label:f.name+' : '+formatFrequency(f)}
        })
        if( runway && 'freq' in runway) freqList.push({id:'twr',label:'Selected Runway'})
        frequencies.value = freqList
        showField(field)
        labelUnder.value = !newProps.flip
        cornerId = newProps.data.id
        selectedCornerType.value = field
    }
}

function onChange(field) {
    // console.log('[Corner.onChange] ' + JSON.stringify(field))
    showField(field)
    emits('update', {'id':cornerId,'field':field})
}

onMounted(() => {
    loadProps(props)
})

function showField( field) {
    // console.log('[Corner.showField]', field, typeof field)
    if( field.length > 0 && field[0] == '#' && airport.freq) {
        const freqName = field.substring(1)
        // console.log('[Corner.showField]', freqName)
        value.value = formatFrequency( getFrequency( airport.freq, freqName))
        label.value = freqName
        // console.log('[Corner.showField]', label.value)
    } else if( field.length > 0 && field[0] == '?') {
        // custom labels '?' as marker and separator
        // Field should look like '?label?value'
        const tokens = field.split('?')
        if(tokens.length < 3) {
            unknownValues()
        } else {
            label.value = tokens[1]
            value.value = tokens[2]
            customLabel.value = label.value
            customValue.value = value.value
        }
    } else {
        switch( field) {
            case 'weather':
                const weather = getFreqWeather(airport.freq)
                label.value = weather?.name
                value.value = formatFrequency(weather)
                break
            case 'twr':
                if( runway && 'freq' in runway) {
                    // console.log('[Corner.showField]', JSON.stringify(runway.freq))
                    value.value = runway.freq.toFixed(3)
                    label.value = 'RWY ' + runway.name
                } else {
                    // assign mhz or '-' if the frequency is undefined
                    let freq = getFrequency(airport.freq, 'TWR')
                    if( freq) {
                        label.value = 'TWR'
                    } else {
                        freq = getFreqCtaf(airport.freq)
                        label.value = 'CTAF'
                    }
                    value.value = formatFrequency(freq)
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
                const ground = getFreqGround(airport.freq)
                value.value = ground ? ground.mhz : '-'
                label.value = 'GND'
                break;
            case 'rwyinfo':
                value.value = runway.length + 'x' + runway.width
                label.value = runway.surface.cond + '/' + runway.surface.type
                break;
            case 'blank':
                value.value = '.'
                label.value = ''
                break;
            default:
                unknownValues()
        }
    }
}

const op = ref()
function toggleSelection(event) {
    // console.log( 'Toggle Overlay')
    op.value.toggle(event)
}

function unknownValues() {
    label.value = '-'
    value.value = '-'
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
                <Fieldset legend="Frequencies">
                    <div class="freqList">
                        <div v-for="freq in frequencies" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="freq.id" :value="freq.id" 
                                @change="onChange(freq.id)"/>
                            <label :for="freq.id" class="ml-2">{{ freq.label  }}</label>
                        </div>
                        <!-- <div v-for="(freq,index) in airport.freq" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="'#'+freq.name" :value="'#'+freq.name" 
                                @change="onChange('#'+freq.name)"/>
                            <label :for="'#'+freq.name" class="ml-2">{{ freq.name + " : " + formatFrequency(freq) }}</label>
                        </div> -->
                    </div>
                </Fieldset>
                <div class="ctItem">
                    <RadioButton v-model="selectedCornerType" inputId="custom" :value="'?'+customLabel+'?'+customValue" 
                        @click="onChange('?'+customLabel+'?'+customValue)"/>
                        <label for="custom" class="ml-2">Custom</label>
                    <InputGroup class="customGroup ml-2">
                        <!-- <InputGroupAddon>Custom</InputGroupAddon> -->
                        <InputText placeholder="label" v-model="customLabel"></InputText>
                        <InputGroupAddon>:</InputGroupAddon>
                        <InputText placeholder="value" v-model="customValue"></InputText>
                    </InputGroup>
                </div>
                <div v-for="ct in cornerTypes" class="ctItem" >
                    <RadioButton v-model="selectedCornerType" :inputId="ct.key" :value="ct.key" 
                        @change="onChange(ct.key)"/>
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
    .customGroup {
      width: 12rem;
}

    .faded {
        opacity: 0.3;
    }
    .freqList {
        display: flex;
        flex-flow: column;
        gap: 0.5rem
    }
    :deep(.p-fieldset-legend) {
        border: none;
        background: none;
    }
    :deep(.p-fieldset-content) {
        padding: 0;
    }
    :deep(.p-input-group-addon) {
        padding: 0;
        min-width: 0;
    }

</style>