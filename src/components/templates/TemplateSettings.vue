<template>
  <Dialog modal header="Template Properties" :style="{width: '35rem'}">
    <div>
      <div class="properties">
        <InputGroup class="pageName">
          <InputGroupAddon>Name</InputGroupAddon>
          <InputText v-model="templateName"/>
        </InputGroup>
        <InputGroup class="pageDescription">
          <InputGroupAddon>Description</InputGroupAddon>
          <InputText v-model="templateDesc"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>Version</InputGroupAddon>
            <InputText v-model="templateVersion" :disabled="true"  class="templateVersion"/>
            <span class="spacer"></span>
            <InputGroupAddon>ID</InputGroupAddon>
            <InputText v-model="templateId" :disabled="true"  class="templateId"/>
        </InputGroup>
        <InputGroup>
            <InputGroupAddon>Format</InputGroupAddon>
            <div class="formatDisplay">{{ formatDisplay }}</div>
        </InputGroup>
        <TemplateSharing v-model="publish" :template="template" />
        <div>
        </div>
      </div>
      <div class="actionDialog gap-2">
        <Button label="Do Not Apply" @click="onButtonClose" link></Button>
        <Button label="Apply" @click="onButtonSave"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import TemplateSharing from "./TemplateSharing.vue";

const emits = defineEmits(["close","save"]);
const publish = ref(false)
const templateName = ref('')
const templateDesc = ref('')
const templateId = ref(0)
const templateVersion = ref(0)
const template = ref(null)
const formatDisplay = ref('Kneeboard Size')

//-----------------
// Props management
const props = defineProps({ 
  template: { type: Object, default: null},
  time: { type: Number, default: 0}
})


function loadProps(props) {
  // Active template
  // console.log('[TemplateSettings.loadProps]', JSON.stringify(props.template))
  template.value = props.template;
  if(props.template) {
    templateName.value = props.template.name
    templateDesc.value = props.template.desc
    templateId.value = props.template.id
    templateVersion.value = props.template.ver
    publish.value = props.template.publish
    
    // Set format display
    formatDisplay.value = props.template.format === 'fullpage' ? 'Full Page' : 'Kneeboard Size'
  } 
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

function onButtonClose() {
  emits('close')
}

function onButtonSave () {
  // refresh name and description
  const settings = {
    name: templateName.value,
    desc: templateDesc.value,
    ver: templateVersion.value,
    publish: publish.value,
    // Preserve the format property
    format: template.value?.format || 'kneeboard',
  }
  emits('save',settings)
}

</script>

<style scoped>
.templateList {
  display: flex;
  flex-flow: wrap;
  gap: 5px;
}

.sheetAndToggle {
  display: flex;
  justify-content: space-between;
}
.bold {
  font-weight: bold;
}

.contentPlaceholder {
  height:4rem;
}
.experiment {
  color:brown;
  font-size: 0.8rem;
}
.templateDescription {
  display: grid;
  gap: 5px;
  grid-template-columns: 3.5rem auto;
  grid-column: 1 / span 3;
}
.templateProps {
  display: flex;
  flex-flow: column;
  gap: 10px;
}
.alignedRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.sharedCode {
  width: 10rem;
}

.properties {
  display: flex;
  flex-flow: column;
  gap: 0.8rem;
}

.newSheetButton {
    grid-column: 2 / span 2;
}

:deep(.p-inputgroup-addon) {
  min-width: 100px;
  justify-content: end;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}

.spacer {
  width: 10px;
}
</style>
