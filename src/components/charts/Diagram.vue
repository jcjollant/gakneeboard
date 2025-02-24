<template>
    <div>
        <div v-if='placeHolderText.length' class="loading">{{ placeHolderText }}</div>
        <canvas v-else ref="pdfCanvas" class="pdfOutput"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { DiagramData } from '../../lib/DiagramData';
import { getDocument } from 'pdfjs-dist'

const placeHolderText = ref('')
const pdfCanvas = ref(null)
const pdfFile = ref('')

// Props Management
const props = defineProps({
    pdf: { type: String, required: true },
})

function loadProps(newProps) {
    // console.log('[Diagram.loadProps] props', newProps);
    pdfFile.value = newProps.pdf;
    loadPdf();
}

onMounted(async () => {
    initPDF().then( () => {
        loadProps(props);
    })
})

// watch(props, (newProps) => {
//     console.log('[Diagram.onWatch] props changed', newProps);
//     loadProps(newProps);
// })

// End of props management

const initPDF = async () => {
    const pdfjs = await import('pdfjs-dist/build/pdf')
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

function loadPdf() {
    if(pdfFile.value == null) {
        placeHolderText.value = 'No Selection';
        return;
    } else if ( pdfFile.value.length == 0) {
        placeHolderText.value = 'No Diagram';
        return
    }
    placeHolderText.value = 'Loading ...'

    DiagramData.getPdf(pdfFile.value).then( pdfDataBase64 => {
        placeHolderText.value = '';
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