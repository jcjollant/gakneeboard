<template>
    <Dialog modal header="Navigation Leg" class="editorDialog">
        <div v-if="editEntry">
            <div class="between mb-2" :class="attitudeClass">
                <div>{{ editEntry.name }} @ {{ Formatter.altitude(editEntry.alt) }}</div>
                <div class="attitudeGroup">
                    <i class="pi attIcon" :class="{'pi-arrow-up-right':editEntry.att=='+','pi-arrow-down-right':editEntry.att=='-','pi-arrow-right':(editEntry.att!='+'&&editEntry.att!='-')}"></i>
                    <div class="attitude">{{attitudeName}}</div>
                </div>
                <div v-if="nextEntry">{{ nextEntry.name }} @ {{ Formatter.altitude(nextEntry.alt) }}</div>
            </div>
            <div class="legParamGroup mb-2">
                <InputGroup v-if="attitudeName==attitudeCruise" class="legParameter" title="POH Cruise Fuel Flow (GPH)">
                    <InputGroupAddon>Cruise Fuel Flow @ {{ Formatter.altitude(editEntry.alt) }}</InputGroupAddon>
                    <InputText id="cruiseGPH" v-model="cruiseFuelFlow" @input="updateSuggested" />
                </InputGroup>
                <InputGroup v-if="attitudeName==attitudeDescent" class="legParameter" title="POH Descent Fuel Flow (GPH)">
                    <InputGroupAddon>Descent Fuel Flow</InputGroupAddon>
                    <InputText id="descentGPH" v-model="descentFuelFlow" @input="updateSuggested" />
                </InputGroup>
                <InputGroup v-if="attitudeName==attitudeDescent" class="legParameter" title="Descent Rate (FPM)">
                    <InputGroupAddon>Descent Rate</InputGroupAddon>
                    <InputText id="descentFPM" v-model="descentRate" @input="updateSuggested" />
                </InputGroup>
            </div>
            <div class="headingCalculator">
                <!-- <div class="headingTitle mb-2">Magnetic Heading Calculator</div> -->
                <div class="headingGrid headingHeader">
                    <div @click="courseIsTrue=!courseIsTrue" title="Toggle between True and Magnetic Course" class="headingCourse">{{ courseIsTrue ? 'True Course':'Magnetic Course' }}</div>
                    <!-- <div class="headingWind">Wind</div> -->
                    <div>Wind Direction</div>
                    <div>Wind Speed</div>
                    <div>True Airspeed</div>
                    <div>Ground Speed</div>
                    <div>WCA</div>
                    <div>True Heading</div>
                    <div title="Magnetic Variation (sectional)">Mag. Variation</div>
                    <div title="Magnetic Deviation (compass card)">Mag. Deviation</div>
                    <div>Mag. Heading</div>
                </div>
                <div class="headingGrid">
                    <InputText v-if="courseIsTrue" v-model="editEntry.tc" id="calcTC" 
                        class="headingInput" title="True Course"
                        @input="updateCalculator"></InputText>
                    <InputText v-else v-model="editEntry.mc" id="calcMC" 
                        class="headingInput" title="Magnetic Course"
                        @input="updateCalculator"></InputText>
                    <InputText v-model="windDirection" id="calcWD" 
                        class="headingInput" title="Wind Direction (True)"
                        @input="updateCalculator"></InputText>
                    <InputText v-model="windSpeed" id="calcWS"
                        class="headingInput" title="Wind Speed (Kts)"
                        @input="updateCalculator"></InputText>
                    <InputText v-model="editEntry.tas" id="calcTAS"
                        class="headingInput" title="True Airspeed (Kts)"
                        @input="updateCalculator"></InputText>
                    <div class="headingCalculated" id="calcGS"
                        title="Calculated Ground Speed (Kts)."
                        >{{ Formatter.speed(groundSpeed) }}</div>
                    <div class="headingCalculated" id="calcWCA"
                        title="Wind Correction Angle">{{ Formatter.heading(windCorrectionAngle,true) }}</div>
                    <div class="headingCalculated" id="calcTH"
                        title="True Heading">{{ Formatter.heading(trueHeading) }}</div>
                    <InputText v-model="editEntry.mv" id="calcMV"
                        class="headingInput" title="Magnetic Variation (sectional)"
                        @input="updateCalculator"></InputText>
                    <InputText v-model="editEntry.md" id="calcMD"
                        class="headingInput" title="Magnetic Deviation (Compass card)"
                        @input="updateCalculator"></InputText>
                    <div class="headingCalculated" id="calcMH"
                        title="Calculated Magnetic Heading."
                        >{{ Formatter.heading(magneticHeading) }}</div>
                </div>
                <!-- <div class="headingTitle">TC ± WCA = TH ± MV ± MD = MH</div> -->
            </div>
            <div class="headingCalculator" :class="attitudeClass">
                <div class="headingTitle">Log Entry</div>
                <div class="legFieldGroup">
                    <div title="Magnetic Heading" class="legField">
                        <div class="label">Mag. Heading</div>
                        <InputText id="mh" v-model="editEntry.mh" />
                        <div class="hint clickable" id="mhHint"
                            :title="suggestedHeadingTitle" 
                            @click="editEntry.mh=suggestedHeading">{{ suggestedHeading }}</div>
                    </div>
                    <div title="Leg Distance (NM). Supports calculation for cruise legs (ex: 24-15.4)" class="legField">
                        <div class="label">Distance</div>
                        <InputText id="ld" v-model="editEntry.ld" @input="updateSuggested" />
                        <div class="hint clickable" id="ldHint"
                            :title="suggestedDistanceTitle" 
                            @click="copyLegDistance">{{ suggestedDistance }}</div>
                    </div>
                    <div class="legField" title="Ground Speed (Kts)">
                        <div class="label">Ground Speed</div>
                        <InputText id="gs" v-model="editEntry.gs" @input="updateSuggested" />
                        <div class="hint clickable" id="gsHint"
                            title="Calculated Ground Speed. Click to Use." 
                            @click="copyGroundSpeed">{{ calculatedGroundSpeed }}</div>
                    </div>
                    <div class="legField" title="Leg Time (Min). Supports decimal and time format (3:30 = 3.5)">
                        <div class="label">Time</div>
                        <InputText id="lt" v-model="editEntry.lt" @input="updateSuggested" />
                        <div class="hint clickable" id="ltHint"
                            :title="suggestedTimeTitle"
                            @click="copyTime">{{ suggestedTime }}</div>
                    </div>
                    <div class="legField" title="Leg Fuel (Gal)">
                        <div class="label">Leg Fuel</div>
                        <InputText id="lf" v-model="editEntry.lf" />
                        <div class="hint clickable" id="lfHint"
                            :title="suggestedFuelTitle" 
                            @click="editEntry.lf=suggestedFuel">{{ suggestedFuel }}</div>
                    </div>
                </div>
            </div>
            <div class="actionDialog gap-2">
                <Button label="Do Not Apply" @click="emits('close')" link></Button>
                <Button label="Apply" @click="onApply(false)"></Button>
                <Button v-if="!lastLeg" label="Apply & Next Leg" @click="onApply(true)"></Button>
            </div>
         </div>
        <PlaceHolder v-else title="Nothing to edit" />
    </Dialog>

</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'

import { NavlogEntry } from '../../assets/NavlogEntry'
import { Formatter } from '../../assets/Formatter'

import PlaceHolder from '../shared/PlaceHolder.vue'

const emits = defineEmits(['close','save'])
const attitudeClimb = 'Climb'
const attitudeDescent = 'Descent'
const attitudeCruise = 'Cruise'
const defaultSuggestedTitle = 'Click to use'
const attitudeName = ref(null)
const attitudeClass = ref(null)
const suggestedHeading = ref(null)
const suggestedHeadingTitle = ref(defaultSuggestedTitle)
const suggestedDistance = ref(null)
const suggestedDistanceTitle = ref(defaultSuggestedTitle)
const suggestedFuel = ref(null)
const suggestedFuelTitle = ref(defaultSuggestedTitle)
const suggestedTime = ref(null)
const suggestedTimeTitle = ref(defaultSuggestedTitle)
const courseIsTrue = ref(true)
const cruiseFuelFlow = ref(null)
const descentFuelFlow = ref(null)
const descentRate = ref(null)
const editEntry = ref(null)
const groundSpeed = ref(null)
const calculatedGroundSpeed = ref(null)
const lastLeg = ref(false)
const magneticHeading = ref(null)
const nextEntry = ref(null)
const trueHeading = ref(null)
const windCorrectionAngle = ref(null)
const windDirection = ref(null)
const windSpeed = ref(null)

let previousMagneticHeading = undefined

//---------------------
// Props management
const props = defineProps({
    cruiseFF: { type: Number, default: 0},
    descentFF: { type: Number, default: 0},
    descentRate: { type: Number, default: 0},
    items : {type: Object, default: null},
    index: { type:Number, default: -1},
    time: { type: Number, default: 0},
})

function loadProps(newProps) {
    // console.log('[NavlogLegEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.items
        && newProps.items.length > 0 
        && newProps.index >= 0) {
        const entry = NavlogEntry.copy(newProps.items[newProps.index].entry)
        // console.log('[NavlogLegEditor.loadProps] entry', JSON.stringify(entry), Object.hasOwn(entry, 'tc'))
        const entriesCount = newProps.items.length
        const prevEntryIndex = newProps.index - 1
        const nextEntryIndex = newProps.index < entriesCount - 1 ? newProps.index + 1 : -1
        const prevEntry = prevEntryIndex >= 0 ? newProps.items[prevEntryIndex].entry : null
        // console.log('[NavlogLegEditor.loadProps] prevEntry', JSON.stringify(prevEntry))
        const nxtEntry = nextEntryIndex >= 0 ? newProps.items[nextEntryIndex].entry : null
        // console.log('[NavlogLegEditor.loadProps] nextEntry', nxtEntry)

        // Calculator fields
        // Copy data data from previous entry if useful
        if(prevEntry) {
            const fields = ['tc','mc','wind','tas','mv','md']
            for(const f of fields) {
                if(entry[f] === undefined && prevEntry[f] !== undefined) entry[f] = prevEntry[f]
            }
        }
        // console.log('[NavlogLegEditor.loadProps] entry', entry)
        editEntry.value = entry

        const [ws, wd] = entry.getWind()
        windDirection.value = ws
        windSpeed.value = wd
        magneticHeading.value = entry.mv

        // transform leg time
        editEntry.value.lt = editEntry.value.lt ? Formatter.legTime(editEntry.value.lt) : ''
        if( editEntry.value.att == '+') {
            attitudeName.value = attitudeClimb
            attitudeClass.value = 'attClimb'
        } else if(editEntry.value.att == '-') {
            attitudeName.value = attitudeDescent
            attitudeClass.value = 'attDescent'
        } else {
            attitudeName.value = attitudeCruise
            attitudeClass.value = 'attCruise'
        }

        // variables
        cruiseFuelFlow.value = newProps.cruiseFF
        descentFuelFlow.value = newProps.descentFF
        descentRate.value = newProps.descentRate

        // 
        lastLeg.value = newProps.index >= entriesCount - 2
        nextEntry.value = nxtEntry
        previousMagneticHeading = prevEntry ? prevEntry.mh : undefined

        // trigger computation with these values
        updateCalculator()
    } else { // no items?
        lastLeg.value = true
        nextEntry.value = null
    }
}

onMounted(() => {
    // loadProps(props)
})

watch(props, () => {
    // console.log('[NavlogLegEditor.watch]')
    loadProps(props)
})

// watch(editEntry, () => {
//     console.log('[NavlogEntryEditor.watch.editEntry]')
//     calculation()
// })

// End of props management
//------------------------

function copyLegDistance() {
    editEntry.value.ld=suggestedDistance.value
    updateSuggested()
}

function copyGroundSpeed() {
    editEntry.value.gs = calculatedGroundSpeed.value
    updateSuggested()
}

function copyTime() {
    editEntry.value.lt=suggestedTime.value
    updateSuggested()

}

function getUsableValue(reference) {
    const value = Number(reference)
    return isNaN(value) ? 0 : value
}

function onApply(andNext) {
    // console.log('[NavlogEditor.onSave]', JSON.stringify(editEntry.value))
    const entry = editEntry.value

    // leg time 
    entry['lt'] = Formatter.getDecimalMinutes( entry.lt)
    // console.log('[NavlogEntryEditor.onSave]', entry.lt)

    // convert all fields to number
    const fields = ['alt','th','ld','gs','lf','tc','tas','mv','md', 'mc', 'mh']
    for(let f of fields) {
        if( entry[f]) entry[f] = Number(entry[f])
    }
    // keep heading within 0-360
    if( entry.th) {
        entry.th = entry.th % 360
        // compute course heading from other headings
        entry.ch = entry.th + entry.mv + entry.md
    }
    // save wind
    entry.wind = windDirection.value + '@' + windSpeed.value
    // console.log('[NavlogLegEditor.onApply]', JSON.stringify(entry))

    emits( 'save', {entry:entry, next:andNext})
}

// Update values in the calculator (GroundSpeed, WCA, TrueHeading and MagneticHeading)
function updateCalculator() {
    // WCA=asin(B4*SIN((B3-A3)/180*PI())/G3)*180/PI()
    // GS=sqrt(G3*G3+B4*B4-(2*G3*B4*cos((H4-B3)/180*PI())))
    // B4 = Wind Speed
    // B3 = Wind Direction
    // A3 = True Course
    // G3 = TAS
    // H4 = TH
    // DegToRadian = 0.0174532925
    const entry = editEntry.value
    const d2r = 0.0174532925
    // console.log('[NavlogLegEditor.onUdateMH]', entry)
    if(entry.tc === undefined) return;
    let mc = getUsableValue(entry.mc)
    let tc = getUsableValue(entry.tc)
    const ws = Number(windSpeed.value)
    const wd = Number(windDirection.value)
    const tas = Number(entry.tas)
    const mv = getUsableValue(entry.mv)
    const md = getUsableValue(entry.md)

    // compute secondary course from selected primary
    if(courseIsTrue.value) {
        mc = tc + mv;
        entry.mc = mc
    } else {
        tc = mc - mv;
        entry.tc = tc
    }

    const wca = Math.asin(ws*Math.sin((wd-tc)*d2r)/tas)/d2r
    const usableWca = getUsableValue(wca)
    windCorrectionAngle.value = usableWca
    const th = tc + usableWca
    trueHeading.value = th
    const mh = Math.round(th + mv + md)
    magneticHeading.value = mh

    const gs = Math.sqrt(tas*tas + ws*ws - (2*tas*ws*Math.cos((th-wd)*d2r)))
    // console.log('[NavlogLegEditor.updateMH]', wca)
    const usableGs = getUsableValue(Math.round(gs))
    groundSpeed.value = usableGs
    calculatedGroundSpeed.value = usableGs
    updateSuggested()
}

function updateSuggested() {
    // console.log('[NavlogLegEditor.calculation]')
    if(!editEntry || !editEntry.value) return;
    const groundSpeed = Number(editEntry.value.gs)
    const legTime = Formatter.getDecimalMinutes( editEntry.value.lt)

    const climb = (editEntry.value.att=='+')
    const descent = (editEntry.value.att=='-')
    const cruise = !climb && !descent;

    // Magnetic Heading
    if(magneticHeading.value != null) {
        suggestedHeading.value = magneticHeading.value
        suggestedHeadingTitle.value = 'Calculated Magnetic Heading'
    } else if(previousMagneticHeading !== undefined){
        suggestedHeading.value = previousMagneticHeading
        suggestedHeadingTitle.value = 'Previous Leg Magnetic Heading'
    } else {
        suggestedHeading.value = null
    }

    // leg time
    let ltCalc = 0
    let ltFormula = ''
    if( cruise) {
        const legDistance = Number(editEntry.value.ld)
        // console.log('[NavlogLegEditor.calculation]', groundSpeed, legDistance)
        if( !(isNaN(groundSpeed) || isNaN(legDistance) || groundSpeed <= 0 || legDistance <= 0)) {
            ltCalc = legDistance / groundSpeed * 60
            ltFormula = 'Cruise Leg Time = Distance / GroundSpeed. Click to use'
        }
    } else if( descent) {
        const altFrom = editEntry.value ? Number(editEntry.value?.alt) : undefined
        const altTo = Number(nextEntry.value?.alt)
        const descentRateValue = Number(descentRate.value)
        // altitude difference / descent rate
        if( !(isNaN(altFrom) || isNaN(altTo) || isNaN(descentRateValue) || descentRateValue <= 0)) {
            ltCalc = (altFrom - altTo) / descentRateValue
            ltFormula = 'Descent Leg Time = DescentAltitudeDelta / DescentRate. Click to use'
        }
    } else {
        ltFormula = 'Climb Leg Time should come from POH'
    }
    suggestedTime.value = Formatter.legTime( ltCalc)
    suggestedTimeTitle.value = ltFormula;

    // Fuel
    let legFuel = undefined
    let legFuelHint = ''
    // console.log('[NavlogLegEditor.calculation]', fuelFlowValue, legTime)
    if(cruise || descent) {
        const fuelFlowValue = cruise ? Number(cruiseFuelFlow.value) : (descent ? Number(descentFuelFlow.value) : undefined)
        if(legTime && !isNaN(fuelFlowValue) && fuelFlowValue > 0) {
            legFuel = fuelFlowValue * legTime / 60;
            legFuelHint = (cruise ? 'Cruise' : 'Descent') + ' Leg Fuel = FuelFlow * LegTime. Click to use'
        }
        
    } else {
        legFuel = undefined
        legFuelHint = 'Should come from POH'
    }
    suggestedFuel.value = Formatter.fuel( legFuel)
    suggestedFuelTitle.value = legFuelHint

    // Distance
    let legDistance = undefined
    let ldHint = ''
    if(descent || climb) {
        // for descent and climb, distance is speed * time
        if( !(isNaN(groundSpeed) || isNaN(legTime) || groundSpeed <= 0 || legTime <= 0)) {
            legDistance = legTime * groundSpeed / 60
            ldHint = (descent ? 'Descent' : 'Climb') + ' leg distance = Time * GroundSpeed. Click to Use'
        }
    } else if(cruise) {
        try {
            // try to help with calculation
            legDistance = eval(editEntry.value.ld)
            ldHint = 'Calculation ' + editEntry.value.ld + ' '
        } catch( e) {
            legDistance = undefined
        }
    }
    // console.log('[NavlogLegEditor.calculation]', legDistance)
    suggestedDistance.value = legDistance ? Formatter.distance(legDistance) : null
    suggestedDistanceTitle.value = ldHint;
    // console.log('[NavlogLegEditor.calculation]', legDistance, ldHint)
}

</script>

<style scoped>
.attitude {
    font-size: 0.7rem;
    padding: 0.2rem;
}
.attitudeGroup {
    display: flex;
    flex-flow: column;
    align-items: center;
    width: 3rem;
}
.attIcon {
    padding-top: 0.3rem;
}
.between {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-evenly;
    font-size: larger;
    padding: 0.5rem 0;
}
.headingCalculated {
    display: flex;
    font-size: 0.9rem;
    /* line-height: 1.5rem; */
    justify-content: center;
    align-items: center;
}
.headingCalculator {
    display: flex;
    flex-flow: column;
    gap: 5px;
    border-radius: 10px;
    /* background: #ddd; */
    padding: 10px;
}
.headingCourse {
    cursor: pointer;
    text-decoration: underline;
}
.headingTitle {
    font-weight: bold;
    font-size: 0.9rem;
    /* opacity: 0.5; */
    text-align: center;
}
.headingHeader {
    /* font-weight: bold; */
    align-items: center;
}
.headingGrid {
    display: grid;
    grid-template-columns: repeat(10, 50px);
    text-align: center;
    gap: 0 5px;
    font-size: 0.7rem;
}
.headingResult {
    font-weight: bold;
    text-decoration: underline;
    font-size: 0.9rem;
    line-height: 1.5rem;
    cursor: pointer;
}
.headingWind {
    grid-column: 2 / span 3;
    background-color: #eee;
    text-align: center;
}
.hint {
    font-size: 0.8rem;
    text-align: right;
    padding-right: 0.4rem;
    text-decoration: underline;
}
.label {
    text-align: right;
    font-size: 0.8rem;
    padding-right: 0.2rem;
}
.legField {
    display: flex;
    flex-flow: column;
    align-items: flex-end;
    gap: 0.2rem;
}
.legFieldGroup {
    display: flex;
    gap: 1rem;
    justify-content: center;
    /* grid-template-columns:  auto auto auto auto auto; */
}
.legParamGroup {
    display: flex;
    justify-content: center;
    gap: 5px;
}
.others {
    display: flex;
    gap: 0.3rem;
}
:deep(.p-inputtext.editorName)   {
    width: 10rem;
    text-align: left;
}

:deep(.p-inputtext.headingInput) {
    width: 50px;
    text-align: right;
    padding: 5px;
}

:deep(.p-inputtext) {
    width: 90px;
    text-align: right;
}

:deep(.p-fieldset-content) {
    padding: 0;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}

:deep(.p-float-label) {
    left: unset;
    right: 0.5rem;
}

:deep(.p-component), :deep(.p-inputgroup-addon) {
    font-size: 0.8rem;
    /* height: 1.5rem; */
}

</style>