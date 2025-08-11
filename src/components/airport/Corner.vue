<template>
    <div>
        <div class="clickable" :class="{faded: value=='.'}">
            <div :class="{'big':displayMode==DisplayMode.big,'small':displayMode!=DisplayMode.big,'flipped':displayMode==DisplayMode.flipped, 'notes':notes}">
                <div class="label">{{label}}</div>
                <div class="value" :class="getFrequencyColorClass()">{{value}}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { getFrequency, getNavaid } from '../../assets/data';
import { Formatter } from '../../lib/Formatter';
import { Airport, Runway } from '../../model/Airport';
import { Frequency, FrequencyType } from '../../model/Frequency';

enum DisplayMode {
    small, 
    flipped, 
    big
}

// const emits = defineEmits(['edit'])

let airport:Airport = new Airport()
const displayMode = ref(DisplayMode.small)
const label = ref('')
let runway:Runway = Runway.noRunway()
const value = ref('')

const props = defineProps({
    airport: { type: Airport, default: null},
    data: { type: String, default: null},
    runway: { type: Runway, default: Runway.noRunway()},
    flip: { type: Boolean, default: false},
    big: { type: Boolean, default: false},
})

const notes = ref(false)
const currentFrequencyType = ref<FrequencyType | null>(null)

onMounted(() => {
    loadProps(props)
})

watch( props, () => {
    // console.log( '[Corner.watch] props changed', JSON.stringify(props))
    loadProps(props)
})

function getFrequencyColorClass() {
    if (!currentFrequencyType.value) return ''
    
    switch(currentFrequencyType.value) {
        case FrequencyType.ctaf: return 'ctaf'
        case FrequencyType.tower: return 'tower'
        case FrequencyType.weather: return 'weather'
        case FrequencyType.navaid: return 'navaid'
        case FrequencyType.ground: return 'ground'
        case FrequencyType.tracon: return 'tracon'
        default: return ''
    }
}

function loadProps(newProps:any) {
    // console.log( '[Corner.loadProps]', newProps)
    if(newProps == undefined) {
        displayMode.value = DisplayMode.small
        unknownValues()
        return
    } 
    
    // display values
    if( newProps.data == undefined || newProps.airport == null) {
        // console.log('[Corner.loadProps] no data')
        unknownValues()
    } else {
        airport = newProps.airport
        showField(newProps.data)
    }

    runway = newProps.runway

    // console.log( '[Corner.loadProps] big', newProps.big)
    if(newProps.big) {
        displayMode.value = DisplayMode.big
    } else if(newProps.flip) {
        displayMode.value = DisplayMode.flipped
    } else {
        displayMode.value = DisplayMode.small
    }
}

// turn the selection into the actual label/value pair
function showField( field:string) {
    // console.log('[Corner.showField]', field)
    notes.value = false
    currentFrequencyType.value = null
    
    // console.log('[Corner.showField]', field, typeof field)
    // We have 3 types of fields 1) Special, 2) Custom and 3) Dynamic
    if( field.length > 2 && field[0] == '#') { 
        // Special fields start with # then one letter code
        // #F -> Frequency
        // #N -> Navaid
        // #R -> Radial
        // #A -> ATC
        if(field[1] == 'F' && airport.freq) { // Frequency
            // RadioFrequencies use the '#F' prefix
            const freqName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            const freq = getFrequency( airport.freq, freqName)
            value.value = Formatter.frequency(freq)
            label.value = freqName
            
            // Determine frequency type based on name
            if (freq) {
                currentFrequencyType.value = Frequency.typeFromString(freqName)
            }
        } else if( field[1] == 'N' && airport.navaids) { // Navaids
            // Navaids use the '#N' prefix
            const navaidName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = Formatter.frequency( getNavaid( airport.navaids, navaidName))
            label.value = navaidName
            currentFrequencyType.value = FrequencyType.navaid
        } else if( field[1] == 'R' && airport.navaids) {
            // Navaid Radial use the '#R' prefix
            const navaidName = field.substring(2)
            // console.log('[Corner.showField]', freqName)
            value.value = Formatter.navaid( getNavaid( airport.navaids, navaidName))
            label.value = navaidName + ' Radial'
            // Radials don't get frequency colors
        } else if( field[1] == 'A' && airport.atc) { // ATC
            // ATC use the '#A' prefix
            const freq = Number(field.substring(2))
            value.value = freq.toFixed(3)
            const atc = airport.atc.find( a => a.mhz == freq)
            label.value = atc ? atc.name : '?' 
            
            // Determine ATC frequency type
            if (atc) {
                currentFrequencyType.value = Frequency.typeFromString(atc.name)
            }
        } else {
            unknownValues()
        }
        // console.log('[Corner.showField]', label.value)
    } else if( field.length > 0 && field[0] == '?') { // custom
        // custom labels '?' as marker and separator
        // Field should look like '?label?value'
        const tokens = field.split('?')
        if(tokens.length < 3) {
            unknownValues()
        } else {
            label.value = tokens[1]
            value.value = tokens[2]
        }
    } else {
        switch( field) {
            case 'weather':
                const weather =  airport.getFreqWeather()
                // console.log('[Corner.showField] weather', airport, weather)
                label.value = weather ? weather.name : ''
                value.value = weather ? Formatter.frequency(weather.mhz) : '?'
                currentFrequencyType.value = FrequencyType.weather
                break
            case 'twr':
                console.log('[Corner.showField] twr', runway)
                if( runway.freq > 0) {
                    // console.log('[Corner.showField]', runway.freq)
                    value.value = runway.freq.toFixed(3)
                    label.value = 'RWY ' + runway.name
                    currentFrequencyType.value = FrequencyType.tower
                } else {
                    // assign mhz or '-' if the frequency is undefined
                    let freq = airport.getFreqTower()
                    if( freq) {
                        label.value = 'TWR'
                        currentFrequencyType.value = FrequencyType.tower
                    } else {
                        freq = airport.getFreqCtaf()
                        label.value = 'CTAF'
                        currentFrequencyType.value = FrequencyType.ctaf
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
                currentFrequencyType.value = FrequencyType.ground
                break;
            case 'rwyinfo':
                // console.log('[Corner.showField] rwyinfo', runway)
                value.value = runway.length + 'x' + runway.width
                label.value = runway.surface ? (runway.surface.cond + '/' + runway.surface.type) : '?'
                break;
            case 'notes':
            case 'blank':
                notes.value = true;
                value.value = '  '
                label.value = 'Notes'
                break;
            default:
                unknownValues()
        }
    }
}

function unknownValues() {
    label.value = '-'
    value.value = '-'
    currentFrequencyType.value = null
}

</script>

<style scoped>
.label {
    padding: 0;
    max-width:110px;
    overflow: hidden;
}
.notes {
    border: 1px dashed darkgrey;
    width: 80px;
    height: 40px;
}

.small .value {
    height: 19px;
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

/* Frequency color coding */
.value.ctaf {
    color: var(--text-ctaf);
}
.value.navaid {
    color: var(--text-navaid);
}
.value.tower, .value.tracon {
    color: var(--text-atc);
}
.value.weather {
    color: var(--text-weather);
}
.value.ground {
    color: var(--text-atc);
}

.faded {
    opacity: 0.3;
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
