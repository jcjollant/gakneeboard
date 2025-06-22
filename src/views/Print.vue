<template>
  <div class="print">
    <PrintOptions v-model:visible="showOptions" :pageSelection="pageSelection"
        :templateModified="templateModified && template && template.ver > 0"
        :format="template?.format"
        @options="onOptionsUpdate"
        @print="onPrint(false, $event)" @pdf="onPrint(true, $event)"
        @close="showOptions=false"
        />
    <div v-if="template" id="printTemplate" :class="{'single':printSingles}">
      <div v-if="printSingles" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePage" v-if="pageSelection[index]">
          <Page :data="page" :ver="template.ver" :format="template.format"
            :class="{flipMode:(index % 2 == 1 && printFlipMode)}"/>
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages">
        <Page :data="page.front" :ver="template.ver" :format="template.format"/>
        <Page v-if="page.back" :data="page.back" :ver="template.ver" :format="template.format" :class="{flipMode:printFlipMode}" />
      </div>
    </div>
    <div v-else>No Template</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { LocalStore } from '../lib/LocalStore';
import { useRoute, useRouter } from 'vue-router';
import { postPrint } from '../assets/data.js';
import { Template, TemplatePage } from '../model/Template';
import { exportToPDF } from '../assets/pdf'
import { PageType } from '../assets/PageType.js';
import { TemplateFormat } from '../model/TemplateFormat.js';
import Page from '../components/page/Page.vue';
import PrintOptions from '../components/print/PrintOptions.vue';

interface PrintSheet {
  front: TemplatePage,
  back: TemplatePage | null
}

const pages = ref<PrintSheet[]>([]) // pages that will be printed
const pageSelection = ref<boolean[]>([])
const printFlipMode = ref(false)
const printSingles = ref(false)
const template = ref<Template|undefined>(undefined)
const templateModified = ref(false)
const route = useRoute()
const router = useRouter()
const showOptions = ref(true)
let printing = false

onMounted(() => {
    // console.log('[Print.onMounted]')
    // load last template into active template
    template.value = LocalStore.getTemplate()
    
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
function onOptionsUpdate(options) {
  // console.log('[Print.onPrintOptions]', JSON.stringify(options))
  if( options) {
      printFlipMode.value = options.flipBackPage;
      printSingles.value = (options.pagePerSheet == 1)
      pageSelection.value = options.pageSelection
      
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
async function onPrint(pdf:boolean, options) {
  // console.log('[Print.onPrint]')
  printing = true
  showOptions.value = false
  postPrint(route.params.id, options)

  if(true) {
    const element = document.getElementById('printTemplate')
    // count sheets. 
    // Single must accounts for visible otherwise just use pages as is (already filtered)
    // const sheetsCount = printSingles.value ? pageSelection.value.reduce( (acc,visible) => visible ? acc + 1 : acc, 0) : pages.value.length
    const elements = printSingles.value ? document.querySelectorAll('.printOnePage') : document.querySelectorAll('.printTwoPages')
    if(element) await exportToPDF(elements, printSingles.value)
    router.back()
  } else {
    // print window content after a short timeout to let flipmode kickin
    setTimeout( async () => {
      return new Promise( (res) => {
        const preTime = new Date().getTime();
        window.print();
        const postTime = new Date().getTime();
        // on iOS, window.print returns immediately
        if(postTime - preTime > 500) { 
          restorePrintOptions();
        }
        res()
        router.back()
      })
    }, 500);
  } 

}

function refreshPages() {
    // build a list of side by side pages, used for printing
    const pageList:PrintSheet[] = []
    if(template.value) {
      const templateData = template.value.data
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
              const printSheet:PrintSheet = {front:pages[index], back:null}
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

</script>

<style scoped>
.flipMode {
  transform: scale(-1,-1);
}

.onePage {
  display:flex;
  justify-content: center;
}
/* .print {
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 100vh;
} */
.printOnePage {
  display: flex;
  width: 100%;
  justify-content: center;
}
.printTwoPages {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 var(--pages-gap);
  width: fit-content;
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

/* Full page format adjustments */
#printTemplate:has(.contentPage.fullpage) {
  width: calc(var(--fullpage-width) * 2 + var(--pages-gap));
}
#printTemplate.single:has(.contentPage.fullpage) {
  width: var(--fullpage-width);
}
</style>
