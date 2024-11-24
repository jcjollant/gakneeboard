<template>
    <div class="tile">
        <Header :title="displayMode==''?'ATIS @':'ATIS'" :left="displayMode==''" :hideReplace="displayMode!='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="settingsMode" class="list" >
            <Button label="Full Size" @click="changeMode('')"></Button>
            <Button label="Compact (x4)" @click="changeMode('compact')"></Button>
        </div>
        <div v-else-if="displayMode==''" class="tileContent full" @click="cycleMode">
            <div class="info br">
                <div class="label">Info</div>
            </div>
            <div class="wind br">
                <div class="label">Wind</div>
            </div>
            <div class="runway">
                <div class="label">Rwy</div>
            </div>
            <div class="visibility bt bb">
                <div class="label">Vis</div>
            </div>
            <div class="sky bt bl">
                <div class="label">Sky</div>
            </div>
            <div class="temperature bb">
                <div class="label">Temp</div>
            </div>
            <div class="altimeter">
                <div class="label">Alt</div>
            </div>
        </div>
        <div v-else-if="displayMode=='compact'" class="tileContent" @click="cycleMode">
            <div v-for="n in 4" class="compact">
                <div class="info br" :class="{bb: n < 4 }">
                    <div class="label">Info</div>
                </div>
                <div class="wind br" :class="{bb: n < 4 }">
                    <div class="label">Wind</div>
                    <span class="at">@</span>
                </div>
                <div class="altimeter br" :class="{bb: n < 4 }">
                    <div class="label">Alt</div>
                </div>
                <div class="runway" :class="{bb: n < 4 }">
                    <div class="label">Rwy</div>
                </div>
                
            </div>
        </div>
        <NoSettings v-else />
    </div>
</template>

<script setup>
import { ref,onMounted, watch } from 'vue'
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue'
import Button from 'primevue/button'

const emits = defineEmits(['replace','update'])

let previousMode = ''

const defaultMode = ''
const displayMode = ref(defaultMode)
const settingsMode = ref(false)

// Props Management
const props = defineProps({
    params: { type: Object, default: null}, // expects {'mode':'compact'}
})

function loadProps(props) {
    // console.log('ATIS loadProps ' + JSON.stringify(props))
    const newMode = props.params.mode
    // load mode from params but defaults to full
    if( newMode) {
        displayMode.value = newMode
    } else {
        displayMode.value = defaultMode
    }
}

onMounted(() => {   
    // console.log('ATIS mounted with ' + JSON.stringify(props.params))
    loadProps(props)
    // console.log('onMounted mode ' + mode.value)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})
// End of Props management


function changeMode(newMode) {
    displayMode.value = newMode
    settingsMode.value = false;
    const params = {mode:newMode}
    emits('update', params)
}

function cycleMode() {
    if(displayMode.value == '') {
        changeMode('compact')
    } else {
        changeMode(defaultMode)
    }
}

function onHeaderClick() {
    settingsMode.value = ! settingsMode.value
}

</script>
<style scoped>
.label {
  position: absolute;
  left: 3px;
  top: 0;
  font-size: 10px;
}
.tileContent {
    display: grid;
    grid-template-rows: repeat( 4, calc(var(--tile-height / 4)));
    cursor: pointer;
}
.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-rows: 3rem 3rem;
}

.full {
    display: grid;
    grid-template-columns: 20% 30% 25% 25%;
}
.compact {
    display: grid;
    grid-template-columns: 15% 40% 25% 20%;
}
.info {
    grid-column: 1;
    position: relative;
}
.wind {
    position: relative;
}
.full .wind {
    grid-column: 2 / span 2;
}
.compact .wind {
    grid-column: 2;
}
.runway {
    grid-column: 4;
    position: relative;
}
.sky {
    grid-column: 3 / span 2;
    grid-row: 2 / span 3;
    position: relative;
}
.visibility {
    grid-row: 2;
    grid-column: 1 / span 2;
    position: relative;
}
.temperature {
    grid-row: 3;
    grid-column: 1 / span 2;
    position: relative;
}
.altimeter {
    position: relative;
}
.full .altimeter {
    grid-row: 4;
    grid-column: 1 / span 2;
}
.compact .altimeter {
    grid-column:3;
}
.at {
    position: absolute;
    left: 50px;
    top: 20px;
    font-size: 0.8rem;
    color: darkgrey;
}
</style>