<template>
  <Dialog modal header="Print">
    <div class="printPopup">
      <div v-if="props.templateModified" class="versionWarning">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']"></font-awesome-icon>
        <div>Unsaved changes.<span class="goodEnough">If it's good enough to print, it's good enough.</span></div>
      </div>
      <div class="pageOptions">
        <div class="pageOptionLabel">Page Selection</div>
        <PageSelection v-model="pageSelection" @change="onNewOptions" />
        
        <template v-if="!isFullPageFormat">

          
          <div class="pageOptionLabel">Back Page Orientation</div>
          <OneChoice v-model="flipBackPage" :choices="[normalOrientation, flippedOrientation]" @change="onNewOptions" />


          <div class="pageOptionLabel">Clip Margin</div>
          <OneChoice v-model="clipMarginSelected" :choices="clipMarginOptions" @change="onNewOptions" />
        </template>
        
        <template v-else>
          <div class="pageOptionLabel">Format</div>
          <div class="formatInfo">Full Page (one page per sheet)</div>
        </template>
      </div>
      <FieldSet legend="Margin Notes" v-if="!isFullPageFormat">
        <div class="vibContainer">
          <OneChoice v-model="vibShowMode" :choices="[vibShowChoice, vibHideChoice]" @change="onNewOptions" />
          <div class="vibItems">
             <div v-for="item in vibContentOptions" :key="item.value" class="field-checkbox">
                 <Checkbox v-model="vibSelectedItems" :inputId="item.value" :value="item.value" @change="onNewOptions" :disabled="!vibShowMode.value" />
                 <label :for="item.value" :class="{ 'disabled-label': !vibShowMode.value }">{{ item.label }}</label>
             </div>
          </div>
        </div>
      </FieldSet>
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
        <Button v-if="upgrade" label="Upgrade to use Print Options" @click="onUpgrade" severity="warning"></Button>
        <Button label="Print" @click="onPrint" :disabled="upgrade"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { UserUrl } from '../../lib/UserUrl';
import { OneChoiceValue } from '../../models/OneChoiceValue';
import OneChoice from '../shared/OneChoice.vue';

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import PageSelection from './PageSelection.vue';
import { currentUser } from '../../assets/data';
import { AccountType } from '@gak/shared';

import Checkbox from 'primevue/checkbox'
import { VerticalInfoBarContent } from '../../models/VerticalInfoBarOption';
import { PrintOptions } from './PrintOptions';
import { useRouter } from 'vue-router';

const emits = defineEmits(["print","options",'close']);

const normalOrientation = new OneChoiceValue('Normal', false)
const flippedOrientation = new OneChoiceValue('Flipped', true, 'You can read back page without unclipping')

const flipBackPage = ref(normalOrientation)
const pageSelection = ref<boolean[]>([true, true, true])
const simmer = ref(true)
const upgrade = ref(false)
// Computed property to check if the format is fullpage
const isFullPageFormat = computed(() => props.format === 'fullpage')
const router = useRouter()

const vibShowChoice = new OneChoiceValue('Show', true, 'Show vertical info bar')
const vibHideChoice = new OneChoiceValue('Hide', false, 'Hide vertical info bar')
const vibShowMode = ref(vibShowChoice)

const vibSelectedItems = ref<VerticalInfoBarContent[]>([
  VerticalInfoBarContent.Version, 
  VerticalInfoBarContent.Tail, 
  VerticalInfoBarContent.Date,
  VerticalInfoBarContent.PageName
])

const vibContentOptions = [
  { label: 'Version', value: VerticalInfoBarContent.Version },
  { label: 'Name', value: VerticalInfoBarContent.PageName },
  { label: 'Tail #', value: VerticalInfoBarContent.Tail },
  { label: 'Date', value: VerticalInfoBarContent.Date },
]

const clipMarginNone = new OneChoiceValue('None', 0)
const clipMarginSmall = new OneChoiceValue('Small', 24) // ~0.25in
const clipMarginLarge = new OneChoiceValue('Large', 48) // ~0.50in
const clipMarginSelected = ref(clipMarginNone)
const clipMarginOptions = ref([clipMarginNone, clipMarginSmall, clipMarginLarge])

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
  simmer.value = currentUser.accountType == AccountType.simmer
}

onMounted( () => {
  loadProps(props)
})  

// Watch for format changes


watch( props, async() => {
  // console.debug('[PrintOptions] props changed', props)
  loadProps( props)
})

//---------------------

function getOptions():PrintOptions|undefined {
  return new PrintOptions(
    flipBackPage.value?.value,
    pageSelection.value,
    vibShowMode.value.value,
    vibSelectedItems.value,
    clipMarginSelected.value.value
  )
}

function onHelp() {
  UserUrl.open( UserUrl.printGuide)
}

function onNewOptions() {
  const options = getOptions()
  // console.debug('[PrintOptions.onNewOptions]', options)
  if(options) {
    if( simmer.value) { // free acounts cannot change options
      const unselected = options.pageSelection.find( (p:boolean) => !p)
      // user need to upgrade if they changed any default settings
      // Check if VIB options are modified from default (Show + All)
      const isVibDefault = options.vibShow && options.vibItems.length >= 3; // Basic check, refining might be needed
      
      upgrade.value = options.flipBackPage || !isVibDefault || (unselected === false) || (options.clipMargin > 0)
    }
    emits('options', options)
  } 
}

function onPrint() {
  // console.log('[Print.onPrint] options', JSON.stringify(getOptions()),'pageOptions', JSON.stringify(pageSelection.value))
  emits('print', getOptions())
}

function onUpgrade() {
  // navigate to plans page
  router.push('/plans')
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
  font-size: 0.9rem;
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
.vibContainer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.vibItems {
  display: flex;
  flex-flow: wrap;
  gap: 1rem;
  padding-left: 0.5rem;
}
.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.disabled-label {
  color: #999;
  cursor: not-allowed;
}
.goodEnough {
  padding-left: 10px;
  font-weight: 400;
  font-size: 0.8rem;
  font-style: italic;
}
</style>
