<script setup>
import { onMounted, ref, watch } from 'vue'

import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

import PlaceHolder from '../shared/PlaceHolder.vue'

//---------------------
// Props management
const props = defineProps({
  item: { type: Object, default: null},
})

function loadProps(newProps) {
    // console.log('[NavlogItemEditor.loadProps]', JSON.stringify(newProps))
    item.value = newProps.item ? newProps.item : null
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management
//------------------------

const item = ref(null)

</script>

<template>
    <Dialog modal header="NavLog Leg Editor" class="editorDialog">
        <div v-if="item" class="editorFields">
            <FloatLabel>
                <InputText id="name" class="editorName" v-model="item.entry.name" />
                <label for="name">Name</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="alt" v-model="item.entry.alt" />
                <label for="alt">Altitude</label>
            </FloatLabel>
            <FloatLabel title="True Heading">
                <InputText id="th" v-model="item.entry.th" />
                <label for="th">TH</label>
            </FloatLabel>
            <!-- <FloatLabel title="Compass Heading">
                <InputText id="ch" v-model="item.entry.ch" />
                <label for="ch">CH</label>
            </FloatLabel> -->
            <FloatLabel title="Leg Distance">
                <InputText id="ld" v-model="item.entry.ld" />
                <label for="ld">Dist.</label>
            </FloatLabel>
            <FloatLabel title="Ground Speed">
                <InputText id="gs" v-model="item.entry.gs" />
                <label for="gs">GS</label>
            </FloatLabel>
            <FloatLabel title="Leg Time">
                <InputText id="lt" v-model="item.entry.lt" />
                <label for="lt">Time</label>
            </FloatLabel>
            <FloatLabel title="Leg Fuel">
                <InputText id="lf" v-model="item.entry.lf" />
                <label for="lf">Fuel</label>
            </FloatLabel>

            <!-- <InputText placeholder="Code" v-model="code"></InputText>
            <Button label="Submit" @click="onSubmit"></Button> -->
        </div>
        <PlaceHolder v-else title="Nothing to edit" />
    </Dialog>

</template>

<style scoped>
.editorFields {
    display: grid;
    grid-template-columns: auto auto auto auto auto auto auto;
    gap: 5px;
    padding-top: 1.5rem;
    justify-content: center;
}
:deep(.p-inputtext.editorName ) {
    width: 6rem;
}

:deep(.p-inputtext) {
    width: 4rem;
}
</style>