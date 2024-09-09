<script setup>
import { onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

import { NavlogEntry } from '../../assets/NavlogEntry'

import PlaceHolder from '../shared/PlaceHolder.vue'

const emits = defineEmits(['close','save'])
const editEntry = ref(null)

//---------------------
// Props management
const props = defineProps({
  entry: { type: Object, default: null},
  time: { type: Number, default: 0}
})

function loadProps(newProps) {
    // console.log('[NavlogItemEditor.loadProps]', JSON.stringify(newProps))
    if(newProps.entry) {
        const entry = NavlogEntry.copy(newProps.entry)
        editEntry.value = entry
    }
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    // console.log('[NavlogItemEditor.watch]')
    loadProps(props)
})

// End of props management
//------------------------

function onApply() {
    // console.log('[NavlogEditor.onSave]', JSON.stringify(editEntry.value))
    const entry = editEntry.value

    emits('save', entry)
}

</script>

<template>
    <Dialog modal header="Checkpoint Editor" class="editorDialog">
        <div v-if="editEntry">
            <div class="checkpointFields">
                <FloatLabel>
                    <InputText id="name" class="editorName" v-model="editEntry.name" />
                    <label for="name">Name</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="alt" v-model="editEntry.alt" />
                    <label for="alt">Altitude</label>
                </FloatLabel>
            </div>
            <div class="actionDialog gap-2">
                <Button label="Do Not Apply" @click="emits('close')" link></Button>
                <Button label="Apply" @click="onApply"></Button>
            </div>
         </div>
        <PlaceHolder v-else title="Nothing to edit" />
    </Dialog>

</template>

<style scoped>
.checkpointFields {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.2rem;
    justify-content: left;
    padding-top: 1.5rem;
}
.hint {
    text-align: right;
    padding-right: 0.4rem;
}
.legFields {
    display: grid;
    grid-template-columns:  auto auto auto auto auto auto;
    /* grid-template-rows: 4rem 4rem; */
    gap: 1.5rem 0.2rem;
    font-size: small;
}
.others {
    display: flex;
    gap: 0.3rem;
}
:deep(.p-inputtext.editorName ) {
    width: 10rem;
    text-align: left;
}

:deep(.p-inputtext) {
    width: 4.5rem;
    text-align: right;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}

:deep(.p-float-label) {
    left: unset;
    right: 0.5rem;
}
</style>