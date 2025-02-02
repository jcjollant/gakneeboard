<script setup>
import { ref, onMounted, watch } from 'vue';

import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OverlayPanel from 'primevue/overlaypanel'
import RadioButton from 'primevue/radiobutton'
import { getFreqCtaf, getFreqWeather, getFreqGround, getFrequency, getNavaid } from '../../assets/data';
import { formatFrequency, formatAtcGroups } from '@/assets/format'


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
const selectedCornerType = ref('weather')
const cornerTypes = ref([
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
    { name: 'Nothing', key: 'blank' },
]);
const customLabel = ref('')
const customValue = ref('')

const frequencies = ref([])
const navaids = ref([])
const atcGroups = ref([])

function formatNavaid(navaid) {
    if(!navaid || !navaid.to) return '-'
    return navaid.to.toFixed(0) + '°'
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
        if(airport.freq) {
            // build a frequency list with '#F' prefix
            const freqList = airport.freq.map( f => {
                return { id:'#F'+f.name, label: formatFrequency(f) + ' : ' + f.name}
            })
            if( runway && 'freq' in runway) freqList.push({id:'twr',label:'Selected Runway'})
            frequencies.value = freqList
        }

        if( airport.navaids) {
            // build a navaid list with '#N' prefix
            const navaidList = airport.navaids.map( n => {
                // console.log('[Corner.loadProps]', JSON.stringify(n))
                return { id: '#N'+n.id, label: formatFrequency(n) + ' : ' + n.id + ' ('+n.type+')'}
            })
            navaids.value = navaidList
        }

        if( airport.atc) {
            const groupList = formatAtcGroups(airport, (e) => {
                e['id']='#A'+e.mhz
                e['label'] = e.use
            })
            atcGroups.value = groupList
        }

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
    if( field.length > 2 && field[0] == '#') { 
        if(field[1] == 'F' && airport.freq) {
            // RadioFrequencies use the '#F' prefix
            const freqName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = formatFrequency( getFrequency( airport.freq, freqName))
            label.value = freqName
        } else if( field[1] == 'N' && airport.navaids) {
            // Navaids use the '#N' prefix
            const navaidName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = formatNavaid( getNavaid( airport.navaids, navaidName))
            label.value = navaidName + ' Radial'
        } else if( field[1] == 'A' && airport.atc) {
            // ATC use the '#A' prefix
            const freq = Number(field.substring(2))
            value.value = freq.toFixed(3)
            label.value = airport.atc.find( a => a.mhz == freq).name
        } else {
            unknownValues()
        }
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
                const tpa = airport.tpa ? airport.tpa : airport.elev + 1000;
                value.value = Math.round(tpa).toString()
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
                <Fieldset legend="Standard">
                    <div class="standardList">
                        <div v-for="ct in cornerTypes" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="ct.key" :value="ct.key" 
                                @change="onChange(ct.key)"/>
                            <label :for="ct.key" class="ml-2">{{ ct.name }}</label>
                        </div>
                    </div>
                </Fieldset>
                <Fieldset legend="Airport Frequencies">
                    <div class="freqList">
                        <div v-for="freq in frequencies" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="freq.id" :value="freq.id" 
                                @change="onChange(freq.id)"/>
                            <label :for="freq.id" class="ml-2">{{ freq.label  }}</label>
                        </div>
                    </div>
                </Fieldset>
                <Fieldset legend="Navaids">
                    <div class="navList">
                        <div v-for="navaid in navaids" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="navaid.id" :value="navaid.id" 
                                @change="onChange(navaid.id)"/>
                            <label :for="navaid.id" class="ml-2">{{ navaid.label  }}</label>
                        </div>
                    </div>
                </Fieldset>
                <Fieldset :legend="group.name" class="ctAtc" v-for="group in atcGroups">
                    <div class="atcList">
                        <div v-for="atc in group.atcs" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="atc.id" :value="atc.id" 
                                @change="onChange(atc.id)"/>
                            <label :for="atc.id" class="ml-2">{{ formatFrequency(atc) }} : <span :class="{'atcSmall':atc.label.length > 30}">{{ atc.label  }}</span></label>
                        </div>
                    </div>
                </Fieldset>
                <div class="ctCustom">
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
                <div class="doneBtn">
                    <Button label="Done" @click="op.hide()"></Button>
                </div>
            </div>
        </OverlayPanel>
    </div>
</template>

<style scoped>
    .atcSmall {
        font-size: 0.9rem;
    }
    .label {
        padding: 0;
        font-size:9px;
        width:120px;
        height: 10px;
        overflow: hidden;
    }

    .ctList {
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 1rem;
    }
    .ctItem {
        display: flex;
        align-items: center;
    }
    .ctAtc {
        grid-column: 1 / span 3;
    }
    .ctCustom {
        display: flex;
        align-items: center;
        grid-column: 1 / span 2;
    }
    .customGroup {
      width: 12rem;
    }   
.doneBtn{
    text-align: right;
}
    .faded {
        opacity: 0.3;
    }
    .freqList, .navList, .standardList, .atcList {
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