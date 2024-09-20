<script setup>
import { onMounted, ref, watch } from 'vue'
// import { demoPageChecklist } from '../assets/data'
import { urlGuideChecklist } from '../../assets/data'
import { itemsFromList, listFromItems } from '../../assets/checklist'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import OneChoice from '../shared/OneChoice.vue'

const emits = defineEmits(['replace','update'])

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
        } else {
            theme.value = 'theme-yellow'
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

const colSingle = {label:'One Column', value:1}
const colDouble = {label:'Two Columns', value:2}
const data = ref(null)
const mode = ref('')
const title = ref('Checklist')
const textData = ref('')
const textData2 = ref('')
const theme = ref('theme-yellow')
let nameBeforeEdit = ''
let themeBeforeEdit = 'theme-yellow'
const columns = ref(colSingle)

function onApply() {
    // turn textData into a list of items
    const items = itemsFromList(textData.value)
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newData = { name: title.value, items: items }
    if (columns.value.value == 2) {
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
    theme.value = themeBeforeEdit;
}

function onHeaderClick() {
    if (mode.value == '' && data.value) {
        textData.value = listFromItems(data.value.items)
        textData2.value = listFromItems(data.value.items2)
        nameBeforeEdit = title.value
        themeBeforeEdit = theme.value
    }
    mode.value = mode.value == 'edit' ? '' : 'edit'
}

function onThemeChange(newTheme) {
    theme.value = newTheme;
}

</script>

<template>
    <div class="contentPage pageChecklist">
        <Header :title="title" :hideReplace="mode!='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="mode == 'edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="title" />
            </InputGroup>
            <OneChoice v-model="columns" :choices="[colSingle, colDouble]" class="centered"/>
            <div class="oneOrTwoLists">
                <Textarea rows="32" cols="48" v-model="textData" class="editList"
                    :class="{ 'smallTextarea': columns.value == 2 }" placeholder="Up to 32 items will fit vertically.

Separate Challenge and Response with '##':
Master Switch##ON
Avionics##OFF

Create sections using '##Section Name':
##Left Wing"></Textarea>
                <Textarea v-if="columns.value == 2" rows="32" cols="48" v-model="textData2" class="editList smallText"></Textarea>
            </div>
            <ThemeSelector @change="onThemeChange" :theme="theme" />
            <ActionBar @cancel="onCancel" @apply="onApply" :help="urlGuideChecklist" />
        </div>
        <div v-else class="viewMode">
            <div v-if="columns.value == 1">
                <ChecklistViewer :items="data ? data.items : []" :theme="theme" />
            </div>
            <div v-else class="twoLists">
                <div class="leftList">
                    <ChecklistViewer :items="data ? data.items : []" :theme="theme" :small="true" />
                </div>
                <div class="rightList">
                    <ChecklistViewer :items="data ? data.items2 : []" :theme="theme" :small="true" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.checklistNameAddon {
    width: 3rem;
}
.centered {
    margin: auto;
}
.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
}
.heading {
    font-weight: bolder;
    font-size: 1.2rem;
}


.leftList {
    border-right: 1px solid lightgrey;

}
.pageChecklist {
    overflow: hidden;
}

.settings {
    height:100%;
    display: grid;
    gap: 5px;
    padding: 5px;
    grid-template-rows: 2.5rem 2.5rem auto 2rem 50px;
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
    height: 100%;
}

.oneOrTwoLists {
    display: flex;
    gap: 5px;
}

.rightList {
    border-left: 1px solid lightgrey;
}


.viewMode {
    height: 100%;
}
</style>