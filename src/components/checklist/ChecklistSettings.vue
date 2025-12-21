<template>
    <div class="settings" :class="{ 'isTile': isTile }">
        <div class="nameAndCols">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="localName" />
            </InputGroup>
            <div class="columnsChoice">
                <div>Editor</div>
                <OneChoice v-model="choosenEditorMode" :choices="[choiceEditorModeUi, choiceEditorModeText]"/>
            </div>
        </div>
        <div v-if="!isTile" class="editChoice">
            <div class="columnsChoice" title="Number of columns on the checklist page">
                <div>Columns</div>
                <OneChoice v-model="columnsChoice" :choices="[choiceSingle, choiceDouble, choiceTriple]"/>
            </div>
            <div class="columnsChoice" v-if="choicesEditing.length > 1" >
                <div>Editing</div>
                <OneChoice v-model="choosenEditing" :choices="choicesEditing"/> 
            </div>
        </div>
        <ChecklistEditor 
            :ref="(el: any) => editorRef = el"
            v-model="editorChecklist"
            :mode="checklistEditorMode"
            :class="['editList', 'editor']" />
        <div class="theme">
            <div>Theme</div>
            <ThemeSelector @change="onThemeChange" :theme="theme" />
        </div>
        <div v-if="!isTile" class="font">
            <div>Font</div>
            <FontSizeSelector v-model="font" />
        </div>
        <!-- ActionBar is not needed here as it will be in the parent container (TileSettings or ChecklistPage) -->
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Checklist } from '../../models/Checklist'
import { ChecklistService } from '../../services/ChecklistService'
import { ChecklistSettingsParams } from '../../models/ChecklistSettingsParams'

import ChecklistEditor from './ChecklistEditor.vue'
import FontSizeSelector from './FontSizeSelector.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import OneChoice from '../shared/OneChoice.vue'

// Helper Classes for Choices (Copied from ChecklistPage)
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

const props = defineProps({
    params: { type: ChecklistSettingsParams, required: true }
})

const emits = defineEmits(['update'])

// State
const localName = ref('')
const theme = ref('theme-yellow')
const font = ref('font-medium')
const checklistData = ref<Checklist[]>([new Checklist(), new Checklist(), new Checklist()])

const columnsChoice = ref<ChoiceColumnCount>(choiceSingle)
// Use params.isTile directly or via a computed if reactivity is needed (though params prop should be reactive)
const isTile = computed(() => props.params.isTile)
const columnsCount = computed(() => isTile.value ? 1 : columnsChoice.value.value)

// Editor Selection Logic
const choosenEditing = ref<ChoiceEditing>(new ChoiceEditing('Left', 0))
const choicesEditing = computed(() => {
    const choices = [new ChoiceEditing('Left', 0)]
    if (!isTile.value) {
        if (columnsCount.value === 2) {
            choices.push(new ChoiceEditing('Right', 1))
        } else if (columnsCount.value === 3) {
            choices.push(new ChoiceEditing('Middle', 1))
            choices.push(new ChoiceEditing('Right', 2))
        }
    }
    return choices
})

watch(columnsCount, () => {
    // Reset to first column if count changes
    choosenEditing.value = choicesEditing.value[0]
})

// Editor Data Logic
const editorChecklist = computed({
    get: () => { 
        return checklistData.value[choosenEditing.value.value] 
    },
    set: (val: Checklist) => {
        checklistData.value[choosenEditing.value.value] = val;
        emitUpdate()
    }
})


// Editor Mode Logic
const choiceEditorModeUi = new ChoiceColumnCount('Visual', 0, 'Visual Editor')
const choiceEditorModeText = new ChoiceColumnCount('Text', 1, 'Text Editor')
const choosenEditorMode = ref(choiceEditorModeUi)
const checklistEditorMode = computed(() => ['ui', 'text'][choosenEditorMode.value.value])

const editorRef = ref<any>(null)

// Initialization
onMounted(() => {
    loadFromData(props.params)
})

watch(() => props.params, (newData) => {
    loadFromData(newData)
}, { deep: true })


function loadFromData(params: ChecklistSettingsParams) {
    if (!params) return
    
    // console.log('[ChecklistSettings] loadFromData', params)

    localName.value = params.name || ''
    theme.value = params.theme.startsWith('theme-') ? params.theme : 'theme-' + params.theme
    font.value = params.font.startsWith('font-') ? params.font : 'font-' + params.font

    // Checklists
    // The model expects lists: Checklist[]
    if (params.lists && params.lists.length > 0) {
        // We clone them to avoid direct mutation of props
        checklistData.value = [
            params.lists[0] ? ChecklistService.clone(params.lists[0]) : new Checklist(),
            params.lists[1] ? ChecklistService.clone(params.lists[1]) : new Checklist(),
            params.lists[2] ? ChecklistService.clone(params.lists[2]) : new Checklist()
        ]
    } else {
        // Fallback or empty
        checklistData.value = [new Checklist(), new Checklist(), new Checklist()]
    }

    // Column Count deduction for existing data
    if (!params.isTile) {
        // If we have data in list 2 or 3 implies columns
        if (params.lists && params.lists.length > 2 && params.lists[2].items.length > 0) {
            columnsChoice.value = choiceTriple
        } else if (params.lists && params.lists.length > 1 && params.lists[1].items.length > 0) {
            columnsChoice.value = choiceDouble
        } else {
            columnsChoice.value = choiceSingle
        }
    } else {
        columnsChoice.value = choiceSingle
    }
}

function onThemeChange(newTheme: string) {
    theme.value = newTheme;
    emitUpdate()
}

// Watchers for simple values to emit updates
watch([localName, font, columnsChoice], () => {
    emitUpdate()
})

function emitUpdate() {
    
    // We update the props.params object? No, props are immutable.
    // We emit an update with a NEW params object.
    
    const newLists = [
        checklistData.value[0],
        // Only include other lists if not tile
        (!isTile.value && columnsCount.value >= 2) ? checklistData.value[1] : new Checklist(),
        (!isTile.value && columnsCount.value >= 3) ? checklistData.value[2] : new Checklist()
    ]

    const newParams = new ChecklistSettingsParams(
        localName.value,
        newLists,
        theme.value.replace('theme-', ''),
        font.value.replace('font-', ''),
        isTile.value
    )
    
    emits('update', newParams)
    
    if (tileSettingsUpdate) {
        tileSettingsUpdate(newParams)
    }
}

import { inject } from 'vue'
const tileSettingsUpdate = inject('tileSettingsUpdate', null) as ((data: any) => void) | null;

</script>

<style scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
}

.settings.isTile {
    height: 600px;
}

.nameAndCols, .editChoice {
    display: flex;
    gap: 10px;
    height: 2rem;
    align-items: center;
    justify-content: space-between;
}

.checklistNameAddon {
    width: 4rem;
}

.columnsChoice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.theme, .font {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 5px;
    align-items: center;
}

.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
    width: 100%;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: scroll;
}
</style>
