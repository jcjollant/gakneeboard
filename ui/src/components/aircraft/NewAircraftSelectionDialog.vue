<template>
    <div>
        <!-- New Aircraft Choice Dialog -->
        <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal header="New Aircraft" :style="{ width: '500px' }">
            <div class="choice-container">
                <div class="choice-item" @click="onFromScratch">
                    <div class="choice-icon"><font-awesome-icon icon="fa-plus" /></div>
                    <div class="choice-text">
                        <div class="choice-title">From Scratch</div>
                        <div class="choice-desc">Start with a blank configuration</div>
                    </div>
                </div>
                <div class="choice-item" @click="onFromTemplate">
                    <div class="choice-icon"><font-awesome-icon icon="fa-scroll" /></div>
                    <div class="choice-text">
                        <div class="choice-title">From Template</div>
                        <div class="choice-desc">Use a pre-configured aircraft model</div>
                    </div>
                </div>
                <div class="choice-item" @click="onCopyExisting">
                    <div class="choice-icon"><font-awesome-icon icon="fa-clone" /></div>
                    <div class="choice-text">
                        <div class="choice-title">Copy Existing</div>
                        <div class="choice-desc">Clone one of your own aircraft</div>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- Aircraft Template Selection Dialog -->
        <Dialog v-model:visible="showTemplateSelection" modal header="Select Template" :style="{ width: '80vw', maxWidth: '800px' }">
            <div class="templateList selectionList">
                <div v-for="template in aircraftTemplates" :key="template.id" class="selection-item" @click="selectSourceAircraft(template)">
                    <AircraftCard :aircraft="template" :templateMode="true" />
                </div>
            </div>
            <div class="feedback-invite">
                Don't see your aircraft? Send us feedback at <a href="mailto:support@kneeboard.ga">support@kneeboard.ga</a> with templates you'd like to see!
            </div>
        </Dialog>

        <!-- Aircraft Copy Selection Dialog -->
        <Dialog v-model:visible="showCopySelection" modal header="Copy Existing Aircraft" :style="{ width: '80vw', maxWidth: '800px' }">
            <div class="templateList selectionList">
                <div v-for="a in userAircrafts" :key="a.id" class="selection-item" @click="selectSourceAircraft(a)">
                    <AircraftCard :aircraft="a" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import AircraftCard from './AircraftCard.vue'
import { AircraftService } from '../../services/AircraftService'
import { Aircraft } from '@gak/shared'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../../assets/Toaster'

const props = defineProps<{
    visible: boolean
    userAircrafts: Aircraft[]
}>()

const emits = defineEmits(['update:visible', 'selected'])

const toast = useToast()
const toaster = useToaster(toast)

const aircraftTemplates = ref<Aircraft[]>([])
const showTemplateSelection = ref(false)
const showCopySelection = ref(false)

function onFromScratch() {
    emits('update:visible', false)
    emits('selected', null)
}

async function onFromTemplate() {
    emits('update:visible', false)
    toaster.info('Fetching Templates', 'Opening hangar doors...', 10000)
    aircraftTemplates.value = await AircraftService.listTemplates()
    toast.removeAllGroups()
    showTemplateSelection.value = true
}

function onCopyExisting() {
    emits('update:visible', false)
    showCopySelection.value = true
}

function selectSourceAircraft(source: Aircraft) {
    // Clone aircraft data and clear IDs
    const clone = JSON.parse(JSON.stringify(source))
    delete clone.id
    delete clone.userId
    
    showTemplateSelection.value = false
    showCopySelection.value = false
    emits('selected', clone)
}
</script>

<style scoped>
.templateList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
}

.choice-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
}

.choice-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.choice-item:hover {
    background-color: #f8f9fa;
    border-color: var(--bg, #0369a1);
}

.choice-icon {
    font-size: 2rem;
    color: var(--bg, #0369a1);
    width: 3rem;
    text-align: center;
}

.choice-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.choice-desc {
    font-size: 0.9rem;
    color: #6c757d;
}

.selectionList {
    max-height: 60vh;
    overflow-y: auto;
}

.selection-item {
    cursor: pointer;
}

.feedback-invite {
    text-align: center;
    margin-top: 1rem;
    color: #6c757d;
    font-size: 0.9rem;
    padding-bottom: 0.5rem;
}

.feedback-invite a {
    color: var(--bg, #0369a1);
    text-decoration: none;
    font-weight: bold;
}

.feedback-invite a:hover {
    text-decoration: underline;
}
</style>
