<template>
    <div>
        <div v-if='loading' class="loading">Loading Approach...</div>
        <canvas v-else ref="pdfCanvas" class="pdfOutput"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Approach } from '../../lib/Approach';
import { getDocument } from 'pdfjs-dist'

const loading = ref(false)
const pdfCanvas = ref(null)
const pdfFile = ref(null)

// Props Management
const props = defineProps({
    pdf: { type: String, default: null },
})

function loadProps(newProps) {
    // console.log('[ApproachPlate.loadProps] props', newProps);
    pdfFile.value = newProps.pdf;
    loadPdf();
}

onMounted(async () => {
    initPDF().then( () => {
        loadProps(props);
    })
})
// End of props management

const initPDF = async () => {
    const pdfjs = await import('pdfjs-dist/build/pdf')

    // const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker')
    pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';
    // pdfjs.GlobalWorkerOptions.workerSrc = PDFJSWorker;
    // pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.worker.min.js'
}



function loadPdf() {
    loading.value = true;
    Approach.getPdf(pdfFile.value).then( pdfDataBase64 => {
        loading.value = false;
        // console.log('[ApproachPage.showApproach] image size', pdfData.length)
        getDocument({data:atob(pdfDataBase64)}).promise.then( pdf => {
            // Get first page
            pdf.getPage(1).then( page => {
                // console.log('[ApproachPage.showApproach] Page loaded');

                var scale = 3;
                var viewport = page.getViewport({scale: scale});

                // Prepare canvas using PDF page dimensions
                var canvas = pdfCanvas.value;
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                // console.log('[ApproachPage.showApproach] viewport', viewport);

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    // console.log('Page rendered');
                });                    
            })
        })
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
</style>