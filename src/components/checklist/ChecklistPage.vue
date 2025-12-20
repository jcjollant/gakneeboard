<template>
    <div class="contentPage pageChecklist" :class="{'fullpage': isFullPage}">
        <Header :title="page.name" :showReplace="true" :page="true" leftButton="settings"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="editMode" class="settings">
            <div class="nameAndCols">
                <InputGroup>
                    <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                    <InputText v-model="page.name" />
                </InputGroup>
                <div class="columnsChoice" title="Number of columns on the checklist page">
                    <OneChoice v-model="columnsChoice" :choices="[choiceSingle, choiceDouble, choiceTriple]"/>
                    <div>Cols</div>
                </div>
            </div>
            <div class="editChoice">
                <OneChoice v-model="choosenEditing" :choices="choicesEditing"/> 
                <div class="columnsChoice">
                    <div>Mode</div>
                    <OneChoice v-model="choosenEditorMode" :choices="[choiceEditorModeUi, choiceEditorModeText]"/>
                </div>
            </div>
            <ChecklistEditor 
                :ref="(el: any) => editorRefs[0] = el"
                v-model="editorChecklist"
                :mode="checklistEditorMode"
                :class="['editList', 'editor']" 
                @active="onEditorActive(0)" />
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
                    :size="columnsChoice.value" :class="['list','list'+index]" />
            </div>
            <!-- <div v-if="version > 0" class="version">v{{version}}</div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Checklist } from '../../models/Checklist'
import { ChecklistService } from '../../services/ChecklistService'
import { ChecklistPage } from '../../models/ChecklistPage'
import { UserUrl } from '../../lib/UserUrl'
import { TemplateFormat } from '../../models/TemplateFormat'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistEditor from './ChecklistEditor.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import FontSizeSelector from './FontSizeSelector.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OneChoice from '../shared/OneChoice.vue'

class ChoiceColumnCount {
    label: string
    value: number
    title: string|undefined
    constructor(label: string, value: number, title: string|undefined = undefined) {
        this.label = label
        this.value = value
        this.title = title ?? 'Use ' + value + ' column(s)'
    }
}
const choiceSingle = new ChoiceColumnCount('1', 1)
const choiceDouble = new ChoiceColumnCount('2', 2)
const choiceTriple = new ChoiceColumnCount('3', 3)
const columnsChoice = ref<ChoiceColumnCount>(choiceSingle)
const columnsCount = computed(() => columnsChoice.value.value)

class ChoiceEditing {
    label: string
    value: number
    title: string|undefined
    constructor(label: string, value: number, title: string|undefined = undefined) {
        this.label = label
        this.value = value
        this.title = title ?? 'Edit ' + label
    }
}
// default to the first column
const choosenEditing = ref<ChoiceEditing>(new ChoiceEditing('Left', 0))
// build a dynamic list of choices based on the number of columns
const choicesEditing = computed(() => {
    const choices = [new ChoiceEditing('Left', 0)]
    if (columnsCount.value === 2) {
        choices.push(new ChoiceEditing('Right', 1))
    } else if (columnsCount.value === 3) {
        choices.push(new ChoiceEditing('Middle', 1))
        choices.push(new ChoiceEditing('Right', 2))
    }
    return choices
})

watch(columnsCount, () => {
    choosenEditing.value = choicesEditing.value[0]
})

const editorChecklist = computed({
    get: () => { 
        // console.debug('[ChecklistPage.editorChecklist]', checklistData.value[choosenEditing.value.value]); 
        return checklistData.value[choosenEditing.value.value] 
    },
    set: (val: Checklist) => {
        checklistData.value[choosenEditing.value.value] = val;
    }
})
const choiceEditorModeUi = new ChoiceColumnCount('UI', 0, 'UI Mode')
const choiceEditorModeText = new ChoiceColumnCount('Text', 1, 'Text Mode')
const choosenEditorMode = ref(choiceEditorModeUi)
const checklistEditorMode = computed(() => ['ui', 'text'][choosenEditorMode.value.value])

const editMode = ref(false)

// Default to medium font
const font = ref('font-medium')
let fontBeforeEdit = 'font-medium'
const emits = defineEmits(['replace','update'])
let nameBeforeEdit = ''
const page = ref<ChecklistPage>(new ChecklistPage())
const props = defineProps({
    data: { type: Object, default: null },
    // version: { type: Number, default: 0 },
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)
const checklistData = ref<Checklist[]>([new Checklist(), new Checklist(), new Checklist()])
const theme = ref('theme-yellow')
let themeBeforeEdit = 'theme-yellow'
// const version = ref(props.version)

const editorRefs = ref<any[]>([])

function onEditorActive(activeIndex: number) {
    editorRefs.value.forEach((editor, index) => {
        if (index !== activeIndex && editor) {
             // Access the exposed method
             editor.stopEditing();
        }
    })
}

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
                columnsChoice.value = choiceTriple
            } else {
                columnsChoice.value = choiceDouble
            }
        } else {
            columnsChoice.value = choiceSingle
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
    // version.value = newProps.version
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
    const newData: any = { name: page.value.name}

    page.value.removeAllLists()
    for(let index = 0; index < columnsChoice.value.value; index++) {
        // const checklist = ChecklistService.parseEditor(textData.value[index])
        // page.value.addList(checklist)
        page.value.addList(checklistData.value[index])
        
        const key = 'items' + (index == 0 ? '' : index + 1)
        newData[key] = ChecklistService.toParams(page.value.lists[index])
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
    // Back to UI mode by default
    choosenEditorMode.value = choiceEditorModeUi;
}

function onHeaderClick() {
    if(editMode.value) return;

    for(let index = 0; index < page.value.lists.length; index++) {
        // Clone the checklist to avoid direct mutation
        // We can use toParams/parseParams to clone
        const params = ChecklistService.toParams(page.value.lists[index]);
        checklistData.value[index] = ChecklistService.parseParams(params);
    }
    nameBeforeEdit = page.value.name
    themeBeforeEdit = theme.value
    fontBeforeEdit = font.value
    editMode.value = true
}

function onThemeChange(newTheme: string) {
    theme.value = newTheme;
}

</script>

<style scoped>
.checklistNameAddon {
    width: 4rem;
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
    grid-template-rows: 2.5rem 2rem 1fr 2rem 2rem 50px;
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

.nameAndCols, .editChoice {
    display: flex;
    gap: 10px;
    height: 2rem;
    align-items: center;
    padding: 5px;
    justify-content: space-between;
}
.theme, .font {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 5px;
    align-items: center;
}
</style>
