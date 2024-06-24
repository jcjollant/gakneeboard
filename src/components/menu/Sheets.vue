<script setup>
import { ref, onMounted, watch } from "vue";
import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import { customSheetDelete } from "../../assets/data"

const emits = defineEmits(["close","delete","load","save","loadDefault"]);

// mode must match events 'load' and 'save'
const props = defineProps({ 
  mode: { type: String, default: 'load'},
  user: { type: Object, default: null},
})

const target = ref(null)
const newSheetName = ref('')
const sheets = ref([])
const deleteMode = ref(false)

function loadProps(props) {
  if( props.user && props.user.sheets) {
    sheets.value = props.user.sheets
    // console.log('[Sheets.loadProps]', JSON.stringify(sheets.value))
  }
}

onMounted( () => {
  loadProps(props)
})

function onSaveNewSheet() {
  const sheet = {id:0,name:newSheetName.value}
  newSheetName.value = ''

  emits('save',sheet)
}

async function onSheetSelected(sheet) {
  if(deleteMode.value) {
    await customSheetDelete(sheet).then( () => {
      // console.log('[Sheets.onSheetSelected]', sheet)
      if( sheet) {
        // remove that sheet from the list
        sheets.value = sheets.value.filter( s => s.id != sheet.id)
        emits('delete',sheet)
      }
    })
  } else { // load or save
    emits(props.mode,sheet)
  }
}

function onToggleDeleteMode() {
  deleteMode.value = !deleteMode.value
}

watch( props, async() => {
  loadProps( props)
})


</script>

<template>
  <Dialog modal :header="mode=='load'?'Load':'Save'" style="width:45rem">
    <FieldSet :legend="mode=='load'?'Your Sheets':'Overwrite Existing Sheet'">
      <div v-if="sheets.length" class="sheetAndToggle">
        <div class="sheetList">
          <Button v-for="sheet in sheets" :label="sheet.name" 
            :icon="deleteMode?'pi pi-times':'pi pi-copy'" 
            :severity="deleteMode?'danger':'primary'"
            :title="(deleteMode?'Delete':mode=='load'?'Load':'Save')+' sheet'"
            @click="onSheetSelected(sheet)"></Button>
        </div>
        <Button title="Toggle delete mode"
          :severity="deleteMode?'primary':'danger'" 
          :icon="deleteMode?'pi pi-copy':'pi pi-trash'"
          @click="onToggleDeleteMode"></Button>
      </div>
      <div v-else class="sheetList">
        <label>Your custom sheets will show here once you save them.</label>
      </div>
    </FieldSet>
    <FieldSet legend="Defaults" v-if="mode=='load'">
        <div class="sheetList">
          <Button label="Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" 
            @click="emits('loadDefault','default-demo')"></Button>
          <Button label="New" icon="pi pi-file" title="Replace all tiles on the page" 
            @click="emits('loadDefault','default-reset')"></Button>
        </div>
    </FieldSet>
    <FieldSet legend="Save as New Sheet" v-else>
      <div class="row mb-2">
        <InputGroup>
          <InputGroupAddon>Name</InputGroupAddon>
          <InputText v-model="newSheetName"/>
        </InputGroup>
        <Button label="Save" icon="pi pi-save" severity="secondary" 
          :disabled="!newSheetName.length||sheets.find(sheet=>sheet.name==newSheetName)||sheets.length>=5"
          @click="onSaveNewSheet"></Button>
      </div>
      <label v-if="sheets.length>=5" class="experiment">We are currently experimenting custom sheets with a limit of 5</label>
    </FieldSet>
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

.row {
  display: flex;
  gap:1rem;
}

.experiment {
  color:brown;
  font-size: 0.8rem;
}
</style>