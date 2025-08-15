<template>
  <Dialog modal header="Print">
    <div class="printPopup">
      <div v-if="props.templateModified" class="versionWarning">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']"></font-awesome-icon>
        Warning: Unsaved changes. Checklists version number only increase upon saving template.
      </div>
      <div class="pageOptions">
        <div class="pageOptionLabel">Page Selection</div>
        <PageSelection v-model="pageSelection" @change="onNewOptions" />
        
        <template v-if="!isFullPageFormat">
          <div class="pageOptionLabel">Pages per sheet</div>
          <OneChoice v-model="pagePerSheet" :choices="[onePage,twoPages]" @change="onNewOptions"/>
          
          <div class="pageOptionLabel">Back Page Orientation</div>
          <OneChoice v-model="flipBackPage" :choices="[normalOrientation, flippedOrientation]" @change="onNewOptions" />

          <div class="pageOptionLabel">Vertical Info Bar</div>
          <OneChoice v-model="showSideBar" :choices="[showOption, hideOption]" @change="onNewOptions" />
        </template>
        
        <template v-else>
          <div class="pageOptionLabel">Format</div>
          <div class="formatInfo">Full Page (one page per sheet)</div>
        </template>
      </div>
      <FieldSet legend="Printing Tips">
        <ul class="note" v-if="!isFullPageFormat">
          <li>Two pages per sheet will fold to kneeboard size</li>
          <li>Flipped back page can be read when front page is clipped</li>
          <li>You can save to PDF format from the next screen</li>
        </ul>
        <ul class="note" v-else>
          <li>Full page templates print one page per sheet in portrait mode</li>
          <li>The number of printed pages will match the template page count</li>
          <li>You can save to PDF format from the next screen</li>
        </ul>
        </FieldSet>
      <div class="actionDialog gap-2">
        <div class="floatLeft">
            <font-awesome-icon :icon="['fas', 'question']"
                @click="onHelp" title="Perfect Prints help"></font-awesome-icon>
        </div>
        <Button label="Do Not Print" @click="emits('close')" link></Button>
        <Button label="Print" @click="onPrint"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { UserUrl } from '../../lib/UserUrl';

import OneChoice from '../shared/OneChoice.vue';

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import PageSelection from './PageSelection.vue';
import { OneChoiceValue } from '../../model/OneChoiceValue';
import { PrintOptions } from './PrintOptions';

const emits = defineEmits(["print","options",'close']);

const onePage = new OneChoiceValue('One', 1)
const twoPages = new OneChoiceValue('Two', 2)
const normalOrientation = new OneChoiceValue('Normal', false)
const flippedOrientation = new OneChoiceValue('Flipped', true, 'So you can read back page when front page is clipped')
const showOption = new OneChoiceValue('Show', true, 'Show Version Number, Tail # and Date')
const hideOption = new OneChoiceValue('Hide', false, 'Hide Version Number, Tail # and Date')

const pagePerSheet = ref(twoPages)
const flipBackPage = ref(normalOrientation)
const pageSelection = ref<boolean[]>([true, true, true])
const showSideBar = ref(showOption)

// Computed property to check if the format is fullpage
const isFullPageFormat = computed(() => props.format === 'fullpage')

//---------------------
// Props management
const props = defineProps({
  pageSelection: { type: Array<boolean>, required: true},
  templateModified: { type: Boolean, default: false },
  format: { type: String, default: 'kneeboard' },
})

function loadProps( props:any) {
  // console.log('[PrintOptions] loadProps', props)
  pageSelection.value = props.pageSelection
}

onMounted( () => {
  loadProps(props)
  // Set pagePerSheet to onePage for fullpage format
  if (props.format === 'fullpage') {
    pagePerSheet.value = onePage
  }
})  

// Watch for format changes
watch(() => props.format, (newFormat) => {
  if (newFormat === 'fullpage') {
    pagePerSheet.value = onePage
  }
})

watch( props, async() => {
  // console.log('[PrintOptions] props changed', props)
  loadProps( props)
})

//---------------------

function getOptions():PrintOptions|undefined {
  if(!pagePerSheet.value) return undefined;
  
  return new PrintOptions(
    flipBackPage.value?.value,
    isFullPageFormat.value ? 1 : pagePerSheet.value.value,
    pageSelection.value,
    showSideBar.value.value
  )
}

function onHelp() {
  UserUrl.open( UserUrl.printGuide)
}

function onPrint() {
  // console.log('[Print.onPrint] options', JSON.stringify(options.value),'pageOptions', JSON.stringify(pageOption.value))
  emits('print', getOptions())
}

function onNewOptions() {
  const options = getOptions()
  // console.debug('[PrintOptions.onNewOptions]', options)
  if(options) emits('options', options)
}

</script>

<style scoped>
.versionWarning {
  color: #ff8800;
  background-color: #fff8f0;
  border: 1px solid #ff8800;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.floatLeft {
    position:absolute;
    left: 2rem;
    line-height: 2.5rem;
    height: 2.5rem;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: var(--bg);
    font-size: 0.9rem;
}
.modesList {
  display: flex;
  flex-flow: wrap;
  gap: 2rem;
}

.pageOptions {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 0.5rem 1rem;
  line-height: 1rem;
}
.pageOptionLabel {
  text-align: right;
}

.disabledOption {
  color: #999;
  font-style: italic;
  padding-left: 10px;
}

.formatInfo {
  font-weight: bold;
  color: #2196F3;
  padding: 5px 0;
}

.printPopup {
  display: flex;
  flex-flow: column;
  gap:10px;
  width:35rem;
}
.note {
  font-size: 0.8rem;
}

ul.note {
  margin: 0
}

li {
  line-height: 1.2rem;
}

:deep(.p-fieldset-legend) {
  border: none;
  background: none;
  padding: 0.5rem;
}
:deep(.p-fieldset-content) {
  padding: 0;
}


</style>
