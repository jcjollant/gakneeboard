<script setup>
import { onMounted, ref, watch } from 'vue'
// import { demoPageChecklist } from '../assets/data'

import Header from '../../components/shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'

const emits = defineEmits(['update'])

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data) {
        data.value = newProps.data;
        if (newProps.data.name) title.value = newProps.data.name
        if ('items2' in newProps.data) {
            columns.value = colDouble
        } else {
            columns.value = colSingle
        }
        if( 'theme' in newProps.data) {
            theme.value = 'theme-' + newProps.data.theme
        }
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

const colSingle = 'One Column'
const colDouble = 'Two Columns'
const data = ref(null)
const mode = ref('')
const title = ref('Checklist')
const textData = ref('')
const textData2 = ref('')
const theme = ref('theme-yellow')
let nameBeforeEdit = ''
const columns = ref(colSingle)

function itemsFromList(value) {
    if (value == '') return []
    const items = value.split('\n').map(line => {
        let challenge;
        let response;
        [challenge, response] = line.split('##')
        if (challenge == undefined || response == undefined) return { c: '?', r: '?' }
        // is this a section?
        if (challenge.length == 0) return { s: response }
        return { c: challenge, r: response }
    })
    return items;
}

function listFromItems(items) {
    if (!items) return ''

    // translate items into text
    const list = items.map(item => {
        if ('s' in item) return '##' + item.s;
        return item.c + '##' + item.r
    })
    return list.join('\n')
}

function onApply() {
    // turn textData into a list of items
    const items = itemsFromList(textData.value)
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newData = { name: title.value, items: items }
    if (columns.value == colDouble) {
        const items2 = itemsFromList(textData2.value)
        newData['items2'] = items2;
    }
    if( theme.value.startsWith('theme-')) {
        newData['theme'] = theme.value.substring(6)
    }
    data.value = newData;
    mode.value = ''
    emits('update', newData)
}

function onCancel() {
    mode.value = ''
    title.value = nameBeforeEdit;
}

function onHeaderClick() {
    if (mode.value == '' && data.value) {
        textData.value = listFromItems(data.value.items)
        textData2.value = listFromItems(data.value.items2)
        nameBeforeEdit = title.value
    }
    mode.value = mode.value == 'edit' ? '' : 'edit'
}

function onThemeChange(newTheme) {
    theme.value = newTheme;
}

</script>

<template>
    <div class="contentPage">
        <Header :title="title" :class="{ 'heading': data }" @click="onHeaderClick"></Header>
        <div v-if="mode == 'edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="title" />
            </InputGroup>
            <SelectButton v-model="columns" :options="[colSingle, colDouble]" aria-labelledby="basic" />
            <div class="oneOrTwoLists">
                <Textarea rows="26" cols="48" v-model="textData" class="editList"
                    :class="{ 'smallTextarea': columns == colDouble }" placeholder="Up to 26 items will fit vertically.

Separate Challenge and Response with '##':
Master Switch##ON
Avionics##OFF

Create sections using '##Section Name':
##Left Wing"></Textarea>
                <Textarea v-if="columns == colDouble" rows="26" cols="48" v-model="textData2" class="editList"
                    :class="{ 'smallTextarea': columns == colDouble }"></Textarea>
            </div>
            <ThemeSelector @change="onThemeChange" :theme="theme" />
            <div class="actionBar">
                <Button @click="onCancel" label="Cancel" link></Button>
                <Button icon="pi pi-check" @click="onApply" label="Apply"></Button>
            </div>
        </div>
        <div v-else>
            <div v-if="columns == colSingle">
                <ChecklistViewer v-if="data && data.items" :items="data.items" />
                <div v-else>There are no items in this list yet<br />Click the header to start customizing</div>
            </div>
            <div v-else class="twoLists">
                <div class="leftList">
                    <div v-if="data && data.items.length" v-for="(item, index) in data.items" class="checklist smallFont"
                        :class="(index % 2) ? theme : ''">
                        <div v-if="'s' in item" class="separator">{{ item.s }}</div>
                        <div v-else class="challenge">{{ item.c }}</div>
                        <div class="response">{{ item.r }}</div>
                    </div>
                    <div v-else>Empty</div>
                </div>
                <div class="rightList">
                    <div v-if="data && data.items2 && data.items2.length" v-for="(item, index) in data.items2"
                        class="checklist smallFont" :class="(index % 2) ? theme : ''">
                        <div v-if="'s' in item" class="separator">{{ item.s }}</div>
                        <div v-else class="challenge">{{ item.c }}</div>
                        <div class="response">{{ item.r }}</div>
                    </div>
                    <div v-else>Empty</div>
                </div>
            </div>
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

.smallFont {
    font-size: 0.9rem;
}

.challenge {
    text-align: left;
    padding-left: 10px;
    border-right: 1px solid lightgrey;
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
    flex-flow: column;
    gap: 10px;
    padding: 5px;
}

.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
}

.smallTextarea {
    overflow-wrap: normal;
    overflow-x: scroll;
    white-space: pre;
    font-size: 0.8rem;
}

.twoLists {
    display: grid;
    grid-template-columns: 49% 49%;
    gap: 2%;
    /* width: 100%; */
}

.leftList {
    border-right: 1px solid lightgrey;

}

.rightList {
    border-left: 1px solid lightgrey;
}

.oneOrTwoLists {
    display: flex;
    gap: 5px;
}

</style>