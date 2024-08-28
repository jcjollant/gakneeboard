<script setup>
import { ref, onMounted, watch } from "vue";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton"

import { customSheetDelete, sheetGetByCode, sheetGetById, urlKneeboard } from "../../assets/data"
import { describePage, getTemplateDataFromName } from '../../assets/sheetData'
import { sheetNameDemo, sheetNameDemoChecklist, sheetNameDemoNavlog, sheetNameDemoTiles, sheetNameNew } from '../../assets/sheetData'
import { getToastData, toastError, toastSuccess } from '../../assets/toast'

const emits = defineEmits(["close","delete","load","save","toast"]);

//-----------------
// Props management
const props = defineProps({ 
  mode: { type: String, default: 'load'},
  user: { type: Object, default: null},
  sheet: { type: Object, default: null},
})


function loadProps(props) {
  if( props.user && props.user.sheets) {
    if( props.user.sha256 == 'bfaa2eb49bf63f41c05a016e03653fe2d7f8bf196ba6fb3f3340d3dcd7016770') maxTemplateCount = 20
    templates.value = props.user.sheets
    // console.log('[Sheets.loadProps]', JSON.stringify(sheets.value))
  }
  targetTemplate.value = props.sheet;
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// End of props management
//------------------------

const pubPublic = 'Public'
const pubPrivate = 'Private'
const publish = ref(pubPrivate)
const templateNameText = ref('')
const templates = ref([])
const deleteMode = ref(false)
const templateCode = ref('')
const targetTemplate = ref(null)
const fetching = ref(false)
const directLink = ref('')
let maxTemplateCount = 10

function changeTargetTemplate(newTemplate) {
  fetching.value = false;
  targetTemplate.value = newTemplate
  publish.value = newTemplate?.publish ? pubPublic : pubPrivate
  templateNameText.value = newTemplate ? newTemplate.name : ''
  if( newTemplate && newTemplate.code) {
    directLink.value = urlKneeboard + '?t=' + newTemplate.code
  } else {
    directLink.value = ''
  }
}

function getTemplateName(template=null) {
  if(!template || !template.name) return '?'
  let name = template.name;
  if(template.publish) name  = name +' (' + template.code + ')'
  return name;
}

function onButtonClose() {
  changeTargetTemplate()
  emits('close')
}

function onButtonLoad() {
  emits('load',targetTemplate.value)
  changeTargetTemplate()
}

function onButtonSave() {
  const targetSheetId = targetTemplate?.value?.id
  const template = {id:targetSheetId,name:templateNameText.value,publish:publish.value==pubPublic}

  emits('save',template)
  changeTargetTemplate()
}

async function onCopyURL() {
  const toastTitle = 'Copy to Clipboard'
    if(!directLink.value) {
      showToast(toastTitle, 'Nothing to copy', toastError)
      return;
    }
    try {
      await navigator.clipboard.writeText(directLink.value);
      showToast(toastTitle, directLink.value + ' copied to clipboard')
    } catch($e) {
      showToast(toastTitle, 'Could not copy to clipboard', toastError)
    }  
}

/**
 * A default template has been selected load its data into
 * @param name 
 */
function onLoadDefault(name) {
  const data = getTemplateDataFromName(name);
  if( data) {
    changeTargetTemplate( data);
  } else {
    console.log('[Templates.onLoadDefault] unknown name', name)
    changeTargetTemplate()
  }
}

function onNewTemplate() {
  const newSheet = {name:templateNameText.value, publish:publish.value==pubPublic}
  changeTargetTemplate(newSheet)
}

async function onSheetFetchCode() {
  fetching.value = true;
  await sheetGetByCode(templateCode.value).then( sheet => {
    // console.log('[Templates.onSheetFetch] sheet', JSON.stringify(sheet))
    // showToast('Fetch', 'Sheet found')
    changeTargetTemplate(sheet)
    if(!sheet) {
      showToast('Fetch','Code not found ' + templateCode.value, toastError)
    }
  }) 
}

async function onSheetSelected(sheet) {
  // console.log('[Sheets.onSheetSelected] deleteMode', deleteMode.value,'mode', props.mode)
  if(deleteMode.value) {
    await customSheetDelete(sheet).then( () => {
      // console.log('[Sheets.onSheetSelected]', sheet)
      if( sheet) {
        // remove that sheet from the list
        emits('delete',sheet)
        changeTargetTemplate()
      }
    })
  } else { // load or save
    // console.log('[Templates.onSheetSelected] load', JSON.stringify(sheet))
    fetching.value = true;
    await sheetGetById(sheet.id).then( sheet => {
      // console.log('[Templates.fetchSheet]', JSON.stringify(sheet))
      changeTargetTemplate(sheet)
    }).catch( e => {
      reportError('[Templates.onSheetSelected] fetch failed ' + e)    
      changeTargetTemplate()
    })
  }
}

function onToggleDeleteMode() {
  deleteMode.value = !deleteMode.value
}

function showToast(summary,details,severity=toastSuccess) {
  emits('toast',getToastData(summary,details, severity))
}


</script>

<template>
  <Dialog modal :header="mode=='load'?'Load Template':'Save Template'" style="width:45rem">
    <div v-if="mode=='save'">
      <FieldSet :legend="'Your'+(templates.length?(' '+templates.length):'')+' Templates'">
        <div v-if="templates.length" class="sheetAndToggle">
          <div class="templateList">
            <Button v-for="sheet in templates" :label="getTemplateName(sheet)" 
              :icon="deleteMode?'pi pi-times':'pi pi-copy'" 
              :severity="deleteMode?'danger':'primary'"
              :title="(deleteMode?'Delete':'Overwrite')+' \''+sheet.name+'\''"
              @click="onSheetSelected(sheet)"></Button>
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
      <FieldSet legend="Properties">
        <div class="templateProps">
          <InputGroup class="pageName">
            <InputGroupAddon>Name</InputGroupAddon>
            <InputText v-model="templateNameText"/>
          </InputGroup>
          <Button label="Make Copy" icon="pi pi-file" severity="secondary" title="Create a copy instead or overwritting"
            :disabled="!(targetTemplate?.id)"
            @click="onNewTemplate"></Button>
          <div class="alignedRow">
            <div>Access:</div>
            <SelectButton v-model="publish" :options="[pubPublic, pubPrivate]" aria-labelledby="basic" />
          </div>
          <div class="alignedRow codeAndLink" v-show="directLink">
            <div>Share code </div>
            <div class="bold"><a :href="directLink" target="_blank">{{ targetTemplate?.code ? targetTemplate.code:'(none)' }}</a></div>
            <Button icon="pi pi-clipboard" title="Copy link to clipboard" @click="onCopyURL"></Button>
          </div>
          <div class="templateDescription">
            <div class="bold pageDescription">Front</div><div class="pageDescription">{{ describePage(targetTemplate, 0) }}</div>
            <div class="bold pageDescription">Back</div><div class="pageDescription">{{ describePage(targetTemplate, 1) }}</div>
          </div>
        </div>
      </FieldSet>
      <label v-if="templates.length > maxTemplateCount || (templates.length==maxTemplateCount && !(targetTemplate?.id))" class="experiment">We are currently experimenting with a limit of {{ maxTemplateCount }} templates</label>
      <div v-else class="actionDialog gap-2">
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button :label="targetTemplate?.id ? 'Overwrite Sheet' : 'Save Sheet'" 
          @click="onButtonSave" 
          :disabled="!templateNameText.length"></Button>
      </div>
    </div>
  <div v-else><!-- load -->
    <FieldSet legend="Your Templates">
      <div v-if="templates.length" class="sheetAndToggle">
        <div class="templateList">
          <Button v-for="sheet in templates" :label="getTemplateName(sheet)" 
            :icon="deleteMode?'pi pi-times':'pi pi-copy'" 
            :severity="deleteMode?'danger':'primary'"
            :title="(deleteMode?'Delete':'Load')+' \''+sheet.name+'\''"
            @click="onSheetSelected(sheet)"></Button>
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
    <FieldSet legend="Content">
      <div v-if="targetTemplate" class="templateDescription">
        <div class="bold">Name</div><div>{{fetching ? 'Fetching...' : targetTemplate.name}}</div>
        <div class="bold pageDescription">Front</div><div class="pageDescription">{{ fetching ? '' : describePage(targetTemplate, 0) }}</div>
        <div class="bold pageDescription">Back</div><div class="pageDescription">{{ fetching ? '' : describePage(targetTemplate, 1) }}</div>
      </div>
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

.code {
  padding-left: 0.5rem;
  font-weight: bold;
}

.codeAndLink {
  grid-column: 2 / span 2;
  justify-content: end;
}
.codeFetch {
  display: flex;
  gap:5px;
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
  display: grid;
  gap: 10px;
  grid-template-columns: 35% 30% auto;
}
.alignedRow {
  display: flex;
  flex-wrap: wrap;
  /* line-height: 2rem; */
  align-items: center;
  gap: 5px;
}
.sharedCode {
  width: 10rem;
}
.pageName {
  grid-column: 1 / span 2;
}
.pageDescription {
  font-size: 0.8rem;
  overflow: hidden;
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