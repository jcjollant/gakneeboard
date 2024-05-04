<script setup>
import { onMounted, ref, watch } from 'vue'
import Header from './Header.vue';
import RadioBox from './RadioBox.vue';

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
            <RadioBox class='right bottom' :radio="radio1"/>
            <RadioBox class='bottom' :radio="radio2"/>
            <RadioBox class='right bottom' :radio="radio3"/>
            <RadioBox class='bottom' :radio="radio4"/>
            <RadioBox class='right bottom' :radio="radio5"/>
            <RadioBox class='bottom' :radio="radio6"/>
            <RadioBox class='right' :radio="radio7"/>
            <RadioBox :radio="radio8"/>
        </div>
        <div v-else-if="mode=='edit'" class="edit">
            <div>One line per Freq, 8 max</div>
            <div>Format: COM1,124.7,TWR</div>
            <textarea v-model="textData" rows="8" cols="24">Blah</textarea>
            <div class="actionBar">
                <button @click="onApply">Apply</button>
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
.right {
    border-right: 1px dashed darkgrey;
}
.bottom {
    border-bottom: 1px dashed darkgrey;
}

textarea {
    resize: none;
}

.edit {
    position: relative;
    height:205px;
    font-size: 13px;
}
</style>
