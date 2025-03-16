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

<script setup>
import { Checklist } from '../../model/Checklist'
import { onMounted, ref, watch } from 'vue'
import { UserUrl } from '@/lib/UserUrl'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const editMode = ref(false)
const emits = defineEmits(['replace','update'])
const title = ref('Checklist')
const checklist = ref(new Checklist())
const textData = ref('')
const theme = ref('theme-blue')
let nameBeforeEdit = 'Checklist'
let themeBeforeEdit = 'theme-yellow'


//-----------------------
// Props management
const props = defineProps({
    params: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistTile.loadProps]', JSON.stringify(newProps))
    if (newProps.params) {
        // load params into checlist
        checklist.value.parseParams( newProps.params.items);
        // checklist name
        if (newProps.params.name) {
            title.value = newProps.params.name
        }
        // checklist theme
        if( 'theme' in newProps.params) {
            theme.value = 'theme-' + newProps.params.theme
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
//------------------------

function onApply() {
    // console.log('[ChecklistTile.onApply] not implemented')
    // turn textData into a list of items
    checklist.value.parseEditor(textData.value)
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newParams = { name: title.value, items: checklist.value.toParams() }
    if( theme.value.startsWith('theme-')) {
        newParams['theme'] = theme.value.substring(6)
    }
    // go back to normal mode
    editMode.value = false
    // notify parent of data change
    emits('update', newParams)
}

function onCancel() {
    // console.log('[ChecklistTile.onCancel] not implemented')
    editMode.value = false
    title.value = nameBeforeEdit;
    theme.value = themeBeforeEdit;
}

function onHeaderClick() {
    // console.log('[ChecklistTile.onHeaderClick] not implemented')
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