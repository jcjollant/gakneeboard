<template>
  <div class="print">
    <PrintOptions v-model:visible="showOptions" :pageSelection="pageSelection"
        @options="onOptionsUpdate"
        @print="onPrint(false, $event)" @pdf="onPrint(true, $event)"
        @close="showOptions=false"
        />
    <div v-if="template" id="printTemplate" :class="{'single':printSingles}">
      <div v-if="printSingles" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePage" v-if="pageSelection[index]">
          <Page :data="page" :ver="template.ver"
            :class="{flipMode:(index % 2 == 1 && printFlipMode)}"/>
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages">
        <Page :data="page.front" :ver="template.ver"/>
        <Page :data="page.back" :ver="template.ver" :class="{flipMode:printFlipMode}" />
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
import Page from '../components/page/Page.vue';
import PrintOptions from '../components/print/PrintOptions.vue';
import { Template, TemplatePage } from '../model/Template';
import { exportToPDF } from '../assets/pdf'

interface PrintSheet {
  front: TemplatePage,
  back: TemplatePage
}

const pages = ref<PrintSheet[]>([]) // pages that will be printed
const pageSelection = ref<boolean[]>([])
const printFlipMode = ref(false)
const printSingles = ref(false)
const template = ref<Template|undefined>(undefined)
const route = useRoute()
const router = useRouter()
const showOptions = ref(true)
let printing = false

onMounted(() => {
    // console.log('[Print.onMounted]')
    // load last template into active template
    template.value = LocalStore.getTemplate()
    pageSelection.value = Array(template.value.data.length).fill(true)
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
      for( let index = 0; index < pages.length; index+=2) {
          const printSheet:PrintSheet = {front:pages[index], back:pages[index+1]??null}
          pageList.push(printSheet)
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
#printTemplate {
  width: var(--page-width-two);
}
#printTemplate.single {
  width: var(--page-width)
}
</style>