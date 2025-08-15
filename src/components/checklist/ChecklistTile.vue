<template>
    <div class="tile">
        <Header :title="title" :displayMode="false"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="editMode" class="settings">
            <div class="oneLine">
                <InputGroup>
                    <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                    <InputText v-model="title" />
                </InputGroup>
                <ThemeSelector v-show="true" :short="true" :theme="theme" @change="onThemeChange"/>
            </div>
            <div class="oneOrTwoLists">
                <Textarea rows="10" cols="24" v-model="textData" class="editList" placeholder="Up to 10 items will fit vertically."></Textarea>
            </div>
            <ActionBar @apply="onApply" @cancel="onCancel" :help="UserUrl.checklistGuide" />
        </div>
        <div v-else class="checklistMain" @click="onHeaderClick">
            <ChecklistViewer :list="checklist" :theme="theme" :size="2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Checklist } from '../../model/Checklist'
import { onMounted, ref, watch } from 'vue'
import { UserUrl } from '../../lib/UserUrl'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { TileData } from '../../model/TileData'
import { TileType } from '../../model/TileType'

const editMode = ref(false)
const emits = defineEmits(['replace','update'])
const title = ref('Checklist')
const noChecklist = new Checklist()
const checklist = ref(noChecklist)
const textData = ref('')
const theme = ref('theme-blue')
let nameBeforeEdit = 'Checklist'
let themeBeforeEdit = 'theme-yellow'


//-----------------------
// Props management
const props = defineProps({
    params: { type: Object, default: null },
})

function loadProps(newProps:any) {
    // console.debug('[ChecklistTile.loadProps]', newProps)
    const params = newProps.params
    if (params) {
        // load params into checlist
        const newList = new Checklist()
        newList.parseParams(params.items);
        checklist.value = newList;
        // checklist name
        if (params.name) {
            title.value = params.name
        }
        // checklist theme
        if( 'theme' in params) {
            theme.value = 'theme-' + params.theme
        }
    } else {
        checklist.value = noChecklist
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management
//------------------------

function onApply() {
    // console.debug('[ChecklistTile.onApply] not implemented')
    // turn textData into a list of items
    checklist.value.parseEditor(textData.value)
    // console.debug('[CheclistPage.onApply]', JSON.stringify(items))
    const newParams = { name: title.value, items: checklist.value.toParams() }
    if( theme.value.startsWith('theme-')) {
        newParams['theme'] = theme.value.substring(6)
    }
    // go back to normal mode
    editMode.value = false
    // notify parent of data change
    emits('update', new TileData( TileType.checklist, newParams))
}

function onCancel() {
    // console.debug('[ChecklistTile.onCancel] not implemented')
    editMode.value = false
    title.value = nameBeforeEdit;
    theme.value = themeBeforeEdit;
}

function onHeaderClick() {
    // console.debug('[ChecklistTile.onHeaderClick] not implemented')
    if( !editMode.value) {
        nameBeforeEdit = title.value;
        themeBeforeEdit = theme.value;
        textData.value = checklist.value.toEditor()
        editMode.value = true
    } else {
        editMode.value = false
    }
}

function onThemeChange(newTheme) {
    // console.log('[ChecklistTile.onThemeChange]', newTheme)
    theme.value = newTheme
}

</script>

<style scoped>
.checklistMain {
    cursor: pointer;
}
.editList {
    resize: none;
    font-family: 'Courier New', Courier, monospace;
}

.oneLine {
    display: flex;
    gap:5px;
}

.settings {
    display: flex;
    flex-flow: column;
    gap: 5px;    
    font-size: 0.7rem;
    padding: 5px
}
input.p-inputtext {
    height: 1.5rem;
}
:deep(.p-inputgroup-addon),:deep(.p-dropdown) {
    font-size: 0.8rem;
    height: 1.5rem;
}

:deep(.p-dropdown-label) {
    font-size: 0.8rem;
    line-height: 0.5rem;

}
:deep(.p-inputtext.p-component) {
    font-size: 0.8rem;
}

</style>