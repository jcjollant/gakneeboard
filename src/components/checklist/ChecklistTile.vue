<script setup>
import { ref } from 'vue'

import Header from '../shared/Header.vue'
import ThemeSelector from './ThemeSelector.vue'

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'


const title = ref('Checklist')
const mode = ref('')
const textData = ref('')
const theme = ref('theme-blue')
let nameBeforeEdit = 'Checklist'

function onApply() {
    console.log('[ChecklistTile.onApply] not implemented')

}

function onCancel() {
    // console.log('[ChecklistTile.onCancel] not implemented')
    mode.value = ''
    title.value = nameBeforeEdit;
}

function onHeaderClick() {
    // console.log('[ChecklistTile.onHeaderClick] not implemented')
    if( mode.value == '') {
        nameBeforeEdit = title.value
        mode.value = 'edit'
    } else {
        mode.value = ''
    }
}

function onThemeChange(newTheme) {
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
            <div class="actionBar">
                <Button @click="onCancel" label="Cancel" link></Button>
                <Button icon="pi pi-check" @click="onApply" label="Apply"></Button>
            </div>
        </div>
        <div v-else="" class="content" >Normal</div>
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