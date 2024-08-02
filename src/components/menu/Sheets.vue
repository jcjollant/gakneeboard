<script setup>
import { ref, onMounted, watch } from "vue";
import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton"

import { customSheetDelete, maxSheetCount, sheetGetByCode, sheetGetById } from "../../assets/data"
import { describePage, getSheetBlank, getSheetDemoChecklist, getSheetDemoTiles, sheetNameDemoChecklist, sheetNameDemoTiles, sheetNameNew } from '../../assets/sheetData'
import { getToastData, toastError, toastSuccess } from '../../assets/toast'

const emits = defineEmits(["close","delete","load","save","toast"]);

//-----------------
// Props management
const props = defineProps({ 
  mode: { type: String, default: 'load'},
  user: { type: Object, default: null},
})


function loadProps(props) {
  if( props.user && props.user.sheets) {
    sheets.value = props.user.sheets
    // console.log('[Sheets.loadProps]', JSON.stringify(sheets.value))
  }
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
const sheetNameText = ref('')
const sheets = ref([])
const deleteMode = ref(false)
const sheetCode = ref('')
const targetSheet = ref(null)
let targetSheetId = 0;

async function fetchSheet(id) {
  await sheetGetById(id).then( sheet => {
    // console.log('[Sheets.fetchSheet]', JSON.stringify(sheet))    
    targetSheet.value = sheet;
  }).catch( e => {
    console.log('[Sheets.fetchSheet] failed', e)    
  })
}

function getSheetName(sheet) {
  if(!sheet || !sheet.name) return '?'
  let name = sheet.name;
  if(sheet.publish) name  = name +' (' + sheet.code + ')'
  return name;
}

/**
 * A default sheet has been selected load its data into
 * @param sheetName 
 */
function onLoadDefault(sheetName) {
  if( sheetName == sheetNameDemoTiles) {
    targetSheet.value = getSheetDemoTiles();
  } else if( sheetName == sheetNameDemoChecklist) {
    targetSheet.value = getSheetDemoChecklist();
  } else if( sheetName == sheetNameNew) { 
    targetSheet.value = getSheetBlank();
  } else {
    console.log('[Sheets.onLoadDefault] unknown sheetName', sheetName)
  }
}

function onSaveSheet() {
  const sheet = {id:targetSheetId,name:sheetNameText.value}
  if( publish.value == pubPublic) {
    sheet['publish'] = true;
  }
  targetSheetId = 0;

  emits('save',sheet)
}

async function onSheetFetchCode() {
  await sheetGetByCode(sheetCode.value).then( sheet => {
    // console.log('[Sheets.onSheetFetch] sheet', JSON.stringify(sheet))
    // showToast('Fetch', 'Sheet found')
    targetSheet.value = sheet;
  } ).catch( e => {
    showToast('Fetch','Could not load sheet with code ' + sheetCode.value, toastError)
  }) 
}

async function onSheetSelected(sheet) {
  // console.log('[Sheets.onSheetSelected] deleteMode', deleteMode.value,'mode', props.mode)
  if(deleteMode.value) {
    await customSheetDelete(sheet).then( () => {
      // console.log('[Sheets.onSheetSelected]', sheet)
      if( sheet) {
        // remove that sheet from the list
        sheets.value = sheets.value.filter( s => s.id != sheet.id)
        emits('delete',sheet)
      }
    })
  } else if( props.mode == 'load'){ // load or save
    // console.log('[Sheets.onSheetSelected] load', JSON.stringify(sheet))
    fetchSheet(sheet.id)
  } else { // save
    // select sheet properties for saving
    targetSheet.value = sheet
    sheetNameText.value = sheet.name
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
  <Dialog modal :header="mode=='load'?'Load':'Save'" style="width:45rem">
    <div v-if="mode=='save'">
      <FieldSet legend="Sheet Properties">
        <div class="sheetProps">
          <InputGroup>
            <InputGroupAddon>Name</InputGroupAddon>
            <InputText v-model="sheetNameText"/>
          </InputGroup>
          <div class="alignedRow">
            <div>Id:</div>
            <div>{{ targetSheet?targetSheet.id:'' }}</div>
          </div>
          <!-- <Button label="Save" icon="pi pi-save" severity="secondary" 
            :disabled="!sheetName.length"
            @click="onSaveSheet"></Button> -->
          <div class="alignedRow">
            <div>Access:</div>
            <SelectButton v-model="publish" :options="[pubPublic, pubPrivate]" aria-labelledby="basic" />
          </div>
          <div class="alignedRow">
            <div>Code:</div>
            <div>{{ targetSheet?targetSheet.code:'' }}</div>
          </div>
        </div>
      </FieldSet>
      <FieldSet legend="Overwrite Existing Sheet">
        <div v-if="sheets.length" class="sheetAndToggle">
          <div class="sheetList">
            <Button v-for="sheet in sheets" :label="sheet.name" 
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
        <div v-else class="sheetList">
          <label>Your custom sheets will show here once you save them.</label>
        </div>
      </FieldSet>
      <label v-if="sheets.length>=maxSheetCount" class="experiment">We are currently experimenting with a limit of {{ maxSheetCount }} sheets</label>
    </div>
  <div v-else>
    <FieldSet legend="Your Sheets">
      <div v-if="sheets.length" class="sheetAndToggle">
        <div class="sheetList">
          <Button v-for="sheet in sheets" :label="getSheetName(sheet)" 
            :icon="deleteMode?'pi pi-times':'pi pi-copy'" 
            :severity="deleteMode?'danger':'primary'"
            :title="(deleteMode?'Delete':mode=='load'?'Load':'Overwrite')+' \''+sheet.name+'\''"
            @click="onSheetSelected(sheet)"></Button>
          <Button title="Toggle delete mode"
            :severity="deleteMode?'primary':'danger'" 
            :icon="deleteMode?'pi pi-copy':'pi pi-trash'"
            @click="onToggleDeleteMode"></Button>
        </div>
      </div>
      <div v-else class="sheetList">
        <label>Your custom sheets will show here once you save them.</label>
      </div>
    </FieldSet>
    <FieldSet legend="Demos & Shared">
      <div class="codeFetch mb-2">
        <InputGroup>
          <InputGroupAddon>Code</InputGroupAddon>
          <InputText v-model="sheetCode" />
        </InputGroup>
        <Button label="Fetch by Code" icon="pi pi-file-import" severity="secondary" 
          :disabled="!sheetCode.length"
          @click="onSheetFetchCode"></Button>
      </div>
      <div class="sheetList mb-2">
        <Button label="Tiles Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" 
          @click="onLoadDefault(sheetNameDemoTiles)"></Button>
        <Button label="Checklist Demo" icon="pi pi-clipboard"  title="Replace all with Demo Checklist" 
          @click="onLoadDefault(sheetNameDemoChecklist)"></Button>
        <Button label="New Sheet" icon="pi pi-file" title="Both pages will show page selection" 
          @click="onLoadDefault(sheetNameNew)"></Button>
      </div>
    </FieldSet>

    <FieldSet legend="Content">
      <div v-if="targetSheet" class="sheetDescription">
        <div class="bold">Name</div><div>{{targetSheet.name}}</div>
        <div class="bold">Front</div><div>{{ describePage(targetSheet.data[0]) }}</div>
        <div class="bold">Back</div><div>{{ describePage(targetSheet.data[1]) }}</div>
      </div>
      <div v-else>
        <div>Select a sheet above from Your list, Demos or Shared</div>
      </div>
    </FieldSet>
    <div class="actionDialog gap-2">
        <Button label="Do Not Load" @click="emits('close')" link></Button>
        <Button label="Send" @click="emits('load',targetSheet)" :disabled="!targetSheet"></Button>
      </div>
  </div>
  </Dialog>
</template>

<style scoped>
.sheetList {
  display: flex;
  flex-flow: wrap;
  gap: 5px;
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

.codeFetch {
  display: grid;
  grid-template-columns: auto auto;
  gap:1rem;
  align-items: center;
}

.experiment {
  color:brown;
  font-size: 0.8rem;
}
.code {
  padding-left: 0.5rem;
  font-weight: bold;
}
.sheetDescription {
  display: grid;
  gap: 5px;
  grid-template-columns: 3.5rem auto;
}
.bold {
  font-weight: bold;
}
.sheetProps {
  display: grid;
  gap: 10px;
  grid-template-columns: 50% 50%;
}
.alignedRow {
  display: flex;
  /* line-height: 2rem; */
  align-items: center;
  gap: 5px;
}
</style>