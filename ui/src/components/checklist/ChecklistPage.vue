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
                <ChecklistViewer v-for="(checklistView,index) in checklistViews" 
                    :view="checklistView"
                    :class="['list','list'+index]" />
            </div>
            <!-- <div v-if="version > 0" class="version">v{{version}}</div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { UserUrl } from '../../lib/UserUrl'
import { ChecklistPage } from '../../models/ChecklistPage'
import { ChecklistSettingsParams } from '../../models/ChecklistSettingsParams'
import { TemplateFormat } from '../../models/TemplateFormat'
import { ChecklistService } from '../../services/ChecklistService'

import { Checklist, ChecklistFont } from '../../models/Checklist'
import { ChecklistView } from '../../models/ChecklistView'
import ActionBar from '../shared/ActionBar.vue'
import Header from '../shared/Header.vue'
import ChecklistSettings from './ChecklistSettings.vue'
import ChecklistViewer from './ChecklistViewer.vue'

const editMode = ref(false)

// We need a temporary holding place for the updated config before applying
const pendingUpdate = ref<any>(null)

const emits = defineEmits(['replace','update'])
const page = ref<ChecklistPage>(new ChecklistPage())
const checklistViews = ref<ChecklistView[]>([])

const props = defineProps({
    data: { type: Object, default: null },
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)

function loadProps(newProps:any) {
    // console.log('[ChecklistPage.loadProps]', newProps)
    const newPage:ChecklistPage = new ChecklistPage()
    if (newProps.data) {
        editMode.value = false
        newPage.name = newProps.data.name ?? newPage.name
        newPage.theme = newProps.data.theme
        newPage.font = newProps.data.font ?? ChecklistFont.medium
        newPage.items = ChecklistService.parseItems(newProps.data.items) ?? []
        newPage.items2 = ChecklistService.parseItems(newProps.data.items2)
        newPage.items3 = ChecklistService.parseItems(newProps.data.items3)

        // console.debug('[ChecklistPage.loadProps] newPage', newPage)
        // console.debug('[ChecklistPage.loadProps] newPage.theme', newPage.theme, 'from', newProps.data.theme)
        // console.debug('[ChecklistPage.loadProps] newPage.font', newPage.font, 'from', newProps.data.font)

        const newChecklistViews = []
        const view1 = new ChecklistView()
        view1.items = newPage.items
        view1.font = newPage.font
        view1.theme = newPage.theme
        newChecklistViews.push(view1)

        if(newPage.items2) {
            const view2 = new ChecklistView()
            view2.items = newPage.items2
            view2.font = newPage.font
            view2.theme = newPage.theme
            newChecklistViews.push(view2)
        }
        if(newPage.items3) {
            const view3 = new ChecklistView()
            view3.items = newPage.items3
            view3.font = newPage.font
            view3.theme = newPage.theme
            newChecklistViews.push(view3)
        }

        checklistViews.value = newChecklistViews
    } else {
        editMode.value = true
    }
    page.value = newPage
    
    if(editMode.value) {
        showSettings()
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

// End of props management

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
    if(!editMode.value) showSettings();
}

function showSettings() {
    const listOfItems:Checklist[] = []
    if(page.value.items) listOfItems.push(new Checklist(page.value.items))
    if(page.value.items2) listOfItems.push(new Checklist(page.value.items2))
    if(page.value.items3) listOfItems.push(new Checklist(page.value.items3))
    
    settingsData.value = new ChecklistSettingsParams(
        page.value.name,
        listOfItems,
        page.value.theme,
        page.value.font,
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
    grid-template-rows: 2.5rem 1fr 2rem 2rem 50px;
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
