<template>
    <div class="tile">
        <Header :title="title" leftButton="settings"
            @click="emits('settings')" 
            @replace="emits('replace')" 
            @settings="emits('settings')" />
        <div class="checklistMain">
            <ChecklistViewer :view="view" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChecklistTile } from '../../models/ChecklistTile'
import { onMounted, ref, watch } from 'vue'

import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'
import { ChecklistFont, ChecklistItem, ChecklistTheme } from '../../models/Checklist'
import { ChecklistView } from '../../models/ChecklistView'
import { ChecklistService } from '../../services/ChecklistService'

const emits = defineEmits(['replace', 'update', 'settings'])
const title = ref('Checklist')
const view = ref<ChecklistView>(new ChecklistView())

//-----------------------
// Props management
const props = defineProps({
    params: { type: Object, required: true },
})

function loadProps(newProps:any) {
    // console.debug('[ChecklistTile.loadProps]', newProps)
    const checklistTile:ChecklistTile = ChecklistService.parseTile(newProps.params)
    title.value = checklistTile.name
    view.value = new ChecklistView( checklistTile.items, ChecklistFont.medium, checklistTile.theme)
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management
//------------------------

</script>

<style scoped>
.checklistMain {
    cursor: pointer;
    height: 100%;
}
</style>