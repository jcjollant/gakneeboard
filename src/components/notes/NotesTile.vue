<template>
    <div class="tile">
        <Header title="Notes"
            :stealth="!settingsMode && displayMode==''" :hideReplace="!settingsMode"
            @click="onClick" @replace="emits('replace')"></Header>
        <div v-if="settingsMode" class="list" >
            <Button label="Blank" @click="changeMode(DisplayMode.Blank)"></Button>
            <Button label="Grid" @click="changeMode(DisplayMode.Grid)" title="2x6 grid"></Button>
            <Button label="Holding" @click="changeMode(DisplayMode.Hold)" title="Holding Pattern"></Button>
        </div>
        <div v-else-if="displayMode=='grid'" class="grid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
        <div v-else-if="displayMode=='hold'" class="hold tileContent">
            <div class="params">
                <div class="label">Hold At</div>
            </div>
            <div class="turns">
                <!-- <div class="label">Turns</div> -->
            </div>
            <div class="altitude">
                <div class="labelRight">Alt</div>
            </div>
            <div class="sep"><div class="label">In</div></div>
            <div class="name">BRG</div>
            <div class="sep"><div class="labelRight">In</div></div>
            <!-- <div class="">Left</div> -->
            <div class="name">WCA</div>
            <div>&nbsp;</div>
            <div class="heading">&nbsp;</div>
            <div class="name hdg">HDG</div>
            <div class="heading">&nbsp;</div>
            <div class="time"><div class="label">Times</div></div>
            <div class="bottom">&nbsp;</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import Button from 'primevue/button';
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue';

// Enum with display modes
enum DisplayMode {
    Blank = '',
    Grid = 'grid',
    Hold = 'hold'
}

const displayMode = ref(DisplayMode.Blank)
const emits = defineEmits(['replace','update'])
const settingsMode = ref(false)

// Props management
const props = defineProps({
    params: { type: Object, default: null},
})

function loadProps(props) {
    console.log('[NotesTile.loadProps] ' + JSON.stringify(props))
    // load display mode without update
    changeMode(props?.params?.mode,false)
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


function changeMode(newMode,update=true) {
    // console.log('[NotesTiles.changeMode]', newMode)
    // Crap in => default out
    if(!newMode) newMode = DisplayMode.Blank

    displayMode.value = newMode
    settingsMode.value = false;

    // console.log('[NotesTiles.changeMode] title ' + title.value)
    const params = {mode:newMode}

    // notify the parent if needed
    if(update) emits('update', params)
}

function onClick() {
    settingsMode.value = !settingsMode.value
}
</script>

<style scoped>

.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
}
.grid div {
    border: 1px dashed lightgrey;
}
.heading {
    border: 2px solid black;
    margin: 2px;
}
.hold {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    grid-template-rows: 60px 40px 40px 40px auto;
}
.hold .altitude {
    position: relative;
    grid-column: 3;
    border-bottom: 1px dashed grey;
}
.hold .bottom {
    grid-column: 2;
    border: 2px dashed darkgrey;
    border-top: none;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    margin-bottom: 36px;
}
.hold .hdg {
    border-bottom: none;
}
.hold .name {
    grid-column: 2;
    line-height: 40px;
    border-left: 2px dashed darkgrey;
    border-right: 2px dashed darkgrey;
    /* border-bottom: 1px dashed grey; */
}
.hold .params {
    position: relative;
    grid-column: 1;
    border-bottom: 1px dashed grey;
}
.hold .sep {
    position: relative;
    border-bottom: 1px dashed grey;
}
.hold .time {
    position: relative;
}
.hold .top {
    padding-top: 16px;
    border-top: 2px solid black;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
}
.hold .turns {
    position: relative;
    grid-column: 2;
    margin-top: 36px;
    border: 2px dashed darkgrey;
    border-bottom: none;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
}
.label {
  position: absolute;
  left: 3px;
  top: 0;
  font-size: 10px;
}
.labelRight {
  position: absolute;
  right: 3px;
  top: 0;
  font-size: 10px;
}

.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-rows: repeat(3, 3rem);
}

</style>