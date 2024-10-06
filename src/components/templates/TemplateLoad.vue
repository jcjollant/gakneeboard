<template>
  <Dialog modal header="Load Template" :style="{width: '45rem'}">
    <OneChoice v-model="activeLoad" :choices="loadChoices" class="loadChoice"/>
    <div v-if="activeLoad.value==0" class="mt-5">
      <div v-if="user.templates.length" class="sheetAndToggle">
        <div class="templateList">
          <Button v-for="t in user.templates" :label="Template.getName(t)" 
            :icon="deleteMode?'pi pi-times':''" 
            :severity="deleteMode?'danger':t.publish ? 'success':'primary'"
            :title="(deleteMode?'Delete':'Load')+' \''+t.name+'\''"
            @click="onTemplateSelected(t)"></Button>
          <Button title="Toggle delete mode"
            :severity="deleteMode?'primary':'danger'" 
            :icon="deleteMode?'pi pi-copy':'pi pi-trash'"
            @click="onToggleDeleteMode"></Button>
        </div>
      </div>
      <div v-else class="templateBlankList">
        <label>Your custom templates will show here once you save them.</label>
      </div>
    </div>
    <div v-else>
        <div class="alignedRow mb-2 mt-5">
            <DataTable :value="publicTemplates" stripedRows paginator :rows="5" @row-click="onRowClick">
              <Column field="name" header="Name"></Column>
              <Column field="desc" header="Description"></Column>
              <Column field="code" header="Code" style="cursor:pointer"></Column>
            </DataTable>
            <div class="mb-2 codeInput">
              <div>Select Template above or Enter code =></div>
              <InputGroup class="sharedCode">
                  <InputGroupAddon>Shared Code</InputGroupAddon>
                  <InputText v-model="templateCode" />
                  <Button icon="pi pi-search" @click="onSheetFetchCode" :disabled="!templateCode.length" severity="secondary"></Button>
              </InputGroup>
            </div>
            <!-- <div class="mt-2">Shared codes are unique values created when one makes a template public</div> -->
        </div>
    </div>
    <FieldSet :legend="getDescriptionTitle()" v-if="activeLoad.value == 1 || user.templates.length">
      <TemplateDescription v-if="loadTemplate" :template="loadTemplate" />
      <div v-else class="contentPlaceholder">Select a template to view its content</div>
    </FieldSet>
    <div class="actionDialog gap-2">
      <Button label="Do Not Load" @click="onButtonClose" link></Button>
      <Button label="Load Template" @click="onButtonLoad" :disabled="!loadTemplate || fetching"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import { emitToast, emitToastError, emitToastInfo } from '../../assets/toast'
import { newCurrentUser } from "../../assets/data"
import { Template, TemplateData } from '../../assets/Templates'
import OneChoice from '../shared/OneChoice.vue'
import TemplateDescription from './TemplateDescription.vue'

import { useConfirm } from 'primevue/useconfirm'
import Button from "primevue/button";
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";


const emits = defineEmits(["close","delete","load","toast"]);

const loadYours = {label:'Yours',value:0}
const loadCommunity = {label:'Community',value:1}
const loadChoices = ref([loadYours,loadCommunity])

const confirm = useConfirm()
const deleteMode = ref(false)
const fetching = ref(false)
const loadTemplate = ref(null)
const activeLoad = ref(loadYours)
const templateCode = ref('')
const user = ref(null)
const publicTemplates = ref([])

//-----------------
// Props management
const props = defineProps({ 
  time: { type: Number, default: 0}
})

function loadProps(props) {
  if(newCurrentUser.loggedIn) {
    TemplateData.getPublications().then(list => publicTemplates.value = list)
  }

  // Current user
  user.value = newCurrentUser

  // reset delete mode
  deleteMode.value = false;
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// End of props management
//------------------------



function changeTemplateLoad(newTemplate=null) {
  fetching.value = false;
  loadTemplate.value = newTemplate;
}

function confirmAndDelete(template) {
  if( !template || !template.name) return;

  confirm.require({
      message: 'Do you want to delete \'' + template.name + '\'',
      header: 'Delete Template',
      rejectLabel: 'No',
      acceptLabel: 'Yes, Delete',
      accept: async () => {
        // console.log('[TemplateDialog.confirmAndDelete] deleting', JSON.stringify(template))
        emitToastInfo(emits, 'Calling Tower', 'Requesting deletion of ' + template.name)
        await TemplateData.delete(template).then( () => {
          // console.log('[TemplateDialog.onSheetSelected]', sheet)
          emitToast(emits, 'Clear', 'Template "' + template.name + '" deleted')
        })
      }
  })
}

function getDescriptionTitle() {
  if(fetching.value) return 'Fetching ...'
  if(loadTemplate.value) {
    let output = loadTemplate.value.name
    if(loadTemplate.value.data) output += ` (${loadTemplate.value.data.length} pages)`
    return output
  } 
  return 'Description'
}

function onButtonClose() {
    emits('close')
    changeTemplateLoad()
}

function onButtonLoad() {
    emits('load',loadTemplate.value)
    changeTemplateLoad()
}

function onRowClick(e) {
  // console.log('[TemplateLoad.onRowClick]', JSON.stringify(e))
  if( !e || !e.data || !e.data.code) return;
  templateCode.value = e.data.code
  onSheetFetchCode()
}

async function onSheetFetchCode() {
  fetching.value = true;
  await TemplateData.getPublication(templateCode.value).then( template => {
      // console.log('[Templates.onSheetFetch] sheet', JSON.stringify(sheet))
      changeTemplateLoad(template)
      if(!template) {
          emitToastError(emits, 'Fetch','Code not found ' + templateCode.value)
      }
  }) 
}

async function onTemplateSelected(template) {
    if(deleteMode.value) {
        confirmAndDelete(template)
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
}

function onToggleDeleteMode() {
  deleteMode.value = !deleteMode.value
}

</script>

<style scoped>
.codeInput {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  /* grid-template-columns: auto auto; */
}
.loadChoice {
    margin:auto;
}
.templateList {
  display: flex;
  flex-flow: wrap;
  gap: 5px;
}
.templateBlankList {
    font-weight: bolder;
    opacity: 0.5;
    text-align: center;
}
.sharedCode {
  width: 20rem;
}
.sheetAndToggle {
  display: flex;
  justify-content: space-between;
}

:deep(.p-fieldset-legend) {
      border: none;
      background: none;
}
:deep(.p-fieldset-content) {
      padding: 0;
}
:deep(.p-datatable .p-datatable-thead > tr > th ) {
  padding: 0.5rem;
}
:deep(.p-datatable .p-datatable-tbody > tr > td ) {
  padding: 0.5rem;
}
</style>