<script setup>
import { ref, onMounted, watch } from "vue";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";

import { customSheetDelete } from "../../assets/data"
import { getTemplateDataFromName } from '../../assets/sheetData'
import { sheetNameDemo, sheetNameDemoChecklist, sheetNameDemoNavlog, sheetNameDemoTiles } from '../../assets/sheetData'
import { getToastData, toastError, toastSuccess } from '../../assets/toast'
import { TemplateData, TemplateDialogMode } from '../../assets/Templates'
import TemplateDescription from './TemplateDescription.vue'
import TemplateSharing from "./TemplateSharing.vue";

const emits = defineEmits(["close","delete","load","save","mode", "overwrite","toast"]);

//-----------------
// Props management
const props = defineProps({ 
  mode: { type: String, default: 'load'},
  user: { type: Object, default: null},
  template: { type: Object, default: null},
})


function loadProps(props) {
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.mode))
  mode.value = props.mode;
  // Active template
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.template))
  targetTemplate.value = props.template;
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// End of props management
//------------------------

const deleteMode = ref(false)
const loadTemplate = ref(null)
const mode = ref(null)
const templateNameText = ref('')
const templateCode = ref('')
const targetTemplate = ref(null)
const fetching = ref(false)

function changeTemplateLoad(newTemplate=null) {
  fetching.value = false;
  loadTemplate.value = newTemplate;
}

function changeTemplateTarget(newTemplate=null) {
  fetching.value = false;
  targetTemplate.value = newTemplate
  templateNameText.value = newTemplate ? newTemplate.name : ''
}

function getTemplateName(template=null) {
  if(!template || !template.name) return '?'
  let name = template.name;
  if(template.publish) name  = name +' (' + template.code + ')'
  return name;
}

function getTitle(mode) {
  if(mode == TemplateDialogMode.save) {
    return 'Save "' + (targetTemplate.value ? targetTemplate.value.name : '?') + '"'
  } else if(mode == TemplateDialogMode.saveAs) {
    return 'Save New Template'
  } else if(mode == TemplateDialogMode.overwrite) {
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

function onButtonLoad() {
  emits('load',loadTemplate.value)
  changeTemplateLoad()
}

function onButtonOverwrite () {
  emits('save',targetTemplate.value)
}

function onButtonSaveNew() {
  // create a new template with form data
  const template = {name:templateNameText.value,publish:false}
  emits('save',template)
  changeTemplateTarget()
}

/**
 * A default template has been selected load its data into
 * @param name 
 */
function onLoadDefault(name) {
  const data = getTemplateDataFromName(name);
  if( data) {
    changeTemplateLoad(data)
  } else {
    console.log('[Templates.onLoadDefault] unknown name', name)
    changeTemplateLoad()
  }
}

async function onSheetFetchCode() {
  fetching.value = true;
  await TemplateData.getPublication(templateCode.value).then( template => {
    // console.log('[Templates.onSheetFetch] sheet', JSON.stringify(sheet))
    // showToast('Fetch', 'Sheet found')
    changeTemplateLoad(template)
    if(!template) {
      showToast('Fetch','Code not found ' + templateCode.value, toastError)
    }
  }) 
}

async function onTemplateSelected(template) {
  // console.log('[Sheets.onSheetSelected] deleteMode', deleteMode.value,'mode', props.mode)
  if( mode.value == TemplateDialogMode.load) {
    if(deleteMode.value) {
      await customSheetDelete(template).then( () => {
        // console.log('[Sheets.onSheetSelected]', sheet)
        if( template) {
          // remove that sheet from the list
          emits('delete',template)
          changeTemplateTarget()
        }
      })
    } else { // load template
      fetching.value = true;
      await TemplateData.get(template.id).then( template => {
        // console.log('[Templates.fetchSheet]', JSON.stringify(sheet))
        changeTemplateLoad(template)
      }).catch( e => {
        reportError('[Templates.onSheetSelected] fetch failed ' + e)    
        changeTemplateLoad()
      })
    }
  } else if( mode.value == TemplateDialogMode.overwrite) {
    emits('overwrite', targetTemplate.value, template)
  }
}

function onToast(data) {
  emits('toast',data)
}

function onToggleDeleteMode() {
  deleteMode.value = !deleteMode.value
}

function showToast(summary,details,severity=toastSuccess) {
  emits('toast',getToastData(summary,details, severity))
}

</script>

<template>
  <Dialog modal :header="getTitle(mode)" :style="{width: mode=='save' ? '35rem' : '45rem'}">
    <div v-if="mode==TemplateDialogMode.save">
      <div class="properties">
        <TemplateSharing :template="targetTemplate" @toast="onToast" />
        <TemplateDescription :template="targetTemplate" />
        <div>
        </div>
      </div>
      <div class="actionDialog gap-2">
        <Button label="Save As..." @click="emits('mode', TemplateDialogMode.saveAs)" title="Copy this template into a new one" link></Button>
        <Button label="Replace..." @click="emits('mode', TemplateDialogMode.overwrite)" title="Overwrite an existing template with this one" link></Button>
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button label="Save" 
          @click="onButtonOverwrite"></Button>
      </div>
    </div>
    <div v-else-if="mode==TemplateDialogMode.saveAs">
      <div class="templateProps">
        <InputGroup class="pageName">
          <InputGroupAddon>Name</InputGroupAddon>
          <InputText v-model="templateNameText"/>
        </InputGroup>
        <!-- <TemplateSharing :template="targetTemplate" @toast="onToast" /> -->
        <!-- <Button label="Make Copy" icon="pi pi-file" severity="secondary" title="Create a copy instead or overwritting"
          :disabled="!(targetTemplate?.id)"
          @click="onNewTemplate"></Button> -->
        <TemplateDescription :template="targetTemplate" />
      </div>
      <label v-if="user.templates.length >= user.maxTemplateCount || (user.templates.length==user.maxTemplateCount && !(targetTemplate?.id))" class="experiment">We are currently experimenting with a limit of {{ user.maxTemplateCount }} templates</label>
      <div v-else class="actionDialog gap-2">
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button label="Save" :disabled="!templateNameText.length"
          @click="onButtonSaveNew"></Button>
      </div>
    </div>
    <div v-else-if="mode==TemplateDialogMode.overwrite">
      <FieldSet :legend="'Your'+(user.templates.length?(' '+user.templates.length):'')+' Templates'">
        <div v-if="user.templates.length" class="sheetAndToggle">
          <div class="templateList">
            <Button v-for="t in user.templates" :label="getTemplateName(t)" 
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
  <div v-else><!-- load -->
    <FieldSet legend="Your Templates">
      <div v-if="user.templates.length" class="sheetAndToggle">
        <div class="templateList">
          <Button v-for="t in user.templates" :label="getTemplateName(t)" 
            :icon="deleteMode?'pi pi-times':'pi pi-copy'" 
            :severity="deleteMode?'danger':'primary'"
            :title="(deleteMode?'Delete':'Load')+' \''+t.name+'\''"
            @click="onTemplateSelected(t)"></Button>
          <Button title="Toggle delete mode"
            :severity="deleteMode?'primary':'danger'" 
            :icon="deleteMode?'pi pi-copy':'pi pi-trash'"
            @click="onToggleDeleteMode"></Button>
        </div>
      </div>
      <div v-else class="templateList">
        <label>Your custom sheets will show here once you save them.</label>
      </div>
    </FieldSet>
    <FieldSet legend="Demos & Shared">
      <div class="alignedRow mb-2">
        <InputGroup class="sharedCode">
          <InputGroupAddon>Code</InputGroupAddon>
          <InputText v-model="templateCode" />
          <Button icon="pi pi-search" @click="onSheetFetchCode" :disabled="!templateCode.length" severity="secondary"></Button>
        </InputGroup>
        <Button label="Default" icon="pi pi-clipboard"  title="Load Default Demo" 
          @click="onLoadDefault(sheetNameDemo)"></Button>
        <Button label="Tiles" icon="pi pi-clipboard"  title="Load Tiles Demo" 
          @click="onLoadDefault(sheetNameDemoTiles)"></Button>
        <Button label="Checklist" icon="pi pi-clipboard"  title="Load Checklist Demo" 
          @click="onLoadDefault(sheetNameDemoChecklist)"></Button>
        <Button label="Navlog" icon="pi pi-clipboard"  title="Load Navlog Demo" 
          @click="onLoadDefault(sheetNameDemoNavlog)"></Button>
    </div>
  </FieldSet>
    <FieldSet :legend="loadTemplate ? loadTemplate.name : 'Description'">
      <TemplateDescription v-if="loadTemplate" :template="loadTemplate" />
      <div v-else class="contentPlaceholder">Select a template above to view its content</div>
    </FieldSet>
    <div class="actionDialog gap-2">
      <Button label="Do Not Load" @click="onButtonClose" link></Button>
      <Button label="Load Template" @click="onButtonLoad" :disabled="!targetTemplate || fetching"></Button>
    </div>
  </div>
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