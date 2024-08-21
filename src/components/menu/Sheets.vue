<script setup>
import { ref, onMounted, watch } from "vue";

import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton"

import { customSheetDelete, maxSheetCount, sheetGetByCode, sheetGetById, urlKneeboard } from "../../assets/data"
import { describePage, getSheetBlank, getSheetDemo, getSheetDemoChecklist, getSheetDemoTiles, sheetNameDemo, sheetNameDemoChecklist, sheetNameDemoTiles, sheetNameNew } from '../../assets/sheetData'
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
    sheets.value = props.user.sheets
    // console.log('[Sheets.loadProps]', JSON.stringify(sheets.value))
  }
  targetSheet.value = props.sheet;
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
const fetching = ref(false)
const directLink = ref('')

function changeTargetSheet(newSheet) {
  fetching.value = false;
  targetSheet.value = newSheet
  publish.value = newSheet?.publish ? pubPublic : pubPrivate
  sheetNameText.value = newSheet ? newSheet.name : ''
  // console.log('[Sheets.changeTargetSheet] publish', publish.value)
  if( newSheet && newSheet.code) {
    directLink.value = urlKneeboard + '?sheet=' + newSheet.code
  } else {
    directLink.value = ''
  }
}

function getSheetName(sheet=null) {
  if(!sheet || !sheet.name) return '?'
  let name = sheet.name;
  if(sheet.publish) name  = name +' (' + sheet.code + ')'
  return name;
}

function onButtonClose() {
  changeTargetSheet()
  emits('close')
}

function onButtonLoad() {
  emits('load',targetSheet.value)
  changeTargetSheet()
}

function onButtonSave() {
  const targetSheetId = targetSheet?.value?.id
  const sheet = {id:targetSheetId,name:sheetNameText.value,publish:publish.value==pubPublic}

  emits('save',sheet)
  changeTargetSheet()
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
 * A default sheet has been selected load its data into
 * @param sheetName 
 */
function onLoadDefault(sheetName) {
  if( sheetName == sheetNameDemo) {
    changeTargetSheet( getSheetDemo())
  } else if( sheetName == sheetNameDemoTiles) {
    changeTargetSheet( getSheetDemoTiles())
  } else if( sheetName == sheetNameDemoChecklist) {
    changeTargetSheet( getSheetDemoChecklist())
  } else if( sheetName == sheetNameNew) { 
    changeTargetSheet( getSheetBlank())
  } else {
    console.log('[Sheets.onLoadDefault] unknown sheetName', sheetName)
    changeTargetSheet()
  }
}

function onNewSheet() {
  const newSheet = {name:sheetNameText.value, publish:publish.value==pubPublic}
  changeTargetSheet(newSheet)
}

async function onSheetFetchCode() {
  fetching.value = true;
  await sheetGetByCode(sheetCode.value).then( sheet => {
    // console.log('[Sheets.onSheetFetch] sheet', JSON.stringify(sheet))
    // showToast('Fetch', 'Sheet found')
    changeTargetSheet(sheet)
    if(!sheet) {
      showToast('Fetch','Code not found ' + sheetCode.value, toastError)
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
        changeTargetSheet()
      }
    })
  } else { // load or save
    // console.log('[Sheets.onSheetSelected] load', JSON.stringify(sheet))
    fetching.value = true;
    await sheetGetById(sheet.id).then( sheet => {
      // console.log('[Sheets.fetchSheet]', JSON.stringify(sheet))
      changeTargetSheet(sheet)
    }).catch( e => {
      console.log('[Sheets.onSheetSelected] fetch failed', e)    
      changeTargetSheet()
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
  <Dialog modal :header="mode=='load'?'Load':'Save'" style="width:45rem">
    <div v-if="mode=='save'">
      <FieldSet :legend="'Your'+(sheets.length?(' '+sheets.length):'')+' sheets'">
        <div v-if="sheets.length" class="sheetAndToggle">
          <div class="sheetList">
            <Button v-for="sheet in sheets" :label="getSheetName(sheet)" 
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
      <FieldSet legend="Properties">
        <div class="sheetProps">
          <InputGroup class="pageName">
            <InputGroupAddon>Name</InputGroupAddon>
            <InputText v-model="sheetNameText"/>
          </InputGroup>
          <Button label="Make Copy" icon="pi pi-file" severity="secondary" title="Create a copy instead or overwritting"
            :disabled="!(targetSheet?.id)"
            @click="onNewSheet"></Button>
          <div class="alignedRow">
            <div>Access:</div>
            <SelectButton v-model="publish" :options="[pubPublic, pubPrivate]" aria-labelledby="basic" />
          </div>
          <div class="alignedRow codeAndLink" v-show="directLink">
            <div>Share code </div>
            <div class="bold"><a :href="directLink" target="_blank">{{ targetSheet?.code ? targetSheet.code:'(none)' }}</a></div>
            <Button icon="pi pi-clipboard" title="Copy link to clipboard" @click="onCopyURL"></Button>
          </div>
          <div class="sheetDescription">
            <div class="bold pageDescription">Front</div><div class="pageDescription">{{ describePage(targetSheet, 0) }}</div>
            <div class="bold pageDescription">Back</div><div class="pageDescription">{{ describePage(targetSheet, 1) }}</div>
          </div>
        </div>
      </FieldSet>
      <label v-if="sheets.length > maxSheetCount || (sheets.length==maxSheetCount && !(targetSheet?.id))" class="experiment">We are currently experimenting with a limit of {{ maxSheetCount }} sheets</label>
      <div v-else class="actionDialog gap-2">
        <Button label="Do Not Save" @click="onButtonClose" link></Button>
        <Button :label="targetSheet?.id ? 'Overwrite Sheet' : 'Save Sheet'" 
          @click="onButtonSave" 
          :disabled="!sheetNameText.length"></Button>
      </div>
    </div>
  <div v-else><!-- load -->
    <FieldSet legend="Your Sheets">
      <div v-if="sheets.length" class="sheetAndToggle">
        <div class="sheetList">
          <Button v-for="sheet in sheets" :label="getSheetName(sheet)" 
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
      <div v-else class="sheetList">
        <label>Your custom sheets will show here once you save them.</label>
      </div>
    </FieldSet>
    <FieldSet legend="Demos & Shared">
      <div class="alignedRow mb-2">
        <InputGroup class="sharedCode">
          <InputGroupAddon>Code</InputGroupAddon>
          <InputText v-model="sheetCode" />
          <Button icon="pi pi-search" @click="onSheetFetchCode" :disabled="!sheetCode.length" severity="secondary"></Button>
        </InputGroup>
        <!-- <Button label="Fetch by Code" icon="pi pi-file-import" severity="secondary" 
          :disabled="!sheetCode.length"
          @click="onSheetFetchCode"></Button> -->
      <!-- <div class="sheetList mb-2"> -->
        <Button label="Default" icon="pi pi-clipboard"  title="Load Default Sheet" 
          @click="onLoadDefault(sheetNameDemo)"></Button>
        <Button label="All Tiles" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" 
          @click="onLoadDefault(sheetNameDemoTiles)"></Button>
        <Button label="Checklist" icon="pi pi-clipboard"  title="Replace all with Demo Checklist" 
          @click="onLoadDefault(sheetNameDemoChecklist)"></Button>
      <!-- </div> -->
    </div>
  </FieldSet>
    <FieldSet legend="Content">
      <div v-if="targetSheet" class="sheetDescription">
        <div class="bold">Name</div><div>{{fetching ? 'Fetching...' : targetSheet.name}}</div>
        <div class="bold pageDescription">Front</div><div class="pageDescription">{{ fetching ? '' : describePage(targetSheet, 0) }}</div>
        <div class="bold pageDescription">Back</div><div class="pageDescription">{{ fetching ? '' : describePage(targetSheet, 1) }}</div>
      </div>
      <div v-else>Select a sheet above from Your list, Demos or Shared</div>
    </FieldSet>
    <div class="actionDialog gap-2">
      <Button label="Do Not Load" @click="onButtonClose" link></Button>
      <Button label="Load Sheet" @click="onButtonLoad" :disabled="!targetSheet || fetching"></Button>
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
.sheetDescription {
  display: grid;
  gap: 5px;
  grid-template-columns: 3.5rem auto;
  grid-column: 1 / span 3;
}
.sheetProps {
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