<script setup>
import { ref, onMounted, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon';

const emits = defineEmits(['updating', 'updated'])

const props = defineProps({
    code: { type: String, default: ''},
    name: { type: String, default: ''},
    label: { type: String, default: 'Code'}
})

const code = ref()
const name = ref()
let pendingCode = null // used during the short delay between code update and actual request

function loadProps(props) {
    code.value = props.code
    name.value = props.name
}

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})



// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    // console.log('[AirportEdit.onCodeUpdate]',Date.now())
    emits('updating')
    name.value = ' '

    pendingCode = code.value
    // only load the new code after a short delay to avoid sending useless query
    if( pendingCode.length > 2) {
        setTimeout( () => {
            // check if code has not changed
            if( pendingCode == code.value) {
                pendingCode = null
                emits('updated', code.value)
            }
        }, 500)
    }
}


</script>

<template>
    <div class="airportCode">
        <InputGroup>
            <InputGroupAddon>{{label}}</InputGroupAddon>
            <InputText v-model="code" @input="onCodeUpdate"/>
        </InputGroup>
        <span class="airportName">{{ name }}</span>
    </div>
</template>

<style scoped>
    .airportCode {
        display: grid;
        grid-template-columns: 100px 140px;
        font-size: 0.8rem;
        line-height: 1.5rem;
        text-align: left;
        gap:5px;
    }
    .airportName {
        overflow: hidden;
        line-height: 1.5rem;
        height: 1.5rem;
        font-size: 0.7rem;
    }

    :deep(.p-component), :deep(.p-inputgroup-addon) {
        font-size: 0.8rem;
        height: 1.5rem;
        
    }
    :deep(.p-inputgroup-addon) {
        width: 3rem;
    }
    :deep(.p-inputtext) {
        padding: 5px;
    }
</style>