<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";

const emits = defineEmits(["close","load","save"]);

// mode must match events 'load' and 'save'
const props = defineProps({ 
  mode: { type: String, default: 'load'},
})


const target = ref(null)
// onClickOutside(target, ()=>emit('modal-close'))
const newPageName = ref('')
// const pages = ref(['Renton','Skyline','Chealis',  "abcdefghij",
//   "klmnopqrst",
//   "uvwxyzabcd",
//   "efghijklmn",
//   "opqrstuvwx",
//   "yzabcdefgh",
//   "ijklmnopqr",
//   "stuvwxyzab",
//   "cdefghijkl",
//   "mnopqrstuv"])
// const pages = ref(['Renton'])
const pages = ref([])

</script>

<template>
  <Dialog modal :header="mode=='load'?'Load':'Save'" style="width:45rem">
    <FieldSet :legend="mode=='load'?'Your Sheets':'Overwrite Existing Sheet'">
      <div v-if="pages.length" class="sheetList">
        <Button v-for="page in pages" :label="page" icon="pi pi-file" @click="emits(mode,page)"></Button>
      </div>
      <div v-else class="sheetList">
        <label>Your custom sheets will show here once you save them.</label>
      </div>
    </FieldSet>
    <FieldSet legend="Defaults" v-if="mode=='load'">
      <div class="sheetList">
        <Button label="Demo" icon="pi pi-clipboard"  title="Replace all with Demo Tiles" @click="emits('load','default-demo')"></Button>
        <Button label="Reset" icon="pi pi-trash" title="Replace all tiles ion the page" @click="emits('load','default-reset')"></Button>
      </div>
    </FieldSet>
    <FieldSet legend="Create New Sheet" v-else>
      <div class="row mb-2">
        <InputGroup>
          <InputGroupAddon>Name</InputGroupAddon>
          <InputText v-model="newPageName"/>
        </InputGroup>
        <Button label="Save" severity="secondary" :disabled="!newPageName.length"
          @click="emits('save',newPageName)"></Button>
      </div>
    </FieldSet>
  </Dialog>
</template>

<style scoped>
.sheetList {
  display: flex;
  flex-flow: wrap;
  gap: 5px;
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
</style>