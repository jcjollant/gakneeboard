<script setup>
import { onMounted, ref, watch } from 'vue'
import Header from './Header.vue';
import RadioBox from './RadioBox.vue';
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel';
import Textarea from 'primevue/textarea';

const emits = defineEmits(['replace','update'])

const props = defineProps({
    params: { type: Object, default: null}, // expecting a list of radio {'target':'COM1', 'freq':'-.-', 'name':'-'}
})

const noRadio = {'target':'COM1', 'freq':'-.-', 'name':'-'}
const radio1=ref(noRadio)
const radio2=ref(noRadio)
const radio3=ref(noRadio)
const radio4=ref(noRadio)
const radio5=ref(noRadio)
const radio6=ref(noRadio)
const radio7=ref(noRadio)
const radio8=ref(noRadio)
const mode=ref('')
const textData = ref('')

const allRadios = [radio1, radio2, radio3, radio4, radio5, radio6, radio7, radio8]

function loadData(data) {
    // console.log('RadioFlow loadData ' + JSON.stringify(data))
    if( data && Array.isArray(data)) {
        let text = ''
        data.forEach( (radio, index) => {
            if(index == 0) radio1.value = radio;
            else if(index == 1) radio2.value = radio;
            else if(index == 2) radio3.value = radio;
            else if(index == 3) radio4.value = radio;
            else if(index == 4) radio5.value = radio;
            else if(index == 5) radio6.value = radio;
            else if(index == 6) radio7.value = radio;
            else if(index == 7) radio8.value = radio;
            if(text != '') text += ','
            text += radio.target + ',' + radio.freq + ',' + radio.name
        })
        textData.value = text;
    } else {
        radio1.value = noRadio
    }
}

function addFrequency(name) {
    const numLines = textData.value.split(/\r\n|\r|\n/).length
    if(numLines >= 8) return;
    textData.value += name + ',-.-,NAME\n'
}

// load data from text value
function onApply() {
    // console.log( 'onApply ' + textData.value)
    var data = []
    textData.value.split('\n').forEach( (row) => {
         const [target,freq,name] = row.split(',')
         // if we have enough values, we make a radio out of it
         if( target && freq && name) {
            const radio = {'target':target,'freq':freq,'name':name}
            // console.log( 'radio :' + JSON.stringify(radio))
            data.push(radio)
         }
    })

    // fill the rest with noRadio
    while( data.length < 8) data.push(noRadio)

    loadData(data);
    emits('update',data);
    // go back to normal mode
    mode.value = ''
}

function onHeaderClick() {
    // console.log('onHeaderClick ' + mode.value)
    if( mode.value == 'edit') {
        mode.value = ''
    } else {
        mode.value = 'edit'
        textData.value = allRadios.map((radio => radio.value.target + ',' + radio.value.freq + ',' + radio.value.name)).join('\n')
    }
}

onMounted(() => {
    // console.log('onMounted ' + JSON.stringify(props.params))
    loadData(props.params);
})

watch( props, async() => {
    // console.log('RadioFlow watch ' + JSON.stringify(props.params))
    loadData(props.params);
})

</script>

<template>
    <div class="widget">
        <Header :title="'Radio Flow'" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div class="radioList" v-if="mode==''">
            <RadioBox class='br bb' :radio="radio1"/>
            <RadioBox class='bb' :radio="radio2"/>
            <RadioBox class='br bb' :radio="radio3"/>
            <RadioBox class='bb' :radio="radio4"/>
            <RadioBox class='br bb' :radio="radio5"/>
            <RadioBox class='bb' :radio="radio6"/>
            <RadioBox class='br' :radio="radio7"/>
            <RadioBox :radio="radio8"/>
        </div>
        <div v-else-if="mode=='edit'" class="edit">
            <div>Enter up to 8 frequencies</div>
            <div class="list">COM1,FREQ,NAME</div>
            <!-- <div>Format: COM1,124.7,TWR</div> -->
            <!-- <textarea v-model="textData" rows="8" cols="24">Blah</textarea> -->
            <!-- <div class="helpers">
                <Button label="COM1" class="shortcut" @click="addFrequency('COM1')"></Button>
                <Button label="COM2" class="shortcut" @click="addFrequency('COM2')"></Button>
                <Button label="NAV1" class="shortcut" @click="addFrequency('NAV1')"></Button>
                <Button label="NAV2" class="shortcut" @click="addFrequency('NAV2')"></Button>
            </div> -->
            <Textarea class='list' rows="8" cols="24" autoResize v-model="textData" placeholder="Enter Freq. or click above"></Textarea>

            <div class="actionBar">
                <Button @click="onHeaderClick" label="Cancel" link></Button>
                <Button icon="pi pi-check" @click="onApply" label="Apply"></Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.radioList {
    position: relative;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto auto auto;
    height: 203px;
    /* border: 1px solid red; */
}
.br {
    border-right: 1px dashed darkgrey;
}
.bb {
    border-bottom: 1px dashed darkgrey;
}
.label {
    font-size: 0.8rem;
    text-align: center;
}
.list {

    font-size: 0.8rem;
    padding: 0.2rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
}

.edit {
    position: relative;
    height:200px;
    font-size: 0.8rem;
}
.helpers {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 5px 0 2px 0;
}
.shortcut {
    padding: 2px;
    font-size: 0.8rem;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 400;
}
</style>
