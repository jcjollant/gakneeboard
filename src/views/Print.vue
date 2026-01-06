<template>
  <div class="print">
    <PrintOptionsDialog v-model:visible="showOptions" :pageSelection="pageSelection"
        :templateModified="templateModified && template && template.ver > 0"
        :format="template?.format"
        @options="onOptionsUpdate"
        @print="onPrint"
        @close="showOptions=false"
        />
    <div v-if="template" id="printTemplate" :class="{'single':printSingles,'fullpage':template.format === TemplateFormat.FullPage}">
      <div v-if="printSingles" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePage" v-if="pageSelection[index]">
          <Page :data="page" :format="template.format"
            :class="{flipMode:(index % 2 == 1 && printFlipMode)}"
            :style="getPageStyle()" />
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages">
        <Page :data="page.front" :format="template.format" :style="getPageStyle()" />
        <SideBar v-if="printVibOption != VerticalInfoBarOption.hide" class="sidebar" :ver="template.ver" :option="printVibOption" 
            :style="getSideBarStyle(false)"/>
        <SideBar v-if="printVibOption != VerticalInfoBarOption.hide" class="sidebar back" :ver="template.ver" :option="printVibOption" 
            :style="getSideBarStyle(true)"/>
        <Page v-if="page.back" :data="page.back" :format="template.format" :class="{flipMode:printFlipMode}" :style="getPageStyle()" />
      </div>
    </div>
    <div v-else>No Template</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { LocalStoreService } from '../services/LocalStoreService';
import { useRoute, useRouter } from 'vue-router';
import { postPrint, currentUser } from '../assets/data.js';
import { Template, TemplatePage } from '../models/Template';
import { exportToPDF } from '../assets/pdf'
import { PageType } from '../assets/PageType.js';
import { TemplateFormat } from '../models/TemplateFormat.js';
import { AccountType } from '../models/AccounType.js';
import { PrintOptions } from '../components/print/PrintOptions.js';
import Page from '../components/page/Page.vue';
import PrintOptionsDialog from '../components/print/PrintOptionsDialog.vue';
import SideBar from '../components/print/SideBar.vue';
import { VerticalInfoBarOption } from '../models/VerticalInfoBarOption.js';

interface PrintSheet {
  front: TemplatePage,
  back: TemplatePage | null
}

const pages = ref<PrintSheet[]>([]) // pages that will be printed
const pageSelection = ref<boolean[]>([])
const printFlipMode = ref(false)
const printSingles = ref(false)
const printVibOption = ref(VerticalInfoBarOption.all)
const printClipMargin = ref(0)
const template = ref<Template|undefined>(undefined)
const templateModified = ref(false)
const route = useRoute()
const router = useRouter()
const showOptions = ref(true)
let printing = false

onMounted(() => {
    // console.log('[Print.onMounted]')
    // Check if user can print before showing print options
    if (!canUserPrint()) {
      redirectToPlansPage()
      return
    }
    
    // load last template into active template
    template.value = LocalStoreService.getTemplate()
    
    // Ensure the format property is correctly set
    if (!template.value.format) {
      template.value.format = TemplateFormat.Kneeboard; // Default to kneeboard if not set
    }
    
    pageSelection.value = Array(template.value.data.length).fill(true)
    // Check if template is modified from route query params
    templateModified.value = route.query.modified === '1'
    
    // Set printSingles to true for full page templates
    if (template.value && template.value.format === TemplateFormat.FullPage) {
      printSingles.value = true
    }
    
    // console.log('[Print.onMounted]', template.value)
    refreshPages()
});

watch(showOptions, (value) => {
    // console.log('[Print.showOptions]', value, printing)
    if(!value && !printing) {
        showOptions.value = false
        // go back to template mode
        router.back()
    }
})

// New Options have been selected
function onOptionsUpdate(options:PrintOptions) {
  // console.log('[Print.onPrintOptions]', JSON.stringify(options))
  if( options) {
      printFlipMode.value = options.flipBackPage;
      printSingles.value = (options.pagePerSheet == 1)
      pageSelection.value = options.pageSelection
      printVibOption.value = options.vibOption
      printClipMargin.value = options.clipMargin
      
      // Ensure full page templates always use one page per sheet
      if (template.value && template.value.format === TemplateFormat.FullPage) {
        printSingles.value = true
      }
      
      refreshPages()
  } else {
      restorePrintOptions();
  }
}


// Start printing
async function onPrint(options:PrintOptions|undefined) {
  // console.log('[Print.onPrint]')
  
  // Double-check if user can still print before proceeding
  if (!canUserPrint()) {
    printing = false
    redirectToPlansPage()
    return
  }
  
  printing = true
  showOptions.value = false
  postPrint(route.params.id, options)

  const element = document.getElementById('printTemplate')
  // count sheets. 
  // Single must accounts for visible otherwise just use pages as is (already filtered)
  // const sheetsCount = printSingles.value ? pageSelection.value.reduce( (acc,visible) => visible ? acc + 1 : acc, 0) : pages.value.length
  const elements = printSingles.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
  // we only print in landscape mode for double pages and paper navlog
  const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
  const landscape:boolean = paperNavlog || !printSingles.value
  // onePagePerSheet ? 'portrait' : 'landscape'
  if(element) await exportToPDF(elements, landscape)
  router.back()
}

function refreshPages() {
    // build a list of side by side pages, used for printing
    const pageList:PrintSheet[] = []
    if(template.value) {
      const templateData = template.value.data
      // create a list of selected pages
      const pages:TemplatePage[] = templateData.filter( (page:TemplatePage, index:number) => pageSelection.value[index])
      // console.log('[Print.refreshPages]', pages.length)
      
      // If there's only one page and we're printing two pages per sheet,
      // add a temporary blank page
      if (pages.length === 1 && !printSingles.value) {
        // Create a blank page with the same structure as a regular page
        const blankPage = new TemplatePage(PageType.none)
        
        // Add the blank page to the list
        const printSheet:PrintSheet = {front:pages[0], back:blankPage}
        pageList.push(printSheet)
      } else {
        // Normal case with multiple pages or single page mode
        for( let index = 0; index < pages.length; index+=2) {
            // Only create a printSheet with back page if it exists
            if (index + 1 < pages.length) {
              const printSheet:PrintSheet = {front:pages[index], back:pages[index+1]}
              pageList.push(printSheet)
            } else {
              // For the last page when there's an odd number of pages
              const blankPage = new TemplatePage(PageType.none)
              const printSheet:PrintSheet = {front:pages[index], back:blankPage}
              pageList.push(printSheet)
            }
        }
      }
    }
    pages.value = pageList
}

function restorePrintOptions() {
    // Bring everything back to normal
    printFlipMode.value = false;
}

// Check if the current user can print (has credits if they're a free user)
function canUserPrint(): boolean {
  // If user is not logged in, allow printing (guest mode)
  if (!currentUser.loggedIn) {
    return true;
  }
  
  // If user is not a free user (simmer), allow printing
  if (currentUser.accountType !== AccountType.simmer) {
    return true;
  }
  
  // For free users (simmers), check if they have print credits
  return currentUser.printCredits > 0;
}

// Redirect user to plans page with out-of-credits indicator
function redirectToPlansPage() {
  router.push('/plans?reason=out-of-credits');
}

function getPageStyle() {
  if (printClipMargin.value === 0) return {};
  
  // Determine base height based on format
  const isFullPage = template.value && template.value.format === TemplateFormat.FullPage;
  const baseHeight = isFullPage ? 1050 : 800; // Matches CSS variables
  
  // Calculate scale
  const scale = (baseHeight - printClipMargin.value) / baseHeight;
  
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    marginTop: `${printClipMargin.value}px`,
    marginBottom: '0px' // Ensure no extra space at bottom affects flow if possible
  };
}

function getSideBarStyle(isBack: boolean) {
  if (printClipMargin.value === 0) return {};
  
  // Sidebar only used for Kneeboard so height is 800
  const baseHeight = 800;
  const newWidth = baseHeight - printClipMargin.value;
  
  if (!isBack) {
    return {
      top: `${printClipMargin.value}px`,
      width: `${newWidth}px`
    };
  } else {
    // Back sidebar
    return {
      bottom: 'calc(-1.5rem)', // Keep pinned to bottom
      width: `${newWidth}px`,
      // Adjust pivot? No, changing width changes the box size
      // We might need to adjust right/left if width change affects position
    };
  }
}

</script>

<style scoped>
.print {
  background-color: white;
}
.flipMode {
  transform: scale(-1,-1);
}

.onePage {
  display:flex;
  justify-content: center;
}
.printOnePage {
  display: flex;
  width: fit-content;
  justify-content: center;
}
.printTwoPages {
  position: relative;
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 var(--pages-gap);
  width: fit-content;
  height: var(--page-height);
}
/* Add a class to handle single page in two-page layout */
.printTwoPages:has(> :only-child) {
  grid-template-columns: auto;
}
#printTemplate {
  width: var(--page-width-two);
}
#printTemplate.single {
  width: var(--page-width);
}
#printTemplate.single.fullpage {
  width: var(--fullpage-width);
}

/* Full page format adjustments */
#printTemplate:has(.contentPage.fullpage) {
  width: calc(var(--fullpage-width) * 2 + var(--pages-gap));
}
#printTemplate.single:has(.contentPage.fullpage) {
  width: var(--fullpage-width);
}
.sidebar {
  padding: 0 5px;
  position: absolute;
  left: calc( var(--page-width) + var(--pages-gap) / 2);
  top: 0;
  width: var(--page-height);
  height: calc( var(--pages-gap) / 2);
  /* border: 1px solid blue; */
  transform: rotate(90deg);
  transform-origin: top left;
}
.sidebar.back {
  transform: rotate(-90deg);
  /* left: calc( var(--page-width) + var(--pages-gap) / 2); */
  top:unset;
  bottom:-1.5rem;
}
</style>
