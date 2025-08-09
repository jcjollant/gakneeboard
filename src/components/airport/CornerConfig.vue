<template>
    <div></div>
    <OverlayPanel ref="op">
        <div class="ctList">
            <div class="mockTile">
                <CornerSelectionTile :v-model="activeCorner" />
            </div>
            <Fieldset legend="Standard">
                <div class="standardList">
                    <div v-for="ct in cornerTypes" class="ctItem" >
                        <RadioButton v-model="currentValue" :inputId="ct.key" :value="ct.key" 
                            @change="onChange(ct.key)"/>
                        <label :for="ct.key" class="ml-2">{{ ct.name }}</label>
                    </div>
                </div>
            </Fieldset>
            <Fieldset legend="Airport Frequencies">
                <div class="freqList">
                    <div v-for="(cf) in frequencies" class="ctItem" >
                        <RadioButton v-model="currentValue" :inputId="cf.id" :value="cf.id" 
                            @change="onChange(cf.id)"/>
                        <label :for="cf.id" class="ml-2">{{ cf.label  }}</label>
                    </div>
                </div>
            </Fieldset>
            <Fieldset legend="Navaids Frequency and Bearing">
                <div class="navList">
                    <template v-for="navaid in navaids">
                        <div>{{ navaid.name }}</div>
                        <div>
                            <RadioButton v-model="currentValue" :inputId="navaid.id1" :value="navaid.id1" 
                                @change="onChange(navaid.id1)"/>
                            <label :for="navaid.id1" class="ml-2">{{ navaid.freq  }}</label>
                        </div>
                        <div>
                            <RadioButton v-model="currentValue" :inputId="navaid.id2" :value="navaid.id2" 
                                @change="onChange(navaid.id2)"/>
                            <label :for="navaid.id2" class="ml-2">{{ navaid.radial  }}</label>
                        </div>
                    </template>
                </div>
            </Fieldset>
            <Fieldset :legend="group.name" class="ctAtc" v-for="group in atcGroups">
                <div class="atcList">
                    <div v-for="atc in group.atcs" class="ctItem" >
                        <RadioButton v-model="currentValue" :inputId="atc.id" :value="atc.id" 
                            @change="onChange(atc.id)"/>
                        <label :for="atc.id" class="ml-2">{{ Formatter.frequency(atc.mhz) }} : <span :class="{'atcSmall':atc.label.length > 30}">{{ atc.label }}</span></label>
                    </div>
                </div>
            </Fieldset>
            <div class="ctCustom">
                <RadioButton v-model="currentValue" inputId="custom" :value="'?'+customLabel+'?'+customValue" 
                    @click="onChange('?'+customLabel+'?'+customValue)"/>
                    <label for="custom" class="ml-2">Custom</label>
                <InputGroup class="customGroup ml-2">
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
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { AtcGroup } from '../../model/AtcGroup';
import { Frequency, FrequencyType } from '../../model/Frequency';

import Button from 'primevue/button'
import CornerSelectionTile from './CornerSelectionTile.vue'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OverlayPanel from 'primevue/overlaypanel'
import RadioButton from 'primevue/radiobutton'
import { Airport, Runway } from '../../model/Airport';
import { Formatter } from '../../lib/Formatter';

const cornerTypes = ref([
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
    { name: 'Notes', key: 'notes' },
]);

const activeCorner = ref(0)
const currentValue = ref('weather')
const op = ref()

const props = defineProps({
    event: { type: Object, default: undefined},
    airport: { type: Object, default: undefined},
    runway: { type: Object, required: true},
    corners: { type: Object, default: null},
    index: { type: Number, default: 0}
})

let airport:Airport = new Airport()
let runway:Runway = Runway.noRunway()
const frequencies = ref<CornerValue[]>([])
const navaids = ref<NavaidValue[]>([])
const atcGroups = ref<CornerAtcGroup[]>([])

const customLabel = ref('')
const customValue = ref('')

class CornerAtc {
    id:string;
    label:string;
    value:CornerValue
    mhz:number;
    constructor(atc:Frequency) {
        this.id = '#A' + atc.value;
        this.label = atc.name;
        this.mhz = Number(atc.value);
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

class CornerValue {
    id:string;
    label:string;
    constructor(id:string, label:string) {
        this.id = id;
        this.label = label;
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

watch( props, () => {
    // console.log('[CornerConfig.watch] props', props, op)
    if(props.event) op.value.toggle(props.event)
    loadProps(props)
})

watch( activeCorner, () => {
    console.log('[CornerConfig.watch] selectedIndex', activeCorner.value)
})

function loadProps(props) {
    activeCorner.value = props.index
    currentValue.value = props.corners[props.index]

    // create frequencies list
    if( !props.airport) {
        frequencies.value = []
        airport = Airport.noAirport
        runway = Runway.noRunway()
    } else {
        airport = Airport.copy( props.airport);
        runway = Runway.copy( props.runway)
        if(airport.isValid()) {
            // build a frequency list with '#F' prefix
            const freqList = airport.freq.map( f => new CornerValue('#F' + f.name, Formatter.frequency(f.mhz) + ' : ' + f.name))
            // add a bogus frequency for selected runway

            if( runway && 'freq' in runway) freqList.push( new CornerValue('#Ftwr','Selected Runway'))
            frequencies.value = freqList
        }

        if( airport.navaids) {
            // build a navaid list with '#N' prefix
            const navaidList = airport.navaids.map( n => new NavaidValue(n.id + ' ('+n.type+')', Formatter.frequency(n), '#N'+n.id, '#R'+n.id, Formatter.navaid(n)))
            navaids.value = navaidList
        }

        if( airport.atc) {
            const groupList = AtcGroup.parse(airport)
            atcGroups.value = groupList.map( g => new CornerAtcGroup(g))
        }
    }
}

function onChange(value) {
    console.log('[CornerConfig.onChange]', value)
    // props.corners[props.index] = value
}
</script>

<style scoped>
.atcSmall {
    font-size: 0.9rem;
}
.ctList {
    display: grid;
    grid-template-columns: auto auto;
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
    grid-column: 1 / span 2;
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

</style>