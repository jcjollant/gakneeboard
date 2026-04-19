<template>
  <div class="print">
    <PrintingAnimation :visible="printing" />
    <PrintOptionsDialog v-model:visible="showOptions" :pageSelection="pageSelection"
        :format="template?.format"
        :version="template?.ver"
        @options="onOptionsUpdate"
        @print="onPrint"
        @export-pdf="onExportPdf"
        @laminate="onLaminate"
        @close="showOptions=false"
        />
    <div v-if="template" id="printTemplate" :class="{'single':printFullpage,'fullpage':template.format === TemplateFormat.FullPage}">
      <div v-if="printFullpage" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePager" v-if="pageSelection[Number(index)]">
          <Page :data="page" :format="template.format" :route="template.route"
            :style="getStylePage(false)" />
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages" :style="getStyleTwoPages(false)">
        <Page :data="page.front" :format="template.format" :route="template?.route" :style="getStylePage(false)" />
        <MarginNotes v-if="printVibShow" class="sidebar" 
            :ver="template.ver" :show="printVibShow" :items="printVibItems" :name="template.name" />
        <MarginNotes v-if="printVibShow" class="sidebar back" 
            :ver="template.ver" :show="printVibShow" :items="printVibItems" :name="template.name" />
        <Page v-if="page.back" :data="page.back" :format="template.format" :route="template?.route" :style="getStylePage(printFlipMode)" />
        <CenterGuide v-if="printShowCenterGuide" />
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
import { TemplateFormat, AccountType, UsageType } from '@gak/shared';
import { PrintOptions } from '../components/print/PrintOptions.js';
import { TemplateService } from '../services/TemplateService';
import html2canvas from 'html2canvas-pro';
import { computeSHA256 } from '../assets/Sha';

import Page from '../components/page/Page.vue';
import PrintOptionsDialog from '../components/print/PrintOptionsDialog.vue';
import PrintingAnimation from '../components/print/PrintingAnimation.vue';
import MarginNotes from '../components/print/MarginNotes.vue';
import CenterGuide from '../components/print/CenterGuide.vue';
import { VerticalInfoBarContent } from '../models/VerticalInfoBarOption.js';
import { StoreService } from '../services/StoreService';
import { UsageService } from '../services/UsageService';
import { useToaster } from '../assets/Toaster.js';
import { useToast } from 'primevue/usetoast';
import { AnalyticsService } from '../services/AnalyticsService';

interface PrintSheet {
  front: TemplatePage,
  back: TemplatePage | null
}

const pages = ref<PrintSheet[]>([]) // pages that will be printed
const pageSelection = ref<boolean[]>([])
const printFlipMode = ref(false)
const printFullpage = ref(false)
const printVibShow = ref(true)
const printBackToBack = ref(false)
const printShowCenterGuide = ref(false)
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
const toaster = useToaster(useToast())
const printing = ref(false)

function getStylePage(flipped: boolean) {
  if (printClipMargin.value === 0 && !flipped) return {};
  
  // For FullPage, the baseHeight depends on orientation. 
  // Currently FullPage is forced to landscape paper, so content height is fullpage-width (800)
  const baseHeight = printFullpage.value ? 800 : 800; 
  // Wait, if it was portrait fullpage, it would be 1050. 
  // But for now, both kneeboard (800 high) and landscape fullpage (800 high) are 800.
  // Actually, let's make it explicit.
  const isLandscape = template.value?.format === TemplateFormat.FullPage; // Currently true for all fullpage
  const h = isLandscape ? 800 : (printFullpage.value ? 1050 : 800);

  
  const scale = (h - printClipMargin.value - 1) / h;
  const transformString = flipped ? `scale(${-scale}, ${-scale})` : `scale(${scale})`;

  const marginTop = flipped ? 0 : printClipMargin.value / 2
  const marginBottom = flipped ? printClipMargin.value / 2 : 0

  return {
    transform: transformString,
    marginTop: `${marginTop}px`,
    marginBottom: `${marginBottom}px` 
  };
}

function getStyleTwoPages(flipped: boolean) {
  if (printClipMargin.value === 0 && !flipped) return {};

  return {
      // marginTop: `${printClipMargin.value}px`,
  }
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
    
    refreshPrintSheets()
});

watch(showOptions, (value) => {
    if(!value && !printing.value) {
        showOptions.value = false
        router.back()
    }
})

function onOptionsUpdate(options:PrintOptions) {
  if( options) {
    // console.debug('[Print.onOptionsUpdate] Options:', options)
      printFlipMode.value = options.flipBackPage;

      pageSelection.value = options.pageSelection
      printVibShow.value = options.vibShow
      printVibItems.value = options.vibItems
      printClipMargin.value = options.clipMargin
      printBackToBack.value = options.backToBack
      printShowCenterGuide.value = options.showCenterGuide
      
      if (template.value && template.value.format === TemplateFormat.FullPage) {
        printFullpage.value = true
      }
      
      refreshPrintSheets()
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
  
  if (!currentUser.canExportPdf) {
      toaster.upgrade()
      return
  }
  
  if (!canUserPrint()) {
      printing.value = false
      redirectToPlansPage()
      return
  }
  
  printFullpage.value = true

  AnalyticsService.print(template.value, 'pdf')
  UsageService.declare(UsageType.CreateDoc, { templateId: route.params.id })

  await nextTick()
    printing.value = true
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateThumbnail();
    


    try {
      const elements = document.querySelectorAll('.onePager')
      console.debug('[Print.onExportPdf] Creating PDF from elements:', elements)
      const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
      const isFullPage = template.value?.format === TemplateFormat.FullPage
      const landscape = paperNavlog || isFullPage
      if(elements) await exportToPDF(elements, landscape, template.value ? template.value.name : 'kneeboard')
      router.back()
    } catch (error) {
        console.error('Error printing:', error);
    } finally {
        printing.value = false
        printFullpage.value = false
    }
}

async function onLaminate(options: PrintOptions | undefined) {
  if (!options) return;
  
  printing.value = true
  showOptions.value = false
  AnalyticsService.print(template.value, 'laminate')
  onOptionsUpdate(options)
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  updateThumbnail();

  const elements = printFullpage.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
  const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
  const isFullPage = template.value?.format === TemplateFormat.FullPage
  const landscape:boolean = paperNavlog || !printFullpage.value || isFullPage

  try {
      const blob = await createPDF(elements, landscape);
      
      const file = new File([blob], "kneeboard.pdf", { type: "application/pdf" });
      const result = await StoreService.uploadPdf(currentUser, file);
      
      router.push({ path: '/store', query: { pdfUrl: result.url, pages: result.pagesCount } });
      
  } catch(e) {
      console.error(e);
      toaster.error('That didn\'t work', 'Failed to process print for lamination: ');
      printing.value = false;
      showOptions.value = true;
  }
}

/**
 * Create a PDF that will be printable from the next page
 * @param options 
 */
async function onPrint(options:PrintOptions|undefined) {
  if (!canUserPrint()) {
    printing.value = false
    redirectToPlansPage()
    return
  }
  
  printing.value = true
  showOptions.value = false
  AnalyticsService.print(template.value, 'print')
  const printResult = await postPrint(route.params.id, options)
  
  // If postPrint failed, it returns null
  if (!printResult) {
    printing.value = false
    toaster.error('Print Failed', 'You may be out of print credits.')
    redirectToPlansPage()
    return
  }

  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 1000));
  updateThumbnail();

  const element = document.getElementById('printTemplate')
  const elements = printFullpage.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
  const paperNavlog = template.value && template.value.data.length > 0 && template.value.data[0].type === PageType.paperNavlog
  const isFullPage = template.value?.format === TemplateFormat.FullPage
  const landscape:boolean = paperNavlog || !printFullpage.value || isFullPage
  if(element) await exportToPDF(elements, landscape)
  router.back()
}

async function updateThumbnail() {
  if(!template.value || template.value.id <= 0 || !currentUser.loggedIn) return;
  const index = template.value.id
  // The first printed page (page 0)
  const element = document.querySelector(".page-wrapper") as HTMLElement
  if(!element) return;

  try {
    const canvas = await html2canvas(element, { logging: false, scale: 2 })
    const scaledCanvas = document.createElement('canvas')
    const scaleFactor = 200 / canvas.width;
    scaledCanvas.width = canvas.width * scaleFactor
    scaledCanvas.height = canvas.height * scaleFactor
    const scaledCtx = scaledCanvas.getContext('2d')
    if(!scaledCtx) return
    scaledCtx.scale(scaleFactor, scaleFactor)
    scaledCtx.drawImage(canvas, 0, 0)
    scaledCanvas.toBlob( async (blob) => {
      if(!blob) return
      const sha256 = await computeSHA256(blob)
      if(sha256 != template.value!.thumbHash) {
        const url = await TemplateService.updateThumbnail(index, blob, sha256)
        currentUser.updateThumbnail(index, url, sha256)
      }
    }, 'image.png')
  } catch(e) {
    console.log('[Print.updateThumbnail] failed', e)
  }
}


function refreshPrintSheets() {
  if(!template.value) {
    pages.value = []
    return
  }
  
  const output:PrintSheet[] = []
  const templateData = template.value.data
  const selectedPages:TemplatePage[] = templateData.filter( (page:TemplatePage, index:number) => pageSelection.value[index])
  
  if (selectedPages.length === 1 && !printFullpage.value) {
    // add one blank page padding to the right
    const blankPage = new TemplatePage(PageType.none)
    const printSheet:PrintSheet = {front:selectedPages[0], back:blankPage}
    output.push(printSheet)
  } else if (printBackToBack.value){
    for( let index = 0; index < selectedPages.length; index+=4) {
      const pageOne = selectedPages[index]
      const pageTwo = index+2 < selectedPages.length ? selectedPages[index+2] : new TemplatePage(PageType.none)
      const printSheet1:PrintSheet = {front:pageOne, back:pageTwo}
      output.push(printSheet1)
      const pageThree = index+3 < selectedPages.length ? selectedPages[index+3] : new TemplatePage(PageType.none)
      const pageFour = index+1 < selectedPages.length ? selectedPages[index+1] : new TemplatePage(PageType.none)
      const printSheet2:PrintSheet = {front:pageThree, back:pageFour}
      output.push(printSheet2)
    }
  } else {
    for( let index = 0; index < selectedPages.length; index+=2) {
        if (index + 1 < selectedPages.length) {
          const printSheet:PrintSheet = {front:selectedPages[index], back:selectedPages[index+1]}
          output.push(printSheet)
        } else {
          const blankPage = new TemplatePage(PageType.none)
          const printSheet:PrintSheet = {front:selectedPages[index], back:blankPage}
          output.push(printSheet)
        }
    }
  }
  pages.value = output
}

function restorePrintOptions() {
    printFlipMode.value = false;
}

function canUserPrint(): boolean {
  if (!currentUser.loggedIn) {
    return false;
  }
  return currentUser.printCredits == -1 || currentUser.printCredits > 0
}

function redirectToPlansPage() {
  router.push('/plans?reason=out-of-credits');
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
#printTemplate.single.fullpage:has(.landscape) {
  width: var(--fullpage-height);
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
