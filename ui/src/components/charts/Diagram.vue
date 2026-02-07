<template>
    <div>
        <div v-if='placeHolderText.length' class="loading">{{ placeHolderText }}</div>
        <canvas v-else ref="pdfCanvas" class="pdfOutput"></canvas>
        <div v-if="pageCount > 1" class="pageSelector">
            <div v-for="n in pageCount" :key="n" 
                class="onePage" 
                :class="{selected: n === currentPage}" 
                @click="setPage(n)">
                {{ n }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { DiagramService, ChartType } from '../../services/DiagramService';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

let pageRendering = false;
let pdfDoc = null;
let renderTask = null;

const placeHolderText = ref('')
const pdfCanvas = ref(null)
const pdfFile = ref('')
const pdfType = ref(ChartType.Diagram)
const pageCount = ref(0)
const currentPage = ref(1)

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc = pdfWorker;

// Props Management
const props = defineProps({
    pdf: { type: String, required: true },
    // type can be 'diagram' or 'supplement'
    type: { type: String, default: ChartType.Diagram }
})

function loadProps(newProps) {
    // console.log('[Diagram.loadProps] props', newProps);
    pdfFile.value = newProps.pdf;
    pdfType.value = newProps.type || ChartType.Diagram;
    loadPdf();
}

onMounted(async () => {
    loadProps(props);
})

watch(props, (newProps) => {
    // console.log('[Diagram.onWatch] props changed', newProps);
    loadProps(newProps);
})

// End of props management


function loadPdf() {
    if(pdfFile.value == null) {
        placeHolderText.value = 'No Selection';
        return;
    } else if ( pdfFile.value.length == 0) {
        placeHolderText.value = 'No Diagram';
        return
    }
    placeHolderText.value = 'Loading ...'
    pageCount.value = 0;
    if(renderTask) {
        renderTask.cancel();
        renderTask = null;
    }

    DiagramService.getPdf(pdfFile.value, pdfType.value).then( pdfDataBase64 => {
        placeHolderText.value = '';
        // console.log('[ApproachPage.showApproach] image size', pdfData.length)
        
        nextTick(() => {
            getDocument({data:atob(pdfDataBase64)}).promise.then( pdf => {
                pdfDoc = pdf;
                pageCount.value = pdf.numPages;
                console.debug('[Diagram.loadPdf] pageCount', pageCount.value, 'pdf', pdfFile.value);
                setPage(1);
            })
        })
    })
}

function setPage(n) {
    if(!pdfDoc || n < 1 || n > pageCount.value) return;
    currentPage.value = n;

    // Check if a render task is active and cancel it
    if(renderTask) {
        renderTask.cancel();
        renderTask = null;
    }

    pdfDoc.getPage(n).then( page => {
        pageRendering = true;
        // console.log('[ApproachPage.showApproach] Page loaded');

        var scale = 3;
        var viewport = page.getViewport({scale: scale});

        // Prepare canvas using PDF page dimensions
        var canvas = pdfCanvas.value;
        if (!canvas) {
            console.error('[Diagram.loadPdf] Canvas element not found');
            return;
        }
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // console.log('[ApproachPage.showApproach] viewport', viewport);

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            pageRendering = false;
            renderTask = null;
            // console.log('Page rendered');
        }).catch( err => {
            // Rendering cancelled
            pageRendering = false;
        });                    
    })
}


</script>

<style scoped>
.loading {
    font-size: 1.5rem;
    font-weight: 800;
    opacity: 0.3;
    line-height: var(--page-content);    
}

.pdfOutput {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.pageSelector {
    position: absolute;
    bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
}

.onePage {
  background-color: #ffffff;
  border-radius: 3px;
  border: 1px solid lightgrey;
  padding: 8px;
  cursor: pointer;
  min-width: 2rem;
  text-align: center;
}

.selected {
  background-color: var(--bg-choice-active);
}
</style>