<template>
    <div>
        <div @click="toggleSelection" class="clickable" :class="{faded: value=='.'}">
            <div :class="{'big':displayMode==DisplayMode.big,'small':displayMode!=DisplayMode.big,'flipped':displayMode==DisplayMode.flipped}">
                <div class="label">{{label}}</div>
                <div class="value">{{value}}</div>
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
                        <div v-for="(cf) in frequencies" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="cf.id" :value="cf.id" 
                                @change="onChange(cf.id)"/>
                            <label :for="cf.id" class="ml-2">{{ cf.label  }}</label>
                        </div>
                    </div>
                </Fieldset>
                <Fieldset legend="Navaids">
                    <div class="navList">
                        <template v-for="navaid in navaids">
                            <div>{{ navaid.name }}</div>
                            <div>
                                <RadioButton v-model="selectedCornerType" :inputId="navaid.id1" :value="navaid.id1" 
                                    @change="onChange(navaid.id1)"/>
                                <label :for="navaid.id1" class="ml-2">{{ navaid.freq  }}</label>
                            </div>
                            <div>
                                <RadioButton v-model="selectedCornerType" :inputId="navaid.id2" :value="navaid.id2" 
                                    @change="onChange(navaid.id2)"/>
                                <label :for="navaid.id2" class="ml-2">{{ navaid.radial  }}</label>
                            </div>
                        </template>
                    </div>
                </Fieldset>
                <Fieldset :legend="group.name" class="ctAtc" v-for="group in atcGroups">
                    <div class="atcList">
                        <div v-for="atc in group.atcs" class="ctItem" >
                            <RadioButton v-model="selectedCornerType" :inputId="atc.id" :value="atc.id" 
                                @change="onChange(atc.id)"/>
                            <label :for="atc.id" class="ml-2">{{ Formatter.frequency(atc.mhz) }} : <span :class="{'atcSmall':atc.label.length > 30}">{{ atc.label }}</span></label>
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

<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { getFrequency, getNavaid } from '../../assets/data';
import { AtcGroup } from '../../model/AtcGroup';
import { Formatter } from '../../lib/Formatter';
import { Frequency } from '../../model/Frequency';
import { Airport, Runway } from '../../model/Airport';

import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OverlayPanel from 'primevue/overlaypanel'
import RadioButton from 'primevue/radiobutton'

class CornerValue {
    id:string;
    label:string;
    constructor(id:string, label:string) {
        this.id = id;
        this.label = label;
    }
}

enum DisplayMode {
    small, 
    flipped, 
    big
}

const emits = defineEmits(['update'])

let airport:Airport = new Airport()
const displayMode = ref(DisplayMode.small)
const label = ref('')
let runway:Runway = Runway.noRunway()
const value = ref('')

const props = defineProps({
    airport: { type: Object, default: null},
    data: { type: String, default: null},
    runway: { type: Object, default: null},
    flip: { type: Boolean, default: false},
    big: { type: Boolean, default: false},
})

const selectedCornerType = ref('weather')
const cornerTypes = ref([
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
    { name: 'Nothing', key: 'blank' },
]);
const customLabel = ref('')
const customValue = ref('')

const frequencies = ref<CornerValue[]>([])
const navaids = ref<NavaidValue[]>([])
const atcGroups = ref<CornerAtcGroup[]>([])

class CornerAtc {
    id:string;
    label:string;
    value:CornerValue
    mhz:number;
    constructor(atc:Frequency) {
        this.id = '#A' + atc.mhz;
        this.label = atc.name;
        this.mhz = atc.mhz;
    }
}

class CornerAtcGroup {
    name:string;
    atcs:CornerAtc[];
    constructor(group:AtcGroup) {
        this.name = group.name;
        this.atcs = group.atcs.map( atc => new CornerAtc(atc))
    }
}

class NavaidValue {
    name:string;
    freq:string;
    id1:string;
    id2:string;
    radial:string;
    constructor(name:string, freq:string, id1:string, id2:string, radial:string) {
        this.name = name;
        this.freq = freq;
        this.id1 = id1;
        this.id2 = id2;
        this.radial = radial;
    }
}

onMounted(() => {
    loadProps(props)
})

watch( props, () => {
    // console.log( '[Corner.watch] props changed', JSON.stringify(props))
    loadProps(props)
})

function formatNavaid(navaid) {
    if(!navaid || !navaid.to) return '-'
    return navaid.to.toFixed(0) + '°'
}

function loadProps(newProps:any) {
    // console.log( '[Corner.loadProps]', JSON.stringify(newProps))
    if(newProps == undefined) {
        displayMode.value = DisplayMode.small
        unknownValues()
        return
    } 
    
    // calculate frequencies
    if( newProps.airport == null) {
        frequencies.value = []
    } else {
        airport = Airport.copy( newProps.airport);
        runway = Runway.copy(newProps.runway)
        if(airport.isValid()) {
            // build a frequency list with '#F' prefix
            const freqList = airport.freq.map( f => new CornerValue('#F' + f.name, Formatter.frequency(f.mhz) + ' : ' + f.name))
            // add a bogus frequency for selected runway

            if( runway && 'freq' in runway) freqList.push( new CornerValue('#Ftwr','Selected Runway'))
            frequencies.value = freqList
        }

        if( airport.navaids) {
            // build a navaid list with '#N' prefix
            const navaidList = airport.navaids.map( n => new NavaidValue(n.id + ' ('+n.type+')', Formatter.frequency(n), '#N'+n.id, '#R'+n.id, formatNavaid(n)))
            navaids.value = navaidList
        }

        if( airport.atc) {
            const groupList = AtcGroup.parse(airport)
            atcGroups.value = groupList.map( g => new CornerAtcGroup(g))
        }
    }

    // display values
    if( newProps.data == undefined || newProps.airport == null) {
        // console.log('[Corner.loadProps] no data')
        unknownValues()
    } else {
        showField(newProps.data)
        selectedCornerType.value = newProps.data
    }


    // console.log( '[Corner.loadProps] big', newProps.big)
    if(newProps.big) {
        displayMode.value = DisplayMode.big
    } else if(newProps.flip) {
        displayMode.value = DisplayMode.flipped
    } else {
        displayMode.value = DisplayMode.small
    }
}

function onChange(field:string) {
    console.log('[Corner.onChange] ' + JSON.stringify(field))
    showField(field)
    emits('update', field)
}


// turn the selection into the actual field
// @return true if the field is a frequency
function showField( field:string) {
    // console.log('[Corner.showField]', field, typeof field)
    if( field.length > 2 && field[0] == '#') { 
        // Special fields start with # then one letter code
        // #F -> Frequency
        // #N -> Navaid
        // #R -> Radial
        // #A -> ATC
        if(field[1] == 'F' && airport.freq) {
            // RadioFrequencies use the '#F' prefix
            const freqName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = Formatter.frequency( getFrequency( airport.freq, freqName))
            label.value = freqName
        } else if( field[1] == 'N' && airport.navaids) {
            // Navaids use the '#N' prefix
            const navaidName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = Formatter.frequency( getNavaid( airport.navaids, navaidName))
            label.value = navaidName
        } else if( field[1] == 'R' && airport.navaids) {
            // Navaid Radial use the '#R' prefix
            const navaidName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = formatNavaid( getNavaid( airport.navaids, navaidName))
            label.value = navaidName + ' Radial'
        } else if( field[1] == 'A' && airport.atc) {
            // ATC use the '#A' prefix
            const freq = Number(field.substring(2))
            value.value = freq.toFixed(3)
            const atc = airport.atc.find( a => a.mhz == freq)
            label.value = atc ? atc.name : '?' 
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
                const weather =  airport.getFreqWeather()
                // console.log('[Corner.showField]', weather)
                label.value = weather ? weather.name : ''
                value.value = weather ? Formatter.frequency(weather.mhz) : '?'
                break
            case 'twr':
                if( runway.freq > 0) {
                    // console.log('[Corner.showField]', JSON.stringify(runway.freq))
                    value.value = runway.freq.toFixed(3)
                    label.value = 'RWY ' + runway.name
                } else {
                    // assign mhz or '-' if the frequency is undefined
                    let freq = airport.getFreqTower()
                    if( freq) {
                        label.value = 'TWR'
                    } else {
                        freq = airport.getFreqCtaf()
                        label.value = 'CTAF'
                    }
                    value.value = Formatter.frequency(freq)
                }
                break
            case 'field':
                value.value = Math.round(airport.elev).toString()
                label.value = 'Elevation';
                break
            case 'tpa':
                const tpa = airport.tpa ? airport.tpa : airport.elev + 1000;
                value.value = Math.round(tpa).toString()
                label.value = 'TPA'
                break
            case 'gnd':
                const ground =  airport.getFreqGround()
                value.value = Formatter.frequency(ground)
                label.value = 'GND'
                break;
            case 'rwyinfo':
                value.value = runway.length + 'x' + runway.width
                label.value = runway.surface ? (runway.surface.cond + '/' + runway.surface.type) : '?'
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
    // console.log( '[Corner.toggleSelection]', event)
    op.value.toggle(event)
}

function unknownValues() {
    label.value = '-'
    value.value = '-'
}

</script>

<style scoped>
.label {
    padding: 0;
    width:110px;
    overflow: hidden;
}
.small .label {
    font-size:9px;
    height: 10px;
}
.big .label {
    font-size:15px;
    height: 17px;
    text-align: left;
}
.big .value {
    font-size: 20px;
    text-align: right;
}
.atcSmall {
    font-size: 0.9rem;
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
.ctItemNavaid {
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 5px;
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
.freqList, .standardList, .atcList {
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
.flipped {
    display: flex;
    flex-flow: column-reverse;
}
.big {
    border-radius: 5px;
    padding: 5px;
    border: 1px solid black;
    width: 120px;
    height: 53px;
    background-color: white;
}

.navList {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    width: fit-content;
}
</style>