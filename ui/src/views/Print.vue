<template>
  <div class="print">
    <PrintOptionsDialog v-model:visible="showOptions" :pageSelection="pageSelection"
        :format="template?.format"
        @options="onOptionsUpdate"
        @print="onPrint"
        @export-pdf="onExportPdf"
        @laminate="onLaminate"
        @close="showOptions=false"
        />
    <div v-if="template" id="printTemplate" :class="{'single':printFullpage,'fullpage':template.format === TemplateFormat.FullPage}">
      <div v-if="printFullpage" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePager" v-if="pageSelection[Number(index)]">
          <Page :data="page" :format="template.format"
            :style="getPageStyle(false)" />
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages">
        <Page :data="page.front" :format="template.format" :style="getPageStyle(false)" />
        <MarginNotes v-if="printVibShow" class="sidebar" 
            :ver="template.ver" :show="printVibShow" :items="printVibItems" :name="template.name"
            :style="getSideBarStyle(false)"/>
        <MarginNotes v-if="printVibShow" class="sidebar back" 
            :ver="template.ver" :show="printVibShow" :items="printVibItems" :name="template.name"
            :style="getSideBarStyle(true)"/>
        <Page v-if="page.back" :data="page.back" :format="template.format" :style="getPageStyle(printFlipMode)" />
      </div>
    </div>
    <div v-else>No Template</div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { LocalStoreService } from '../services/LocalStoreService';
import { useRoute, useRouter } from 'vue-router';
import { postPrint, currentUser } from '../assets/data.js';
import { Template, TemplatePage } from '../models/Template';
import { exportToPDF, createPDF } from '../assets/pdf'
import { PageType } from '../assets/PageType.js';
import { TemplateFormat, AccountType } from '@gak/shared';
import { PrintOptions } from '../components/print/PrintOptions.js';
import Page from '../components/page/Page.vue';
import PrintOptionsDialog from '../components/print/PrintOptionsDialog.vue';
import MarginNotes from '../components/print/MarginNotes.vue';
import { VerticalInfoBarContent } from '../models/VerticalInfoBarOption.js';
import { StoreService } from '../services/StoreService';

interface PrintSheet {
  front: TemplatePage,
  back: TemplatePage | null
}

const pages = ref<PrintSheet[]>([]) // pages that will be printed
const pageSelection = ref<boolean[]>([])
const printFlipMode = ref(false)
const printFullpage = ref(false)
const printVibShow = ref(true)
const printVibItems = ref<VerticalInfoBarContent[]>([
  VerticalInfoBarContent.Version,
  VerticalInfoBarContent.Tail,
  VerticalInfoBarContent.Date,
  VerticalInfoBarContent.PageName
])
const printClipMargin = ref(0)
const template = ref<Template|undefined>(undefined)

const route = useRoute()
const router = useRouter()
const showOptions = ref(true)
let printing = false

function getPageStyle(flipped: boolean) {
  if (printClipMargin.value === 0 && !flipped) return {};
  
  const baseHeight = printFullpage.value ? 1050 : 800; // Matches CSS variables
  
  const scale = (baseHeight - printClipMargin.value) / baseHeight;
  const transformString = flipped ? `scale(${-scale}, ${-scale})` : `scale(${scale})`;
  return {
    transform: transformString,
    marginTop: `${printClipMargin.value / 2}px`,
    marginBottom: '0px' 
  };
}

onMounted(() => {
    if (!canUserPrint()) {
      redirectToPlansPage()
      return
    }
    
    template.value = LocalStoreService.getTemplate()
    
    if (!template.value.format) {
      template.value.format = TemplateFormat.Kneeboard; 
    }
    
    pageSelection.value = Array(template.value.data.length).fill(true)

    
    if (template.value && template.value.format === TemplateFormat.FullPage) {
      printFullpage.value = true
    }
    
    refreshPages()
});

watch(showOptions, (value) => {
    if(!value && !printing) {
        showOptions.value = false
        router.back()
    }
})

function onOptionsUpdate(options:PrintOptions) {
  if( options) {
      printFlipMode.value = options.flipBackPage;

      pageSelection.value = options.pageSelection
      printVibShow.value = options.vibShow
      printVibItems.value = options.vibItems
      printClipMargin.value = options.clipMargin
      
      if (template.value && template.value.format === TemplateFormat.FullPage) {
        printFullpage.value = true
      }
      
      refreshPages()
  } else {
      restorePrintOptions();
  }
}

/**
 * Create a downloadable PDF document
 * @param options 
 */
async function onExportPdf(options: PrintOptions | undefined) {
  if (!options) return;
  
  if (!canUserPrint()) {
      printing = false
      redirectToPlansPage()
      return
  }
  
  printFullpage.value = true

  await nextTick()
    printing = true
    await new Promise(resolve => setTimeout(resolve, 500));
    

    try {
      const elements = document.querySelectorAll('.onePager')
      console.debug('[Print.onExportPdf] Creating PDF from elements:', elements)
      const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
      const landscape = paperNavlog || false
      if(elements) await exportToPDF(elements, landscape, template.value ? template.value.name : 'kneeboard')
      router.back()
    } catch (error) {
        console.error('Error printing:', error);
    } finally {
        printing = false
        printFullpage.value = false
    }
}

async function onLaminate(options: PrintOptions | undefined) {
  if (!options) return;
  
  printing = true
  showOptions.value = false
  onOptionsUpdate(options)
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const element = document.getElementById('printTemplate')
  const elements = printFullpage.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
  const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
  const landscape:boolean = paperNavlog || !printFullpage.value

  try {
      const blob = await createPDF(elements, landscape);
      
      const file = new File([blob], "kneeboard.pdf", { type: "application/pdf" });
      const result = await StoreService.uploadPdf(currentUser, file);
      
      router.push({ path: '/store', query: { pdfUrl: result.url, pages: result.pagesCount } });
      
  } catch(e) {
      console.error(e);
      alert('Failed to process print for lamination: ' + e);
      printing = false;
      showOptions.value = true;
  }
}

/**
 * Create a PDF that will be printable from the next page
 * @param options 
 */
async function onPrint(options:PrintOptions|undefined) {
  if (!canUserPrint()) {
    printing = false
    redirectToPlansPage()
    return
  }
  
  printing = true
  showOptions.value = false
  postPrint(route.params.id, options)

  const element = document.getElementById('printTemplate')
  const elements = printFullpage.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
  const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
  const landscape:boolean = paperNavlog || !printFullpage.value
  if(element) await exportToPDF(elements, landscape)
  router.back()
}

function refreshPages() {
    const pageList:PrintSheet[] = []
    if(template.value) {
      const templateData = template.value.data
      const pages:TemplatePage[] = templateData.filter( (page:TemplatePage, index:number) => pageSelection.value[index])
      
      if (pages.length === 1 && !printFullpage.value) {
        const blankPage = new TemplatePage(PageType.none)
        const printSheet:PrintSheet = {front:pages[0], back:blankPage}
        pageList.push(printSheet)
      } else {
        for( let index = 0; index < pages.length; index+=2) {
            if (index + 1 < pages.length) {
              const printSheet:PrintSheet = {front:pages[index], back:pages[index+1]}
              pageList.push(printSheet)
            } else {
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
    printFlipMode.value = false;
}

function canUserPrint(): boolean {
  if (!currentUser.loggedIn) {
    return true;
  }
  if (currentUser.accountType !== AccountType.simmer) {
    return true;
  }
  return currentUser.printCredits > 0;
}

function redirectToPlansPage() {
  router.push('/plans?reason=out-of-credits');
}

function getSideBarStyle(isBack: boolean) {
  if (printClipMargin.value === 0) return {};
  const baseHeight = 800;
  const newWidth = baseHeight - printClipMargin.value;
  
  if (!isBack) {
    return {
      top: `${printClipMargin.value}px`,
      width: `${newWidth}px`
    };
  } else {
    return {
      bottom: 'calc(-1.5rem)', 
      width: `${newWidth}px`,
    };
  }
}
</script>

<style scoped>
.print {
  background-color: white;
}

.onePager {
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
  transform: rotate(90deg);
  transform-origin: top left;
}
.sidebar.back {
  transform: rotate(-90deg);
  top:unset;
  bottom:-1.5rem;
}
</style>
