<script setup>
import { onMounted, ref, watch } from 'vue'
// import { demoPageChecklist } from '../assets/data'

import Header from '../components/shared/Header.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const emits = defineEmits(['update'])

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data && newProps.data.name) {
        data.value = newProps.data;
        title.value = newProps.data.name
    } else {
        data.value = null
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management

const data = ref(null)
const mode = ref('')
const title = ref('Checklist')
const textData = ref('')
let nameBeforeEdit = ''

function onApply() {
    // turn textData into a list of items
    const items = textData.value.split('\n').map( line => {
        let challenge;
        let response;
        [challenge,response] = line.split('##')
        if(challenge == undefined || response == undefined) return {c:'?',r:'?'}
        // is this a section?
        if(challenge.length == 0) return {s:response}
        return {c:challenge, r:response}
    })
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newData = {name:title.value,items:items}
    data.value = newData;
    mode.value = ''
    emits('update', newData)
}

function onCancel() {
    mode.value = ''
    title.value = nameBeforeEdit;
}

function onHeaderClick() {
    if(mode.value == '' && data.value && data.value.items) {
        // translate items into text
        const list = data.value.items.map( item => {
            if( 's' in item) return '##' + item.s;
            return item.c + '##' + item.r
        })
        textData.value = list.join('\n')
        nameBeforeEdit = title.value
    }
    mode.value = mode.value == 'edit' ? '' : 'edit'
}

</script>

<template>
    <div class="contentPage">
        <Header :title="title" :class="{'heading':data}"
            @click="onHeaderClick"></Header>
        <div v-if="mode == 'edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="title"/>
            </InputGroup>
            <Textarea rows="26" cols="48" v-model="textData" class="editList"
                placeholder="Up to 26 items will fit vertically.

Separate Challenge and Response with '##':
Master Switch##ON
Avionics##OFF

Create sections using '##Section Name':
##Left Wing"></Textarea>
            <div class="actionBar">
                <Button @click="onCancel" label="Cancel" link></Button>
                <Button icon="pi pi-check" @click="onApply" label="Apply"></Button>
            </div>
        </div>
        <div v-else>
            <div v-if="data" v-for="(item, index) in data.items" class="checklist" :class="{ 'even': index % 2 }">
                <div v-if="'s' in item" class="separator">{{ item.s }}</div>
                <div v-else class="challenge">{{ item.c }}</div>
                <div class="response">{{ item.r }}</div>
            </div>
            <div v-else>There are no items in this list yet<br/>Click the header to start customizing</div>
        </div>
    </div>
</template>

<style scoped>
.contentPage {
    overflow: hidden;
}

.checklist {
    display: grid;
    grid-template-columns: 70% 30%;
    line-height: 1.6rem;
    border-bottom: 1px solid lightgrey;
}

.challenge {
    text-align: left;
    padding-left: 10px;
    border-right: 1px solid lightgrey;
}

.even {
    background: lightyellow;
}

.response {
    font-weight: bold;
}

.separator {
    font-weight: bolder;
    color: darkgrey;
    background: white;
    grid-column: 1 / span 2;

}

.heading {
    font-weight: bolder;
    font-size: 1.2rem;
}

.checklistNameAddon {
    width: 3rem;
}
.settings {
    display: flex;
    flex-flow:column;
    gap:10px;
    padding: 5px;
}
.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
}
</style>