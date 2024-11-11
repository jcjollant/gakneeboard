<script setup>
import { ref, onMounted, watch } from "vue";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";

import { newCurrentUser } from "../../assets/data"
import { Template, TemplateSaveDialogMode } from '../../assets/Templates'
import TemplateDescription from './TemplateDescription.vue'
import TemplateLoad from './TemplateLoad.vue'
import TemplateSharing from "./TemplateSharing.vue";

const emits = defineEmits(["close","save","mode", "overwrite","toast"]);
const mode = ref(null)
const templateNameText = ref('')
const templateDescText = ref('')
const targetTemplate = ref(null)
const fetching = ref(false)
const user = ref(null)

//-----------------
// Props management
const props = defineProps({ 
  mode: { type: String, default: TemplateSaveDialogMode.save},
  template: { type: Object, default: null},
  time: { type: Number, default: 0}
})


function loadProps(props) {
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.mode))
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.user))
  mode.value = props.mode;

  // Active template
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.template))
  targetTemplate.value = props.template;
  if(props.template) {
    templateNameText.value = props.template.name
    templateDescText.value = props.template.desc
  } 

  // Current user
  user.value = newCurrentUser
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// End of props management
//------------------------

function changeTemplateTarget(newTemplate=null) {
  fetching.value = false;
  targetTemplate.value = newTemplate
  templateNameText.value = newTemplate ? newTemplate.name : ''
}

function getTitle(mode) {
  if(mode == TemplateSaveDialogMode.save) {
    return 'Save "' + (targetTemplate.value ? targetTemplate.value.name : '?') + '"'
  } else if(mode == TemplateSaveDialogMode.saveAs) {
    return 'Save New Template'
  } else if(mode == TemplateSaveDialogMode.overwrite) {
    return 'Overwrite Existing Template'
  } else {
   // mode == TemplateDialogMode.load ?
    return 'Load Template'
  }
}

function onButtonClose() {
  changeTemplateTarget()
  emits('close')
}

function onButtonOverwrite () {
  // refresh name and description
  targetTemplate.value.name = templateNameText.value
  targetTemplate.value.desc = templateDescText.value
  emits('save',targetTemplate.value)
}

function onButtonSaveNew() {
  // create a new template with form data
  const template = new Template(templateNameText.value, templateDescText.value)
  emits('save',template)
  changeTemplateTarget()
}

async function onTemplateSelected(template) {
  // console.log('[Sheets.onSheetSelected] deleteMode', deleteMode.value,'mode', props.mode)
  if( mode.value == TemplateSaveDialogMode.overwrite) {
    emits('overwrite', targetTemplate.value, template)
  }
}

function onToast(data) {
  emits('toast',data)
}

</script>

<template>
  <Dialog modal :header="getTitle(mode)" :style="{width: mode=='save' ? '35rem' : '45rem'}">
    <div v-if="mode==TemplateSaveDialogMode.save">
      <div class="properties">
        <InputGroup class="pageName">
          <InputGroupAddon>Rename To</InputGroupAddon>
          <InputText v-model="templateNameText"/>
        </InputGroup>
        <InputGroup class="pageDescription">
          <InputGroupAddon>Description</InputGroupAddon>
          <InputText v-model="templateDescText"/>
        </InputGroup>
        <TemplateSharing :template="targetTemplate" @toast="onToast" />
        <TemplateDescription :template="targetTemplate" :hideDescription="true" />
        <div>
        </div>
      </div>
      <div class="actionDialog gap-2">
        <Button label="Save As..." @click="emits('mode', TemplateSaveDialogMode.saveAs)" title="Copy this template into a new one" link></Button>
        <Button label="Replace..." @click="emits('mode', TemplateSaveDialogMode.overwrite)" title="Overwrite an existing template with this one" link></Button>
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button label="Save" 
          @click="onButtonOverwrite"></Button>
      </div>
    </div>
    <div v-else-if="mode==TemplateSaveDialogMode.saveAs">
      <div class="templateProps">
        <InputGroup class="pageName">
          <InputGroupAddon>Name</InputGroupAddon>
          <InputText v-model="templateNameText"/>
        </InputGroup>
        <InputGroup class="pageDescription">
          <InputGroupAddon>Description</InputGroupAddon>
          <InputText v-model="templateDescText"/>
        </InputGroup>
        <TemplateDescription :template="targetTemplate" :hideDescription="true" />
      </div>
      <label v-if="user.templates.length >= user.maxTemplateCount || (user.templates.length==user.maxTemplateCount && !(targetTemplate?.id))" class="experiment">We are currently experimenting with a limit of {{ user.maxTemplateCount }} templates</label>
      <div v-else class="actionDialog gap-2">
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button label="Save" :disabled="!templateNameText.length"
          @click="onButtonSaveNew"></Button>
      </div>
    </div>
    <div v-else-if="mode==TemplateSaveDialogMode.overwrite">
      <FieldSet :legend="'Your'+(user.templates.length?(' '+user.templates.length):'')+' Templates'">
        <div v-if="user.templates.length" class="sheetAndToggle">
          <div class="templateList">
            <Button v-for="t in user.templates" :label="Template.getName(t)" 
              :icon="'pi pi-copy'" 
              :severity="'primary'"
              :title="'Overwrite'+' \''+t.name+'\''"
              @click="onTemplateSelected(t)"></Button>
          </div>
        </div>
        <div v-else class="templateList">
          <label>Your custom sheets will show here once you save them.</label>
        </div>
      </FieldSet>
      <div class="actionDialog gap-2">
        <Button label="Do Not Overwrite" @click="onButtonClose" link></Button>
      </div>
    </div>
  <TemplateLoad v-else />
  </Dialog>
</template>

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
.pageName {
  grid-column: 1 / span 2;
  padding: 3px;
}

.properties {
  display: flex;
  flex-flow: column;
  gap: 0.8rem;
}

.newSheetButton {
    grid-column: 2 / span 2;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}

</style>