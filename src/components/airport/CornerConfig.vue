<template>
    <Menu ref="menu" id="corner_config_menu" :model="items" :popup="true" @mousedown.prevent>
        <template #submenuheader="{ item }">
            <span class="text-primary font-bold ">{{ item.label }}</span>
        </template>
    </Menu>
    <Dialog v-model:visible="showCustom" modal header="Custom Corner Value" :style="{ width: '35rem' }">
        <div class="dialog-content">
            <div class="properties">
                <InputGroup class="pageName">
                    <InputGroupAddon>Label</InputGroupAddon>
                    <InputText v-model="customLabel" />
                </InputGroup>
                <InputGroup class="pageDescription">
                    <InputGroupAddon>Value</InputGroupAddon>
                    <InputText v-model="customValue" />
                </InputGroup>
            </div>
            <div class="actionDialog gap-2">
                <Button label="Do Not Apply" @click="showCustom = false" link></Button>
                <Button label="Apply" @click="onCustomValue()"></Button>
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Airport, Runway } from '../../model/Airport';
import { Formatter } from '../../lib/Formatter';

import Button from 'primevue/button';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'

const cornerTypes = ref([
    { name: 'Field Elevation', key: 'field' },
    { name: 'Traffic Pattern Altitude', key: 'tpa' },
    { name: 'Runway Information', key: 'rwyinfo' },
]);

const activeCorner = ref(0)
const menu = ref()
const items = ref(<any[]>[])

const emits = defineEmits(['selection'])

const props = defineProps({
    event: { type: Object, default: undefined },
    airport: { type: Object, default: undefined },
    runway: { type: Object, required: true },
    index: { type: Number, default: 0 }
})

let airport: Airport = new Airport()
let runway: Runway = Runway.noRunway()
const frequencies = ref<CornerValue[]>([])

const customLabel = ref('')
const customValue = ref('')
const showCustom = ref(false)

class CornerValue {
    id: string;
    label: string;
    constructor(id: string, label: string) {
        this.id = id;
        this.label = label;
    }
}

watch(props, () => {
    // console.debug('[CornerConfig.watch] props', props, menu.value)

    if (props.event) {
        menu.value.toggle(props.event)
    }
    loadProps(props)
})

function loadProps(props:any) {
    activeCorner.value = props.index

    // create frequencies list
    if (!props.airport) {
        frequencies.value = []
        airport = Airport.noAirport
        runway = Runway.noRunway()
    } else {
        airport = Airport.copy(props.airport);
        runway = Runway.copy(props.runway)
        if (airport.isValid()) {
            // build a frequency list with '#F' prefix
            const freqList = airport.freq.map(f => { 
                const formattedFreq = Formatter.frequency(f.mhz)
                return new CornerValue('#F' + f.name + '#' + formattedFreq, formattedFreq + ' : ' + f.name + (f.notes.length ? ' (' + f.notes + ')' : ''))
            })
            // add a bogus frequency for selected runway

            // if (runway && 'freq' in runway) freqList.push(new CornerValue('#Ftwr', 'Selected Runway'))
            frequencies.value = freqList
        }
    }

    // build items lists
    const i: any[] = []
    const items1: any[] = []
    cornerTypes.value.forEach(ct => {
        items1.push({ label: ct.name, command: () => onSelection(ct.key) })
    })
    i.push({ label: "Information", items: items1 })

    // Frequencies list
    const items2: any[] = []
    frequencies.value.forEach(f => {
        items2.push({ label: f.label, command: () => onSelection(f.id) })
    })
    i.push({ label: 'Frequencies', items: items2 })

    const items3: any[] = []
    items3.push({ label: 'Notes Block', command: () => onSelection('notes') })
    items3.push({ label: 'Label & Value', command: () => onSelection('??') })
    i.push({ label: 'Custom', items: items3 })

    items.value = i
}

function onCustomValue() {
    showCustom.value = false
    const field = '?' + customLabel.value + '?' + customValue.value
    onSelection(field)
}

function onSelection(value: string) {
    // console.debug('[CornerConfig.onSelection]', value)
    menu.value.hide()
    if (value == '??') {
        showCustom.value = true
    } else {
        emits('selection', value)
    }
}

</script>

<style scoped>
.dialog-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.properties {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>