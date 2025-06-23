<template>
    <div class="contentPage pageChecklist" :class="{'fullpage': isFullPage}">
        <Header :title="page.name" :showReplace="editMode" :page="true"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="editMode" class="settings">
            <div class="nameAndCols">
                <InputGroup>
                    <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                    <InputText v-model="page.name" />
                </InputGroup>
                <div class="columnsChoice">
                    <div>Cols</div>
                    <OneChoice v-model="columns" :choices="[colSingle, colDouble, colTriple]"/>
                </div>
            </div>
            <div class="columns">
                <Textarea v-for="(checklist, index) in [0,1,2]" v-model="textData[index]" v-show="index < columns.value"
                    :PlaceHolder="index == 0 ? getPlaceHolder() : ''"
                    :class="['editList', 'textArea' + (index+1), font]"></Textarea>
            </div>
            <div class="theme">
                <div>Theme</div>
                <ThemeSelector @change="onThemeChange" :theme="theme" />
            </div>
            <div class="font">
                <div>Font</div>
                <FontSizeSelector v-model="font" />
            </div>
            <ActionBar @cancel="onCancel" @apply="onApply" :help="UserUrl.checklistGuide" />
        </div>
        <div v-else class="viewMode">
            <div class="columns">
                <ChecklistViewer v-for="(checklist,index) in page.lists" :list="checklist" :theme="theme" :font="font"
                    :size="columns.value" :class="['list','list'+index]" />
            </div>
            <div v-if="version > 0" class="version">v{{version}}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Checklist } from '../../model/Checklist'
import { ChecklistPage } from '../../model/ChecklistPage'
import { UserUrl } from '../../lib/UserUrl'
import { TemplateFormat } from '../../model/TemplateFormat'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import FontSizeSelector from './FontSizeSelector.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import OneChoice from '../shared/OneChoice.vue'

class Column {
    label: string
    value: number
    title: string|undefined
    constructor(label: string, value: number, title: string|undefined = undefined) {
        this.label = label
        this.value = value
        this.title = title
    }
}
const colSingle = new Column('1', 1)
const colDouble = new Column('2', 2)
const colTriple = new Column('3', 3)
const columns = ref<Column>(colSingle)
const editMode = ref(false)
// Default to medium font
const font = ref('font-medium')
let fontBeforeEdit = 'font-medium'
const emits = defineEmits(['replace','update'])
let nameBeforeEdit = ''
const page = ref<ChecklistPage>(new ChecklistPage())
const props = defineProps({
    data: { type: Object, default: null },
    version: { type: Number, default: 0 },
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)
const textData = ref(['','',''])
const theme = ref('theme-yellow')
let themeBeforeEdit = 'theme-yellow'
const version = ref(props.version)

// Props management
function loadProps(newProps:any) {
    // console.log('[ChecklistPage.loadProps]', newProps)
    const newPage = new ChecklistPage()
    if (newProps.data) {
        if(newProps.data.name) {
            newPage.name = newProps.data.name
        } else {
            editMode.value = true
        }

        newPage.addListFromParams(newProps.data.items)

        if('items2' in newProps.data) {
            newPage.addListFromParams(newProps.data.items2)
            if('items3' in newProps.data) {
                newPage.addListFromParams(newProps.data.items3)
                columns.value = colTriple
            } else {
                columns.value = colDouble
            }
        } else {
            columns.value = colSingle
        }
        // console.log('[ChecklistPage.loadProps] columns', columns.value)
        // console.log('[ChecklistPage.loadProps] newPage', newPage)

        // Restore theme and font
        if( 'theme' in newProps.data) {
            theme.value = 'theme-' + newProps.data.theme
        } else {
            theme.value = 'theme-yellow'
        }
        if( 'font' in newProps.data) {
            font.value = 'font-' + newProps.data.font
        } else {
            font.value = 'font-medium'
        }
    }
    page.value = newPage
    version.value = newProps.version
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    // console.log('[ChecklistPage.watch]')
    loadProps(props)
})

// watch(fontSize, () => {
//     console.log('[CheclistPage.watch fontClass]', fontSize.value)
// })

// End of props management

function getPlaceHolder() {
    // Figure out how many items fit in a list from XL to XS starting with KB format
    const items = [[43,57],[38,51],[35,46],[31,41],[27,36]];
    const fontSizes = ['font-smaller', 'font-small', 'font-medium', 'font-large', 'font-larger']
    const fontIndex = Math.max(fontSizes.indexOf(font.value),0)
    return `Up to ${items[fontIndex][isFullPage.value?1:0]} items will fit vertically.

Separate Challenge and Response with '##':
Master Switch##ON
Avionics##OFF

Create sections using '##Section Name':
##Left Wing`
}

function onApply() {
    // turn textData into a list of items
    const newData = { name: page.value.name}

    page.value.removeAllLists()
    for(let index = 0; index < columns.value.value; index++) {
        const checklist = new Checklist()
        checklist.parseEditor(textData.value[index])
        page.value.addList(checklist)
        
        const key = 'items' + (index == 0 ? '' : index + 1)
        newData[key] = page.value.lists[index].toParams()
    }
    // simplify values for theme and font
    newData['theme'] = theme.value.replace('theme-', '')
    newData['font'] = font.value.replace('font-', '')
    // console.log('[ChecklistPage.onApply] newData', newData)

    editMode.value = false

    emits('update', newData)
}

function onCancel() {
    editMode.value = false
    page.value.name = nameBeforeEdit;
    theme.value = themeBeforeEdit;
    font.value = fontBeforeEdit;
}

function onHeaderClick() {
    if(editMode.value) return;

    for(let index = 0; index < page.value.lists.length; index++) {
        textData.value[index] = page.value.lists[index].toEditor()
    }
    nameBeforeEdit = page.value.name
    themeBeforeEdit = theme.value
    fontBeforeEdit = font.value
    editMode.value = true
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
    grid-template-rows: 2.5rem auto 2rem 2rem 50px;
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

.fullpage .viewMode {
    height: var(--fullpage-content);
}

.nameAndCols {
    display: flex;
    gap: 10px;
}
.theme, .font {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 5px;
    align-items: center;
}
</style>
