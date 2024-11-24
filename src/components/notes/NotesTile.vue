<template>
    <div class="tile">
        <Header :title="'Notes'" :stealth="!settingsMode && displayMode==''" :hideReplace="!settingsMode"
            @click="onClick" @replace="emits('replace')"></Header>
        <div v-if="settingsMode" class="list" >
            <Button label="Blank" @click="changeMode('')"></Button>
            <Button label="Grid" @click="changeMode('grid')" title="2x6 grid"></Button>
        </div>
        <div v-else-if="displayMode=='grid'" class="grid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import Button from 'primevue/button';
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue';

const displayMode = ref('')
const emits = defineEmits(['replace','update'])
const settingsMode = ref(false)

// Props management
const props = defineProps({
    params: { type: Object, default: null},
})

function loadProps(props) {
    // console.log('ATIS loadProps ' + JSON.stringify(props))
    const newMode = props?.params?.mode
    // load mode from params but defaults to full
    if( newMode) {
        displayMode.value = newMode
    } else {
        displayMode.value = ''
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



function changeMode(newMode) {
    displayMode.value = newMode
    settingsMode.value = false;
    const params = {mode:newMode}
    emits('update', params)
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
.list {
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-rows: 3rem 3rem;
}

</style>