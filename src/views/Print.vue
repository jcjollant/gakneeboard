<template>
  <div class="print">
    <PrintOptions v-model:visible="showOptions"
        @options="onOptionsUpdate"
        @print="onPrint"
        />
    <div v-if="template">
      <div v-if="printSingles" v-for="(page,index) in template.data" class="printOnePage printPageBreak">
        <div class="onePage">
          <Page :data="page" :ver="template.ver"
            :class="{flipMode:(index % 2 == 1 && printFlipMode)}"/>
        </div>
      </div>
      <div v-else class="printTwoPages printPageBreak" v-for="(page) in pages">
        <Page :data="page.front" :ver="template.ver"/>
        <Page :data="page.back" :ver="template.ver"
          :class="{flipMode:printFlipMode}" />
      </div>
    </div>
    <div v-else>No Template</div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { LocalStore } from '../lib/LocalStore';
import { useRouter } from 'vue-router';
import { postPrint } from '../assets/data.js';
import Page from '../components/page/Page.vue';
import PrintOptions from '../components/print/PrintOptions.vue';

const pages = ref([])
const printFlipMode = ref(false)
const printSingles = ref(false)
const template = ref(null)
const router = useRouter()
const showOptions = ref(true)
let printing = false

onMounted(() => {
    // console.log('[Print.onMounted]')
    // load last template into active template
    template.value = LocalStore.getTemplate()
    // console.log('[Print.onMounted]', template.value)
    refreshPages()
});

watch(showOptions, (value) => {
    console.log('[Print.showOptions]', value, printing)
    if(!value && !printing) {
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
    } else {
        restorePrintOptions();
    }
}

// Start printing
function onPrint(options) {
  // console.log('[Print.onPrint]')
  printing = true
  showOptions.value = false
//   printFlipMode.value = options.flipBackPage;
//   printSingles.value = (options.pagePerSheet == 1)

  // print window content after a short timeout to let flipmode kickin
  setTimeout( async () => {
    return new Promise( (res) => {
      postPrint(options)
      const preTime = new Date().getTime();
      window.print();
      const postTime = new Date().getTime();
      // on iOS, window.print returns immediately
      if(postTime - preTime > 500) { 
        restorePrintOptions();
      }
      res(true)
      router.back()
    })
  }, 500);
}

function refreshPages() {
    // build a list of side by side pages, used for printing
    const pageList = []
    const templateData = template.value.data
    for( let index = 0; index < templateData.length; index+=2) {
        const pages = {front:templateData[index], back:templateData[index+1]??null}
        pageList.push(pages)
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
</style>