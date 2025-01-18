<template>
    <div class="contentPage pageChecklist">
        <Header :title="title" :hideReplace="mode!='edit'" :page="true"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="mode == 'edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="title" />
            </InputGroup>
            <div class="columnsChoice">
                <div>Columns</div>
                <OneChoice v-model="columns" :choices="[colSingle, colDouble, colTriple]"/>
            </div>
            <div class="columns">
                <Textarea v-model="textData" :placeholder="getPlaceHolder()"
                    class="editList textArea1" :class="'text' + columns.value" ></Textarea>
                <Textarea v-if="columns.value > 1" v-model="textData2" 
                    class="editList textArea2" :class="'text' + columns.value"></Textarea>
                <Textarea v-if="columns.value > 2" v-model="textData3" 
                    class="editList textArea3" :class="'text' + columns.value"></Textarea>
            </div>
            <ThemeSelector @change="onThemeChange" :theme="theme" />
            <ActionBar @cancel="onCancel" @apply="onApply" :help="UserUrl.checklistGuide" />
        </div>
        <div v-else class="viewMode">
            <div class="columns">
                <ChecklistViewer class="list list0"
                    :items="data?.items" :theme="theme" :size="columns.value" />
                <ChecklistViewer v-if="columns.value > 1" class="list list1"
                    :items="data?.items2" :theme="theme" :size="columns.value" />
                <ChecklistViewer v-if="columns.value > 2" class="list list2"
                    :items="data?.items3" :theme="theme" :size="columns.value" />
            </div>
            <div v-if="version > 0" class="version">v{{version}}</div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { itemsFromList, listFromItems } from '@/assets/checklist'
import { UserUrl } from '@/lib/UserUrl'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import OneChoice from '../shared/OneChoice.vue'

const colSingle = {label:'One', value:1}
const colDouble = {label:'Two', value:2}
const colTriple = {label:'Three', value:3}
const columns = ref(colSingle)
const data = ref(null)
const emits = defineEmits(['replace','update'])
let nameBeforeEdit = ''
const mode = ref('')
const props = defineProps({
    data: { type: Object, default: null },
    version: { type: Number, default: 0 }
})
const title = ref('Checklist')
const textData = ref('')
const textData2 = ref('')
const textData3 = ref('')
const theme = ref('theme-yellow')
let themeBeforeEdit = 'theme-yellow'
const version = ref(props.version)

// Props management
function loadProps(newProps) {
    // console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if (newProps.data) {
        data.value = newProps.data;
        if (newProps.data.name) title.value = newProps.data.name
        // restore view mode
        if('items3' in newProps.data) {
            columns.value = colTriple
        } else if ('items2' in newProps.data) {
            columns.value = colDouble
        } else {
            columns.value = colSingle
        }
        // Restore theme
        if( 'theme' in newProps.data) {
            theme.value = 'theme-' + newProps.data.theme
        } else {
            theme.value = 'theme-yellow'
        }
    } else {
        data.value = null
    }
    version.value = newProps.version
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    // console.log('[ChecklistPage.watch]')
    loadProps(props)
})

// End of props management

function getPlaceHolder() {
    const items = columns.value.value == 1 ? 33 : columns.value.value == 2 ? 35 : 40;
    return `Up to ${items} items will fit vertically.

Separate Challenge and Response with '##':
Master Switch##ON
Avionics##OFF

Create sections using '##Section Name':
##Left Wing`
}

function onApply() {
    // turn textData into a list of items
    const items = itemsFromList(textData.value)
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newData = { name: title.value, items: items }
    // Collect data from different textArea
    if (columns.value.value > 1) {
        const items2 = itemsFromList(textData2.value)
        newData['items2'] = items2;
        // console.log('[ChecklistPage.onApply] items2', JSON.stringify(items2))
    }
    if(columns.value.value > 2) {
        const items3 = itemsFromList(textData3.value)
        newData['items3'] = items3;
        // console.log('[ChecklistPage.onApply] items3', JSON.stringify(items3))
    }
    // save theme
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
        textData3.value = listFromItems(data.value.items3)
        nameBeforeEdit = title.value
        themeBeforeEdit = theme.value
        mode.value = 'edit'
    }
}

function onThemeChange(newTheme) {
    theme.value = newTheme;
}

</script>

<style scoped>
.checklistNameAddon {
    width: 3rem;
}
.centered {
    margin: auto;
}
.columns {
    display: flex;
    gap: 2px;
    height:100%;
    align-items: stretch;
}
.columnsChoice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
    width: 100%;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: scroll;
}
.heading {
    font-weight: bolder;
    font-size: 1.2rem;
}

.list {
    width: 100%;
}

.list0 {
    border-right: 1px solid lightgrey;
}

.list1 {
    border-left: 1px solid lightgrey;
    border-right: 1px solid lightgrey;
}

.list2 {
    border-left: 1px solid lightgrey;
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

.text2 {
    font-size: 0.8rem;
}

.text3 {
    font-size: 0.7rem;
}
.twoLists {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    height: 100%;
}

.threeLists {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    height: 100%;
}


.version {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 1rem;
    color: #666;
}
.viewMode {
    height: var(--page-content);
}
</style>