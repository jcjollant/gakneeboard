<script setup>
import { onMounted, ref, watch } from 'vue'
import { itemsFromList, listFromItems } from '../../assets/checklist'
import { urlGuideChecklist } from '../../assets/data'

import ActionBar from '../shared/ActionBar.vue'
import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const emits = defineEmits(['update'])

//-----------------------
// Props management
const props = defineProps({
    params: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[ChecklistTile.loadProps]', JSON.stringify(newProps))
    if (newProps.params) {
        items.value = newProps.params.items;
        if (newProps.params.name) title.value = newProps.params.name
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

const title = ref('Checklist')
const mode = ref('')
const items = ref([])
const textData = ref('')
const theme = ref('theme-blue')
let nameBeforeEdit = 'Checklist'
let themeBeforeEdit = 'theme-yellow'

function onApply() {
    // console.log('[ChecklistTile.onApply] not implemented')
    // turn textData into a list of items
    const newItems = itemsFromList(textData.value)
    // console.log('[CheclistPage.onApply]', JSON.stringify(items))
    const newParams = { name: title.value, items: newItems }
    if( theme.value.startsWith('theme-')) {
        newParams['theme'] = theme.value.substring(6)
    }
    items.value = newItems;
    // go back to normal mode
    mode.value = ''
    // notify parent of data change
    emits('update', newParams)
}

function onCancel() {
    // console.log('[ChecklistTile.onCancel] not implemented')
    mode.value = ''
    title.value = nameBeforeEdit;
    theme.value = themeBeforeEdit;
}

function onHeaderClick() {
    // console.log('[ChecklistTile.onHeaderClick] not implemented')
    if( mode.value == '') {
        nameBeforeEdit = title.value;
        themeBeforeEdit = theme.value;
        textData.value = listFromItems(items.value)
        mode.value = 'edit'
    } else {
        mode.value = ''
    }
}

function onThemeChange(newTheme) {
    // console.log('[ChecklistTile.onThemeChange]', newTheme)
    theme.value = newTheme
}

</script>

<template>
    <div class="tile">
        <Header :title="title" :replace="mode=='edit'"
            @click="onHeaderClick" @replace="emits('replace')"></Header>
        <div v-if="mode=='edit'" class="settings">
            <div class="oneLine">
                <InputGroup>
                    <InputGroupAddon class="checklistNameAddon">Name</InputGroupAddon>
                    <InputText v-model="title" />
                </InputGroup>
                <ThemeSelector v-show="true" :short="true" :theme="theme" @change="onThemeChange"/>
            </div>
            <div class="oneOrTwoLists">
                <Textarea rows="7" cols="24" v-model="textData" class="editList" placeholder="Up to 8 items will fit vertically."></Textarea>
            </div>
            <ActionBar @apply="onApply" @cancel="onCancel" :help="urlGuideChecklist" />
        </div>
        <div v-else class="checklistMain">
            <ChecklistViewer :items="items" :theme="theme" :small="true" />
        </div>
    </div>
</template>

<style scoped>
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