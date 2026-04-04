<template>
  <Dialog modal header="Print">
    <div class="printPopup">
      <div v-if="upgrade" class="upgrade-banner">
        <div class="banner-content">
          <font-awesome-icon icon="circle-info" class="banner-icon" />
          <div class="banner-text">
            Print Options are available from the <strong>Student Pilot</strong> membership and above. You can print using the default options on your free account or upgrade.
          </div>
          <Button label="View Plans" class="p-button-sm p-button-warning" @click="onUpgrade" />
        </div>
      </div>

      <FieldSet legend="Pages">
        <div class="pageOptions">
          <div class="pageOptionLabel">Pages to Print</div>
          <PageSelection v-model="pageSelection" @change="onNewOptions" />
          <div class="pageOptionLabel">Back Page Orientation</div>
          <ChoiceList v-model="flipBackPage" :choices="[normalOrientation, flippedOrientation]" @change="onNewOptions" :disabled="!currentUser.canUseAdvancedPrinting" :emitObject="true" />
          <div class="pageOptionLabel">Page Sequence</div>
          <ChoiceList v-model="backToBackSelected" :choices="backToBackOptions" @change="onNewOptions" :disabled="!currentUser.canUseAdvancedPrinting" :emitObject="true" />
      </div>
      </FieldSet>
      <FieldSet legend="Margins" v-if="!isFullPageFormat">
        <div class="vibContainer">
          <div class="pageOptions">
            <div class="pageOptionLabel">Clip Padding</div>
            <ChoiceList v-model="clipMarginSelected" :choices="clipMarginOptions" @change="onNewOptions" :disabled="!currentUser.canUseAdvancedPrinting" :emitObject="true" />
            
            <div class="pageOptionLabel">Text</div>
            <div class="vibActions">
              <AnyOf v-model="vibText" @change="onNewOptions" :disabled="!currentUser.canUseAdvancedPrinting" :allowsNoSelection="true" />
              <font-awesome-icon icon="plus" class="vibBtn" @click="vibText.forEach((c: OneChoiceValue)=>c.active=true); onNewOptions()" title="Select all text" />
              <font-awesome-icon icon="minus" class="vibBtn" @click="vibText.forEach((c: OneChoiceValue)=>c.active=false); onNewOptions()" title="Select no text" />
            </div>

            <div class="pageOptionLabel">Decoration</div>
            <div class="vibActions">
              <AnyOf v-model="vibDecorations" @change="onNewOptions" :disabled="!currentUser.canUseAdvancedPrinting" :allowsNoSelection="true" />
            </div>
          </div>
        </div>
      </FieldSet>
      <div v-if="!currentUser.canUseAdvancedPrinting" class="advanced-printing-hint">
        Advanced Layout and Margin options are available with a higher membership.
      </div>
      <FieldSet legend="Hints">
        <ul class="note" v-if="!isFullPageFormat">
          <li><strong>Flipped</strong> back page can be read when front page is clipped</li>
          <li><strong>Side by Side</strong> prints will fold to kneeboard size</li>
          <li>For <strong>Back to Back</strong>, print on both sides AND flip on the <strong>short</strong> edge</li>
          <li>Use <strong>Create Document</strong> to import in Foreflight</li>
          <li>If Print Preview doesn't show, check your browser is not blocking popups</li>
        </ul>
        <ul class="note" v-else>
          <li>Full page templates print one page per sheet in portrait mode</li>
          <li>The number of printed pages will match the template page count</li>
        </ul>
      </FieldSet>
      <div class="actionDialog gap-2">
        <div class="floatLeft">
            <font-awesome-icon :icon="['fas', 'question']"
                @click="onHelp" title="Perfect Prints help"></font-awesome-icon>
        </div>
        <Button label="Do Not Print" @click="emits('close')" link></Button>
        <Button v-if="FeatureFlags.CUSTOM_KNEEBOARD_LAMINATION" @click="emits('laminate', getOptions())" class="store-btn" title="We print, laminate, and ship it to you!">
            <font-awesome-icon icon="store" class="mr-2" /> Laminate (Print & Ship)
        </Button>
        <Button label="Create Document" @click="onExportPdf" :disabled="upgrade || !currentUser.canExportPdf" link></Button>
        <Button label="Print" @click="onPrint" :disabled="upgrade"></Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { UserUrl } from '../../lib/UserUrl';
import { OneChoiceValue } from '../../models/OneChoiceValue';
import ChoiceList from '../shared/ChoiceList.vue';

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FieldSet from 'primevue/fieldset'
import PageSelection from './PageSelection.vue';
import { currentUser } from '../../assets/data';
import { AccountType, FeatureFlags } from '@gak/shared';
import { LocalStoreService } from '../../services/LocalStoreService';

import Checkbox from 'primevue/checkbox'
import { VerticalInfoBarContent } from '../../models/VerticalInfoBarOption';
import AnyOf from '../shared/AnyOf.vue';
import { PrintOptions } from './PrintOptions';
import { useRouter } from 'vue-router';
import { useToaster } from '../../assets/Toaster';
import { useToast } from 'primevue/usetoast';

const emits = defineEmits(["print", "export-pdf", "options", 'close', 'laminate']);

const normalOrientation = new OneChoiceValue('Normal', false)
const flippedOrientation = new OneChoiceValue('Flipped', true, 'You can read back page without unclipping')

const flipBackPage = ref(normalOrientation)
const pageSelection = ref<boolean[]>([true, true, true])
const simmer = ref(true)
const upgrade = ref(false)
const toaster = useToaster(useToast())
// Computed property to check if the format is fullpage
const isFullPageFormat = computed(() => props.format === 'fullpage')
const router = useRouter()

const vibText = ref<OneChoiceValue[]>([
  new OneChoiceValue('Version', VerticalInfoBarContent.Version, 'Kneeboard Current Version Number'),
  new OneChoiceValue('Name', VerticalInfoBarContent.PageName, 'Kneeboard Name'),
  new OneChoiceValue('Tail #', VerticalInfoBarContent.Tail, 'Tail Number'),
  new OneChoiceValue('Date', VerticalInfoBarContent.Date, 'Date'),
])

const vibDecorations = ref<OneChoiceValue[]>([
  new OneChoiceValue('Logo', VerticalInfoBarContent.Brand, 'Kneeboard.ga Logo'),
  new OneChoiceValue('Guide', VerticalInfoBarContent.Guide, 'Fold/Cut guide'),
])

const backToBackOptions = [
  new OneChoiceValue('Side by Side', false),
  new OneChoiceValue('Back to Back', true)
]

const backToBackSelected = ref(backToBackOptions[0])

const clipMarginNone = new OneChoiceValue('None', 0, 'No margin added')
const clipMarginSmall = new OneChoiceValue('Small', 24, 'Small margin on top') // ~0.25in
const clipMarginLarge = new OneChoiceValue('Large', 48, 'Large margin on top') // ~0.50in
const clipMarginSelected = ref(clipMarginNone)
const clipMarginOptions = ref([clipMarginNone, clipMarginSmall, clipMarginLarge])

//---------------------
// Props management
const props = defineProps({
  pageSelection: { type: Array<boolean>, required: true},

  format: { type: String, default: 'kneeboard' },
  version: { type: Number, default: 0 },
})

function loadProps( props:any) {
  // console.log('[PrintOptions] loadProps', props)
  pageSelection.value = props.pageSelection
  simmer.value = currentUser.accountType == AccountType.simmer

  // Update version label if available
  const versionChoice = vibText.value.find((c: OneChoiceValue) => c.value === VerticalInfoBarContent.Version)
  if (versionChoice) {
      versionChoice.label = props.version > 0 ? `V${props.version}` : 'Version'
  }

  // Restore saved options
  const saved = LocalStoreService.getPrintOptions()
  if (saved) {
    if (saved.flipBackPage !== undefined) flipBackPage.value = saved.flipBackPage ? flippedOrientation : normalOrientation
    if (saved.vibItems !== undefined) {
      const allChoices = [...vibText.value, ...vibDecorations.value]
      allChoices.forEach((c: OneChoiceValue) => {
        c.active = saved.vibItems.includes(c.value)
      })
    }
    if (saved.clipMargin !== undefined) {
       const found = clipMarginOptions.value.find(o => o.value === saved.clipMargin)
       if (found) clipMarginSelected.value = found
    }
    if (saved.backToBack !== undefined) {
        const found = backToBackOptions.find(o => o.value === saved.backToBack)
        if (found) backToBackSelected.value = found
    }
    if (saved.showCenterGuide !== undefined) {
      const guideChoice = vibDecorations.value.find((c: OneChoiceValue) => c.value === VerticalInfoBarContent.Guide)
      if (guideChoice) guideChoice.active = saved.showCenterGuide
    }
  }
  
  nextTick(() => {
    onNewOptions()
  })
}

onMounted( () => {
  loadProps(props)
})  

// Watch for format changes


watch( props, async() => {
  // console.debug('[PrintOptions] props changed', props)
  loadProps( props)
})

watch(backToBackSelected, (newVal) => {
    if (newVal?.value === true) {
        toaster.info('Back to Back Printing', 'Print on both sides and flip along the SHORT edge');
    }
})

//---------------------

function getOptions():PrintOptions|undefined {
  const allChoices = [...vibText.value, ...vibDecorations.value]
  return new PrintOptions(
    flipBackPage.value?.value,
    pageSelection.value,
    true, // vibShow is now always true (controlled by AnyOf selections)
    allChoices.filter((c: OneChoiceValue) => c.active && c.value !== VerticalInfoBarContent.Guide).map((c: OneChoiceValue) => c.value),
    clipMarginSelected.value.value,
    backToBackSelected.value.value,
    vibDecorations.value.find((c: OneChoiceValue) => c.value === VerticalInfoBarContent.Guide)?.active
  )
}

function onHelp() {
  UserUrl.open( UserUrl.printGuide)
}

function onSelectAll() {
  [...vibText.value, ...vibDecorations.value].forEach(c => c.active = true)
  onNewOptions()
}

function onSelectNone() {
  [...vibText.value, ...vibDecorations.value].forEach(c => c.active = false)
  onNewOptions()
}

function onNewOptions() {
  const options = getOptions()
  // console.debug('[PrintOptions.onNewOptions]', options)
  if(options) {
    LocalStoreService.savePrintOptions(options)
    if( simmer.value) { // free acounts cannot change options
      const unselected = options.pageSelection.find( (p:boolean) => !p)
      // user need to upgrade if they changed any default settings
      // Check if VIB options are modified from default (All 4 items active)
      const isVibDefault = options.vibItems.length >= 3; // Basic check, refining might be needed
      
      upgrade.value = options.flipBackPage || !isVibDefault || (unselected === false) || (options.clipMargin > 0) || options.showCenterGuide
    }
    emits('options', options)
  } 
}

function onPrint() {
  // console.log('[Print.onPrint] options', JSON.stringify(getOptions()),'pageOptions', JSON.stringify(pageSelection.value))
  emits('print', getOptions())
}

function onExportPdf() {
  emits('export-pdf', getOptions())
}

function onUpgrade() {
  // navigate to plans page
  router.push('/plans')
}
</script>

<style scoped>


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
  grid-template-columns: 9rem auto;
  align-items: center;
  gap: 0.5rem 1rem;
  line-height: 1rem;
  width: 100%;
}
.pageOptionLabel {
  text-align: right;
  width: 9rem;
  font-size: 0.85rem;
  flex-shrink: 0;
  color: #555;
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
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 0.5rem 0;
}
.mt-3 {
  margin-top: 1rem;
}
.vibItems {
  display: flex;
  flex-flow: wrap;
  gap: 1rem;
  padding-left: 0.5rem;
}
.vibActions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.vibBtn {
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.vibBtn:hover {
  background: #f0f0f0;
  color: #2196F3;
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


:deep(.store-btn) {
    background-color: white !important;
    color: var(--bg-store) !important;
    border: 2px solid var(--bg-store) !important;
    font-weight: bold !important;
}
:deep(.store-btn:hover) {
    background-color: var(--bg-store) !important;
    color: white !important;
}

.upgrade-banner {
  background-color: var(--yellow-50, #fffcf0);
  border: 1px solid var(--yellow-200, #ffe082);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-icon {
  color: var(--yellow-600, #fbc02d);
  font-size: 1.2rem;
}

.banner-text {
  flex: 1;
  font-size: 0.9rem;
  color: var(--yellow-900, #3e2723);
  line-height: 1.3;
}

.p-button-sm {
  white-space: nowrap;
}
.action-with-requirement {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.requirement {
    font-size: 0.75rem;
    font-style: italic;
    color: #f97316;
}
.advanced-printing-hint {
    font-size: 0.85rem;
    font-style: italic;
    color: #f97316;
    text-align: center;
    padding: 0.5rem;
}
</style>
