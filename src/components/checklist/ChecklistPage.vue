<template>
    <div class="contentPage pageChecklist" :class="{'fullpage': isFullPage}">
        <Header :title="page.name" :showReplace="true" :page="true" leftButton="settings"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="editMode" class="settings-container">
            <ChecklistSettings 
                :params="settingsData" 
                class="settings-embedded"
                @update="onSettingsUpdate" />
            <ActionBar @cancel="onCancel" @apply="onApply" :help="UserUrl.checklistGuide" />
        </div>
        <div v-else class="viewMode">
            <div class="columns">
                <ChecklistViewer v-for="(checklist,index) in page.lists" :list="checklist" :theme="getTheme(data)" :font="data?.font ? ('font-' + data.font) : 'font-medium'"
                    :size="getColumnCount()" :class="['list','list'+index]" />
            </div>
            <!-- <div v-if="version > 0" class="version">v{{version}}</div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ChecklistService } from '../../services/ChecklistService'
import { ChecklistPage } from '../../models/ChecklistPage'
import { UserUrl } from '../../lib/UserUrl'
import { TemplateFormat } from '../../models/TemplateFormat'
import { ChecklistSettingsParams } from '../../models/ChecklistSettingsParams'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistSettings from './ChecklistSettings.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'

const editMode = ref(false)

// We need a temporary holding place for the updated config before applying
const pendingUpdate = ref<any>(null)

const font = ref('font-medium')
let fontBeforeEdit = 'font-medium'
const emits = defineEmits(['replace','update'])
const theme = ref('theme-yellow')
const page = ref<ChecklistPage>(new ChecklistPage())
const props = defineProps({
    data: { type: Object, default: null },
    // version: { type: Number, default: 0 },
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)

// Props management
function getTheme(data: any): string {
    if (data && data.theme) {
        return 'theme-' + data.theme
    }
    return 'theme-yellow'
}

function getColumnCount(): number {
    return page.value.lists.length || 1
}

function loadProps(newProps:any) {
    // console.log('[ChecklistPage.loadProps]', newProps)
    const newPage = new ChecklistPage()
    if (newProps.data) {
        if(newProps.data.name) {
            newPage.name = newProps.data.name
            editMode.value = false
        } else {
            editMode.value = true
        }

        newPage.addListFromParams(newProps.data.items)

        if('items2' in newProps.data) {
            newPage.addListFromParams(newProps.data.items2)
            if('items3' in newProps.data) {
                newPage.addListFromParams(newProps.data.items3)
                // columnsChoice.value = choiceTriple
            } else {
                // columnsChoice.value = choiceDouble
            }
        } else {
            // columnsChoice.value = choiceSingle
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
    
    if(editMode.value) {
         settingsData.value = new ChecklistSettingsParams(
            page.value.name,
            page.value.lists,
            theme.value,
            font.value,
            false
        );
    }
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

function onSettingsUpdate(newData: any) {
    // console.log('[ChecklistPage.onSettingsUpdate]', newData)
    pendingUpdate.value = newData
}

function onApply() {
    if (!pendingUpdate.value) {
        editMode.value = false
        return;
    }

    const newData = pendingUpdate.value

    // Apply local changes for immediate feedback if needed, although we are re-emitting
    // page.value.name = newData.name
    // theme.value = 'theme-' + newData.theme
    // font.value = 'font-' + newData.font
    // ... logic to update page.value.lists based on newData.items ...

    // Actually, onApply usually emits the whole structure to the parent (App or Workspace) to save
    // transform newData back to expected format if needed
    // ChecklistSettings emit 'update' with {name, theme, font, items, items2, items3}
    
    // We need to ensure we honor the column choice which is embedded in the presence of items2/3
    
    // Transform ChecklistSettingsParams (lists) to Template format (items, items2, items3)
    const templateData: any = {
        name: newData.name,
        theme: newData.theme,
        font: newData.font
    }

    if (newData.lists && newData.lists.length > 0) {
        templateData.items = ChecklistService.toParams(newData.lists[0])
        
        // If we have more than 1 column (implied by content in lists 1/2)
        // ChecklistSettings ensures proper lists are populated based on column choice
        if (newData.lists.length > 1 && newData.lists[1].items.length > 0) {
            templateData.items2 = ChecklistService.toParams(newData.lists[1])
        }
        if (newData.lists.length > 2 && newData.lists[2].items.length > 0) {
            templateData.items3 = ChecklistService.toParams(newData.lists[2])
        }
    }

    emits('update', templateData)
    editMode.value = false
}

function onCancel() {
    editMode.value = false
    // Reset any local state if needed
    pendingUpdate.value = null
}

// Data to be passed to Settings
const settingsData = ref<any>(null)

function onHeaderClick() {
    if(editMode.value) return;

    // Prepare data directly compatible with ChecklistSettings
    // Prepare data directly compatible with ChecklistSettings
    settingsData.value = new ChecklistSettingsParams(
        page.value.name,
        page.value.lists,
        theme.value,
        font.value,
        false
    );
    
    editMode.value = true
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

.settings-container {
    height: var(--page-content);
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
