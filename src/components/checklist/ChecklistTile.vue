<template>
    <div class="tile">
        <Header :title="title" leftButton="settings"
            @click="emits('settings')" 
            @replace="emits('replace')" 
            @settings="emits('settings')" />
        <div class="checklistMain">
            <ChecklistViewer :list="checklist" :theme="theme" :size="2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Checklist } from '../../models/Checklist'
import { ChecklistService } from '../../services/ChecklistService'
import { onMounted, ref, watch } from 'vue'

import ChecklistViewer from './ChecklistViewer.vue'
import Header from '../shared/Header.vue'

const emits = defineEmits(['replace', 'update', 'settings'])
const title = ref('Checklist')
const noChecklist = new Checklist()
const checklist = ref(noChecklist)
const theme = ref('theme-blue')

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
        checklist.value = ChecklistService.parseParams(params.items);
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
        title.value = 'Checklist'
        theme.value = 'theme-blue'
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

</script>

<style scoped>
.checklistMain {
    cursor: pointer;
    height: 100%;
}
</style>