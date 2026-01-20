<template>
  <Dialog modal header="Kneeboard Properties" :style="{width: '35rem'}">
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
        <div class="version-row">
            <InputGroup>
                <InputGroupAddon>Version</InputGroupAddon>
                <InputText v-model="templateVersion" :disabled="true"  class="templateVersion"/>
            </InputGroup>
            <div class="previous-versions">
                <Button v-for="ver in previousVersions" :key="ver" 
                  :label="String(ver)" size="small" outlined 
                  :title="'Recall version ' + ver"
                  @click="onRecall(ver)"/>
            </div>
        </div>
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
import { ref, onMounted, watch, computed } from "vue";
import { TemplateSettings } from "./TemplateSettings";
import { useConfirm } from "primevue/useconfirm";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import TemplateSharing from "./TemplateSharing.vue";


const emits = defineEmits(["close","save","recall"]);
const confirm = useConfirm();
const publish = ref(false)
const templateName = ref('')
const templateDesc = ref('')
const templateId = ref(0)
const templateVersion = ref(0)
const template = ref(null)

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
  } 
}

const previousVersions = computed(() => {
  const versions = []
  for (let i = 1; i <= 5; i++) {
    const ver = templateVersion.value - i
    if (ver > 0) {
      versions.push(ver)
    }
  }
  return versions
})

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

function onButtonClose() {
  emits('close')
}

function onRecall(ver) {
  confirm.require({
    message: 'Are you sure you want to recall version ' + ver + '? Current changes will be lost.',
    header: 'Recall Version',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      emits('recall', {id: templateId.value, ver: ver})
    }
  });
}

function onButtonSave () {
  // refresh name and description
  const settings = new TemplateSettings( templateName.value, templateDesc.value, templateVersion.value, publish.value)
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

.version-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.previous-versions {
  display: flex;
  gap: 5px;
}
</style>
