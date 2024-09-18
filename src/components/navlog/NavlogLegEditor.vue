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

const attitudeName = ref(null)
const attitudeClass = ref(null)
const calculatedDistance = ref(null)
const calculatedDistanceHint = ref('Calculated Distance. Click to use.')
const calculatedFuel = ref(null)
const calculatedTime = ref(null)
const calculatedTimeHint = ref('Calculated Time. Click to use.')
const courseIsTrue = ref(true)
const cruiseFuelFlow = ref(null)
const cruiseTrueAirspeed = ref(null)
const descentFuelFlow = ref(null)
const descentRate = ref(null)
const editEntry = ref(null)
const groundSpeed = ref(null)
const calculatedGroundSpeed = ref(null)
const calculatedHeading = ref(null)
const lastLeg = ref(false)
const magneticHeading = ref(null)
const nextEntry = ref(null)
const trueHeading = ref(null)
const windCorrectionAngle = ref(null)
const windDirection = ref(null)
const windSpeed = ref(null)

//---------------------
// Props management
const props = defineProps({
  navlog : {type: Object, default: null},
  index: { type:Number, default: -1},
  time: { type: Number, default: 0},
})

function loadProps(newProps) {
    // console.log('[NavlogLegEditor.loadProps]', newProps)
    // console.log('[NavlogLegEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.navlog
        && newProps.navlog.entries 
        && newProps.navlog.entries.length > 0 
        && newProps.index >= 0) {
        const entry = NavlogEntry.copy(newProps.navlog.entries[newProps.index])
        // console.log('[NavlogLegEditor.loadProps] entry', JSON.stringify(entry), Object.hasOwn(entry, 'tc'))
        const entriesCount = newProps.navlog.entries.length
        const prevEntryIndex = newProps.index - 1
        const nextEntryIndex = newProps.index < entriesCount - 2 ? newProps.index + 1 : -1
        const prevEntry = prevEntryIndex >= 0 ? newProps.navlog.entries[prevEntryIndex] : null
        // console.log('[NavlogLegEditor.loadProps] prevEntry', JSON.stringify(prevEntry))
        const nxtEntry = nextEntryIndex >= 0 ? newProps.navlog.entries[nextEntryIndex] : null
        // console.log('[NavlogLegEditor.loadProps] nextEntry', nxtEntry)

        // Calculator fields
        // Copy data data from previous entry if useful
        if(prevEntry) {
            const fields = ['tc','wind','ws','tas','mv','md']
            for(const f of fields) {
                if(entry[f] === undefined && prevEntry[f] !== undefined) entry[f] = prevEntry[f]
            }
        }

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
        cruiseFuelFlow.value = newProps.navlog.cff
        cruiseTrueAirspeed.value = newProps.navlog.cta
        descentFuelFlow.value = newProps.navlog.dff
        descentRate.value = newProps.navlog.dr

        // 
        lastLeg.value = newProps.index >= entriesCount - 2
        nextEntry.value = nxtEntry
        calculatedHeading.value = prevEntry ? prevEntry.mh : 0

        // trigger computation with these values
        updateMH()
    } else { // no navlog?
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

watch(editEntry, () => {
    // console.log('[NavlogEntryEditor.watch.editEntry]')
    calculation()
})

// End of props management
//------------------------

function calculation() {
    // console.log('[navlogLegEditor.calculation]')
    if(!editEntry || !editEntry.value) return;
    const groundSpeed = Number(editEntry.value.gs)
    const climb = (editEntry.value.att=='+')
    const descent = (editEntry.value.att=='-')
    const cruise = !climb && !descent;

    // leg time
    let legTime = undefined;
    let ltFormula = ''
    if( cruise) {
        const legDistance = Number(editEntry.value.ld)
        // console.log('[NavlogLegEditor.calculation]', groundSpeed, legDistance)
        if( !(isNaN(groundSpeed) || isNaN(legDistance) || groundSpeed <= 0 || legDistance <= 0)) {
            legTime = legDistance / groundSpeed * 60
            ltFormula = 'Cruise Leg Time = Distance / GroundSpeed. Click to use'
        }
    } else if( descent) {
        const altFrom = editEntry.value ? Number(editEntry.value?.alt) : undefined
        // const altTo = nextEntry.value ? Number(nextEntry.value?.alt) : undefined
        const altTo = Number(nextEntry.value?.alt)
        const descentRateValue = Number(descentRate.value)
        // altitude difference / descent rate
        if( !(isNaN(altFrom) || isNaN(altTo) || isNaN(descentRateValue) || descentRateValue <= 0)) {
            legTime = (altFrom - altTo) / descentRateValue
            ltFormula = 'Descent Leg Time = DescentAltitudeDelta / DescentRate. Click to use'
        }
    } else {
        ltFormula = 'Climb Leg Time should come from POH'
    }
    calculatedTime.value = Formatter.legTime( legTime)
    calculatedTimeHint.value = ltFormula;

    // Fuel
    const fuelFlowValue = cruise ? Number(cruiseFuelFlow.value) : (descent ? Number(descentFuelFlow.value) : undefined)
    let legFuel = undefined
    // console.log('[NavlogLegEditor.calculation]', fuelFlowValue, legTime)
    if(legTime && !(isNaN(fuelFlowValue) || fuelFlowValue <= 0)) {
        legFuel = fuelFlowValue * legTime / 60;
    }
    calculatedFuel.value = Formatter.fuel( legFuel)

    // Distance
    let legDistance = undefined
    let ldFormula = ''
    if(descent) {
        if( !(isNaN(groundSpeed) || isNaN(legTime) || groundSpeed <= 0 || legTime <= 0)) {
            legDistance = legTime * groundSpeed / 60
            ldFormula = 'Time / GroundSpeed. '
        }
    } else if(cruise) {
        try {
            legDistance = eval(editEntry.value.ld)
            ldFormula = editEntry.value.ld + ' '
        } catch( e) {
            legDistance = 0
        }
    }
    // console.log('[NavlogLegEditor.calculation]', legDistance)
    calculatedDistance.value = Formatter.distance(legDistance)
    calculatedDistanceHint.value = 'Calculated Distance. ' + ldFormula + 'Click to use';
}

function copyLegDistance() {
    editEntry.value.ld=calculatedDistance.value
    calculation()
}

function copyGroundSpeed() {
    editEntry.value.gs = calculatedGroundSpeed.value
    calculation()
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
    const fields = ['alt','th','ld','gs','lf','tc','tas','mv','md', 'mc']
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
    console.log('[navlogLegEditor.onApply]', JSON.stringify(entry))

    emits( 'save', {entry:entry, next:andNext})
}

function updateMH() {
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
    const ws = Number(windSpeed.value)
    const wd = Number(windDirection.value)
    let mc = getUsableValue(entry.mc)
    let tc = getUsableValue(entry.tc)
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
    calculatedHeading.value = mh

    const gs = Math.sqrt(tas*tas + ws*ws - (2*tas*ws*Math.cos((th-wd)*d2r)))
    // console.log('[NavlogLegEditor.updateMH]', wca)
    const usableGs = getUsableValue(Math.round(gs))
    groundSpeed.value = usableGs
    calculatedGroundSpeed.value = usableGs
}

</script>

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
                    <InputGroupAddon>Fuel Flow</InputGroupAddon>
                    <InputText id="cruiseGPH" v-model="cruiseFuelFlow" @input="calculation" />
                </InputGroup>
                <InputGroup v-if="attitudeName==attitudeCruise" class="legParameter" title="POH Cruise True Airspeed (Kts)">
                    <InputGroupAddon>True Airspeed</InputGroupAddon>
                    <InputText id="cruiseGPH" v-model="cruiseTrueAirspeed" @input="calculation" />
                </InputGroup>
                <InputGroup v-if="attitudeName==attitudeDescent" class="legParameter" title="POH Descent Fuel Flow (GPH)">
                    <InputGroupAddon>Descent Fuel Flow</InputGroupAddon>
                    <InputText id="descentGPH" v-model="descentFuelFlow" @input="calculation" />
                </InputGroup>
                <InputGroup v-if="attitudeName==attitudeDescent" class="legParameter" title="Descent Rate (FPM)">
                    <InputGroupAddon>Descent Rate</InputGroupAddon>
                    <InputText id="descentFPM" v-model="descentRate" @input="calculation" />
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
                        @input="updateMH"></InputText>
                    <InputText v-else v-model="editEntry.mc" id="calcMC" 
                        class="headingInput" title="Magnetic Course"
                        @input="updateMH"></InputText>
                    <InputText v-model="windDirection" id="calcWD" 
                        class="headingInput" title="Wind Direction (True)"
                        @input="updateMH"></InputText>
                    <InputText v-model="windSpeed" id="calcWS"
                        class="headingInput" title="Wind Speed (Kts)"
                        @input="updateMH"></InputText>
                    <InputText v-model="editEntry.tas" id="calcTAS"
                        class="headingInput" title="True Airspeed (Kts)"
                        @input="updateMH"></InputText>
                    <div class="headingCalculated" id="calcGS"
                        title="Calculated Ground Speed (Kts)."
                        >{{ Formatter.speed(groundSpeed) }}</div>
                    <div class="headingCalculated" id="calcWCA"
                        title="Wind Correction Angle">{{ Formatter.heading(windCorrectionAngle,true) }}</div>
                    <div class="headingCalculated" id="calcTH"
                        title="True Heading">{{ Formatter.heading(trueHeading) }}</div>
                    <InputText v-model="editEntry.mv" id="calcMV"
                        class="headingInput" title="Magnetic Variation (sectional)"
                        @input="updateMH"></InputText>
                    <InputText v-model="editEntry.md" id="calcMD"
                        class="headingInput" title="Magnetic Deviation (Compass card)"
                        @input="updateMH"></InputText>
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
                            title="Click to use." 
                            @click="editEntry.mh=calculatedHeading">{{ calculatedHeading }}</div>
                    </div>
                    <div title="Leg Distance (NM). Supports calculation for cruise legs (ex: 24-15.4)" class="legField">
                        <div class="label">Distance</div>
                        <InputText id="ld" v-model="editEntry.ld" @input="calculation" />
                        <div class="hint clickable" id="ldHint"
                            :title="calculatedDistanceHint" 
                            @click="copyLegDistance">{{ calculatedDistance }}</div>
                    </div>
                    <div class="legField" title="Ground Speed (Kts)">
                        <div class="label">Ground Speed</div>
                        <InputText id="gs" v-model="editEntry.gs" @input="calculation" />
                        <div class="hint clickable" id="gsHint"
                            title="Calculated Ground Speed. Click to Use." 
                            @click="copyGroundSpeed">{{ calculatedGroundSpeed }}</div>
                    </div>
                    <div class="legField" title="Leg Time (Min). Supports decimal and time format (3:30 = 3.5)">
                        <div class="label">Time</div>
                        <InputText id="lt" v-model="editEntry.lt" />
                        <div class="hint clickable" id="ltHint"
                            :title="calculatedTimeHint"
                            @click="editEntry.lt=calculatedTime">{{ calculatedTime }}</div>
                    </div>
                    <div class="legField" title="Leg Fuel (Gal)">
                        <div class="label">Leg Fuel</div>
                        <InputText id="lf" v-model="editEntry.lf" />
                        <div class="hint clickable" id="lfHint"
                            title="Calculated Leg Fuel. Click to use." 
                            @click="editEntry.lf=calculatedFuel">{{ calculatedFuel }}</div>
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
    justify-content: space-around;
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