<template>
    <div class="settings" :class="{ 'isTile': isTile }">
        <div class="nameAndCols">
            <InputGroup>
                <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                <InputText v-model="localName" />
            </InputGroup>
            <div class="columnsChoice">
                <OneChoice v-model="choosenEditorMode" :choices="[choiceEditorModeUi, choiceEditorModeText]"/>
            </div>
        </div>

        
        <div class="editors-container" :class="'cols-'+columnsCount">
            <div v-for="index in columnsCount" :key="index" class="editor-wrapper">
                <ChecklistEditor 
                    v-model="checklistData[index-1]"
                    :mode="checklistEditorMode"
                    @update:modelValue="onEditorUpdate(index-1, $event)"
                    :class="['editList', 'editor']" />
            </div>
        </div>

        <div class="theme">
            <div>Theme</div>
            <ChecklistThemeSelector v-model="theme" />
        </div>
        <div v-if="isTile" class="displayMode">
            <div>Display</div>
            <OneChoice v-model="displayModeChoice" :choices="[choiceDisplayFullObj, choiceDisplayCompact]"/>
        </div>
        <div v-if="!isTile" class="footer-settings">
            <div class="font">
                <div>Font</div>
                <FontSizeSelector v-model="font" />
            </div>
            <div class="columnsChoice" title="Number of columns on the checklist page">
                <div>Columns</div>
                <OneChoice v-model="columnsChoice" :choices="[choiceSingle, choiceDouble, choiceTriple]"/>
            </div>
        </div>
        <!-- ActionBar is not needed here as it will be in the parent container (TileSettings or ChecklistPage) -->
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Checklist, ChecklistFont, ChecklistTheme } from '../../models/Checklist'
import { DisplayModeChecklist } from '../../models/DisplayMode'
import { ChecklistService } from '../../services/ChecklistService'
import { ChecklistSettingsParams } from '../../models/ChecklistSettingsParams'
import { OneChoiceValue } from '../../models/OneChoiceValue';

import ChecklistEditor from './ChecklistEditor.vue'
import FontSizeSelector from './FontSizeSelector.vue'
import ChecklistThemeSelector from './ChecklistThemeSelector.vue'

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

const props = defineProps({
    params: { type: ChecklistSettingsParams, required: true }
})

const emits = defineEmits(['update'])

// State
const localName = ref('')
const theme = ref(ChecklistTheme.yellow)
const font = ref(ChecklistFont.medium)
const displayMode = ref(DisplayModeChecklist.Full)
const checklistData = ref<Checklist[]>([new Checklist(), new Checklist(), new Checklist()])

// Display choices
const choiceDisplayFullObj = new OneChoiceValue('Full', DisplayModeChecklist.Full, 'Full view')
const choiceDisplayCompact = new OneChoiceValue('Compact', DisplayModeChecklist.Compact, 'Compact view')
const displayModeChoice = ref<OneChoiceValue>(choiceDisplayFullObj) 

const columnsChoice = ref<ChoiceColumnCount>(choiceSingle)
// Use params.isTile directly or via a computed if reactivity is needed (though params prop should be reactive)
const isTile = computed(() => props.params.isTile)
const columnsCount = computed(() => isTile.value ? 1 : columnsChoice.value.value)

function onEditorUpdate(index: number, val: Checklist) {
    checklistData.value[index] = val;
    emitUpdate()
}

// Editor Mode Logic
const choiceEditorModeUi = new ChoiceColumnCount('fa-solid fa-eye', 0, 'Visual Editor')
const choiceEditorModeText = new ChoiceColumnCount('fa-solid fa-file-code', 1, 'Text Editor')
const choosenEditorMode = ref(choiceEditorModeUi)
const checklistEditorMode = computed(() => ['ui', 'text'][choosenEditorMode.value.value])

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
    theme.value = params.theme
    font.value = params.font
    displayMode.value = params.displayMode 
    displayModeChoice.value = params.displayMode === DisplayModeChecklist.Compact ? choiceDisplayCompact : choiceDisplayFullObj

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

// Watchers for simple values to emit updates
watch([localName, theme, font, columnsChoice, displayModeChoice], () => {
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
        theme.value,
        font.value,
        isTile.value,
        displayModeChoice.value.value // Use the value from the choice object
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

.theme, .font, .displayMode {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 5px;
    align-items: center;
}

.editors-container {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    width: 100%;
    /* Ensure it takes available height but leaves room for header/footer */
    flex: 1; 
    min-height: 200px;
    scroll-snap-type: x mandatory; /* Optional: Adds snap scrolling */
}

.editor-wrapper {
    flex: 0 0 100%; /* Force full width, don't grow/shrink */
    min-width: 100%; 
    display: flex;
    flex-direction: column;
    scroll-snap-align: start; /* Snap to start */
}

/* If we have only 1 column, it should just fill */
.cols-1 .editor-wrapper {
    min-width: 100%;
}

.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
    width: 100%;
    height: 100%; /* Fill wrapper */
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: hidden; /* Scroll handled by container or component? Component likely handles y-scroll */
}

.footer-settings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}
</style>
